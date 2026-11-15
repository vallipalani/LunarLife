import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdaptiveQuestionsForSymptoms } from '../questionsData';
import { getRecommendedHealthChecks } from '../healthChecksData';
import {
  validateCheckInput,
  evaluateEscalation,
  generateObservations,
  generateNextSteps,
  compileAssessmentRecord,
} from '../assessmentLogic';
import {
  getAssessmentHistory,
  saveAssessmentToHistory,
  getAssessmentById,
  INITIAL_HISTORICAL_ASSESSMENTS,
} from '../historyStorage';
import {
  createInitialWearableReadings,
  refreshWearableTelemetry,
  WEARABLE_DEVICE_INFO,
} from '../wearableData';
import { AstronautProfile } from '../../types';
import { initialAstronautProfile } from '../../data';
import { SymptomReport, QuestionAnswer, HealthCheckResult } from '../types';

test('1. Adaptive questions change based on selected symptoms', () => {
  const dizzinessQuestions = getAdaptiveQuestionsForSymptoms(['dizziness']);
  assert.ok(dizzinessQuestions.length >= 4, 'Dizziness should return multiple targeted questions');
  assert.ok(
    dizzinessQuestions.some((q) => q.text.includes('dizziness begin')),
    'Should include onset question'
  );
  assert.ok(
    dizzinessQuestions.some((q) => q.text.includes('continuous or occasional')),
    'Should include pattern question'
  );

  const fatigueQuestions = getAdaptiveQuestionsForSymptoms(['fatigue']);
  assert.ok(
    fatigueQuestions.some((q) => q.text.includes('hours of sleep')),
    'Should include sleep hours question'
  );
  assert.ok(
    !fatigueQuestions.some((q) => q.text.includes('continuous or occasional')),
    'Fatigue alone should NOT include dizziness pattern question'
  );
});

test('2. Multiple symptoms combine questions without redundant duplication', () => {
  const combinedQuestions = getAdaptiveQuestionsForSymptoms(['dizziness', 'fatigue']);
  const ids = combinedQuestions.map((q) => q.id);

  // Both symptoms represented
  assert.ok(ids.includes('diz-onset'));
  assert.ok(ids.includes('fat-duration'));

  // Deduplication check: weakness cross question is deduplicated
  const weaknessQuestions = combinedQuestions.filter(
    (q) => q.id === 'diz-weakness-cross' || q.id === 'fat-weakness-cross'
  );
  assert.equal(weaknessQuestions.length, 1, 'Weakness cross-check should be deduplicated');
});

test('3. Guided health checks adapt dynamically to symptoms', () => {
  const dizzinessChecks = getRecommendedHealthChecks(['dizziness']);
  assert.ok(
    dizzinessChecks.includes('blood-pressure'),
    'Dizziness should prioritize blood pressure'
  );
  assert.ok(dizzinessChecks.includes('heart-rate'), 'Dizziness should include heart rate');

  const sleepChecks = getRecommendedHealthChecks(['sleep-difficulties']);
  assert.ok(
    sleepChecks.includes('sleep-fatigue'),
    'Sleep difficulties should prioritize sleep-fatigue check'
  );
  assert.ok(sleepChecks.includes('mood-stress'), 'Sleep difficulties should include mood-stress');
});

test('4. Input validation enforces safe physiological ranges', () => {
  // Valid HR
  assert.equal(validateCheckInput('heart-rate', { heartRate: 72 }).isValid, true);
  // Invalid HR
  assert.equal(validateCheckInput('heart-rate', { heartRate: 300 }).isValid, false);
  assert.equal(validateCheckInput('heart-rate', { heartRate: 'abc' }).isValid, false);

  // Valid BP
  assert.equal(
    validateCheckInput('blood-pressure', { systolic: 120, diastolic: 80 }).isValid,
    true
  );
  // Invalid BP (diastolic >= systolic)
  assert.equal(
    validateCheckInput('blood-pressure', { systolic: 80, diastolic: 120 }).isValid,
    false
  );
  // Invalid BP (out of range)
  assert.equal(
    validateCheckInput('blood-pressure', { systolic: 350, diastolic: 80 }).isValid,
    false
  );

  // Valid Temp
  assert.equal(validateCheckInput('body-temperature', { temperature: 36.8 }).isValid, true);
  // Invalid Temp
  assert.equal(validateCheckInput('body-temperature', { temperature: 45.0 }).isValid, false);
});

test('5. Medical escalation flags trigger correctly on severe symptoms or red-flag answers', () => {
  const severeReport: SymptomReport = {
    selectedSymptoms: ['headache'],
    severity: 'severe',
    duration: 'less-than-2-hours',
    description: 'Sudden debilitating pain',
    reportedAt: '2026-11-15 12:00 UTC',
  };

  const redFlagAnswers: QuestionAnswer[] = [
    {
      questionId: 'head-onset',
      symptomId: 'headache',
      questionText: 'When did the headache begin?',
      value: 'thunderclap',
    },
  ];

  const escalation = evaluateEscalation(severeReport, redFlagAnswers, []);
  assert.equal(escalation.isEscalated, true);
  assert.equal(escalation.urgency, 'urgent-flight-surgeon');
  assert.ok(escalation.reasons.length >= 2, 'Should list both severe grade and thunderclap');
  assert.ok(escalation.immediateDirectives.length > 0, 'Should provide immediate safety directives');
});

test('6. Normal symptoms and nominal vitals do not trigger false escalation', () => {
  const nominalReport: SymptomReport = {
    selectedSymptoms: ['fatigue'],
    severity: 'mild',
    duration: '2-to-12-hours',
    description: 'Mild end-of-shift tiredness',
    reportedAt: '2026-11-15 12:00 UTC',
  };

  const nominalAnswers: QuestionAnswer[] = [
    {
      questionId: 'fat-duration',
      symptomId: 'fatigue',
      questionText: 'Duration?',
      value: 'today-only',
    },
  ];

  const nominalChecks: HealthCheckResult[] = [
    {
      checkId: 'heart-rate',
      title: 'Heart Rate',
      recordedValues: { heartRate: 70 },
      displaySummary: '70 BPM',
      status: 'nominal',
      recordedAt: '2026-11-15 12:05 UTC',
    },
  ];

  const escalation = evaluateEscalation(nominalReport, nominalAnswers, nominalChecks);
  assert.equal(escalation.isEscalated, false);
  assert.equal(escalation.urgency, 'routine');
});

test('7. Observations compare recorded values against astronaut profile baselines', () => {
  const report: SymptomReport = {
    selectedSymptoms: ['fatigue'],
    severity: 'mild',
    duration: '1-to-2-days',
    description: '',
    reportedAt: '2026-11-15 12:00 UTC',
  };

  const checks: HealthCheckResult[] = [
    {
      checkId: 'heart-rate',
      title: 'Heart Rate & Pulse Telemetry',
      recordedValues: { heartRate: 95 },
      displaySummary: '95 BPM',
      status: 'abnormal',
      recordedAt: '2026-11-15 12:05 UTC',
    },
  ];

  const observations = generateObservations(report, [], checks, initialAstronautProfile);
  assert.ok(observations.length >= 2);

  const hrObs = observations.find((o) => o.id === 'obs-hr');
  assert.ok(hrObs, 'Heart rate observation should exist');
  assert.ok(
    hrObs.description.includes(initialAstronautProfile.baselineHeartRate),
    'Observation should mention astronaut baseline heart rate'
  );
  assert.equal(hrObs.type, 'warning', 'Elevated HR should be flagged as warning');
});

test('8. Full assessment record compiles with valid status, observations, and next steps', () => {
  const report: SymptomReport = {
    selectedSymptoms: ['dizziness'],
    severity: 'mild',
    duration: 'less-than-2-hours',
    description: 'Mild vestibular adaptation',
    reportedAt: '2026-11-15 12:00 UTC',
  };

  const answers: QuestionAnswer[] = [
    {
      questionId: 'diz-pattern',
      symptomId: 'dizziness',
      questionText: 'Pattern?',
      value: 'triggered',
    },
  ];

  const checks: HealthCheckResult[] = [
    {
      checkId: 'heart-rate',
      title: 'Heart Rate',
      recordedValues: { heartRate: 72 },
      displaySummary: '72 BPM',
      status: 'nominal',
      recordedAt: '2026-11-15 12:05 UTC',
    },
  ];

  const record = compileAssessmentRecord(initialAstronautProfile, report, answers, checks);
  assert.ok(record.id.startsWith('ASSESS-'));
  assert.equal(record.astronautId, initialAstronautProfile.astronautId);
  assert.equal(record.status, 'Completed');
  assert.ok(record.nextSteps.length > 0, 'Should generate actionable next steps');
  assert.ok(record.observations.length > 0, 'Should generate structured observations');
});

test('9. Assessment history loading and record retrieval', () => {
  const history = getAssessmentHistory();
  assert.ok(history.length >= 2, 'Default history should contain mock records');

  const first = history[0];
  const fetched = getAssessmentById(first.id);
  assert.ok(fetched);
  assert.equal(fetched?.id, first.id);
});

test('10. Wearable telemetry provides realistic readings distinguishing direct measurements from algorithm estimates', () => {
  const readings = createInitialWearableReadings();
  assert.equal(readings.length, 6, 'Wearable should support 6 reading types');

  const hr = readings.find((r) => r.type === 'heart-rate');
  assert.ok(hr);
  assert.equal(hr?.isEstimated, false, 'Heart rate is a direct sensor measurement');
  assert.ok(Number(hr?.value) >= 60 && Number(hr?.value) <= 100);

  const spo2 = readings.find((r) => r.type === 'blood-oxygen');
  assert.ok(spo2);
  assert.equal(spo2?.isEstimated, false, 'SpO2 is a direct sensor measurement');

  const hrv = readings.find((r) => r.type === 'hrv');
  assert.ok(hrv);
  assert.equal(hrv?.isEstimated, false, 'HRV is a direct sensor measurement');

  const skinTemp = readings.find((r) => r.type === 'skin-temperature');
  assert.ok(skinTemp);
  assert.equal(skinTemp?.isEstimated, false, 'Skin temperature is a direct sensor measurement');

  const sleep = readings.find((r) => r.type === 'sleep-duration');
  assert.ok(sleep);
  assert.equal(sleep?.isEstimated, true, 'Sleep duration must be clearly marked as estimated');

  const activity = readings.find((r) => r.type === 'activity');
  assert.ok(activity);
  assert.equal(activity?.isEstimated, true, 'Activity metrics must be marked as estimated');
});

test('11. SpO2 and HRV input validation enforces clinical boundaries', () => {
  // Valid SpO2 and HRV
  const valid = validateCheckInput('heart-rate', { heartRate: 72, spo2: 98, hrv: 55 });
  assert.equal(valid.isValid, true);

  // Invalid SpO2 (< 70)
  const invalidSpo2 = validateCheckInput('heart-rate', { heartRate: 72, spo2: 65 });
  assert.equal(invalidSpo2.isValid, false);
  assert.ok(invalidSpo2.error?.includes('SpO2'));

  // Invalid HRV (> 250)
  const invalidHrv = validateCheckInput('heart-rate', { heartRate: 72, hrv: 400 });
  assert.equal(invalidHrv.isValid, false);
  assert.ok(invalidHrv.error?.includes('HRV'));
});

test('12. Refreshing wearable telemetry updates timestamps and keeps simulated flag', () => {
  const { device, readings } = refreshWearableTelemetry(2, false);
  assert.equal(device.isSimulated, true, 'Must clearly identify as simulated prototype');
  assert.ok(device.lastSyncTimestamp.includes('UTC'), 'Timestamp should contain UTC sync time');
  assert.equal(readings.length, 6);
});

test('13. Full assessment compiles with wearable summary and field provenance', () => {
  const report: SymptomReport = {
    selectedSymptoms: ['fatigue'],
    severity: 'mild',
    duration: 'today-only' as any,
    description: 'Post-workout fatigue',
    reportedAt: '2026-11-15 13:00 UTC',
  };

  const checks: HealthCheckResult[] = [
    {
      checkId: 'heart-rate',
      title: 'Heart Rate',
      recordedValues: { heartRate: 74, spo2: 98, hrv: 58 },
      displaySummary: '74 BPM • SpO2 98% • HRV 58ms',
      status: 'nominal',
      recordedAt: '2026-11-15 13:05 UTC',
      provenance: {
        heartRate: {
          fieldName: 'heartRate',
          source: 'wearable-simulated',
          sourceDevice: 'ASTRA BioBand Mk-IV [Simulated]',
          timestamp: '13:04 UTC',
          isEstimated: false,
          isManuallyEdited: false,
          originalWearableValue: 74,
        },
      },
    },
  ];

  const { device, readings } = refreshWearableTelemetry(1);
  const record = compileAssessmentRecord(initialAstronautProfile, report, [], checks, {
    device,
    readings,
  });

  assert.ok(record.wearableSummary, 'Assessment record should include wearableSummary');
  assert.equal(record.wearableSummary?.device.isSimulated, true);
  assert.equal(record.healthChecks[0].provenance?.heartRate.source, 'wearable-simulated');
  assert.equal(record.healthChecks[0].provenance?.heartRate.isManuallyEdited, false);
});
