import test from 'node:test';
import assert from 'node:assert';
import {
  parseDailyMonitoring,
  parseAstronautProfiles,
  filterRecordsForAstronaut,
  filterRecentRecords,
  getHistoricalRecordsBeforeWindow,
  getDefaultDailyHealthRecords,
  getDefaultAstronautProfiles,
} from '../dataLoader';
import {
  calculateMean,
  calculateStdDev,
  calculatePreMissionBaselines,
  getProfileBaselineValue,
} from '../baselines';
import { calculateHistoricalComparison } from '../historicalComparison';
import { calculatePreMissionComparison } from '../preMissionComparison';
import { identifyPotentialHealthRisks } from '../riskDetection';
import { detectBiometricAnomalies } from '../anomalyDetection';
import { generatePredictiveAnalyticsReport } from '../analyticsService';
import { DailyHealthRecord, AstronautProfileRecord } from '../types';

// ============================================================================
// TEST 1: Correct historical average calculation
// ============================================================================
test('1. Correct historical average calculation', () => {
  const values = [70, 72, 74, 68, 76];
  const mean = calculateMean(values);
  assert.strictEqual(mean, 72.0);

  const emptyMean = calculateMean([]);
  assert.strictEqual(emptyMean, 0);

  const stdDev = calculateStdDev(values, mean);
  assert.strictEqual(stdDev, 3.16);
});

// ============================================================================
// TEST 2: Correct pre-mission baseline calculation
// ============================================================================
test('2. Correct pre-mission baseline calculation from PRE_MISSION records', () => {
  const records: DailyHealthRecord[] = [
    {
      astronaut_id: 'AST999',
      date: '2026-09-01',
      study_day: 1,
      mission_phase: 'PRE_MISSION',
      mission_day: 0,
      heart_rate_bpm: 60,
      systolic_bp_mmhg: 110,
      diastolic_bp_mmhg: 70,
      body_temperature_c: 36.6,
      spo2_percent: 98,
      sleep_hours: 8.0,
      sleep_quality_score_1_to_5: 4,
      mood_score_1_to_5: 4,
      stress_score_1_to_5: 2,
      exercise_minutes: 60,
      symptoms: 'None',
      data_source: 'TEST',
    },
    {
      astronaut_id: 'AST999',
      date: '2026-09-02',
      study_day: 2,
      mission_phase: 'PRE_MISSION',
      mission_day: 0,
      heart_rate_bpm: 64,
      systolic_bp_mmhg: 114,
      diastolic_bp_mmhg: 74,
      body_temperature_c: 36.8,
      spo2_percent: 98,
      sleep_hours: 7.6,
      sleep_quality_score_1_to_5: 4,
      mood_score_1_to_5: 4,
      stress_score_1_to_5: 2,
      exercise_minutes: 60,
      symptoms: 'None',
      data_source: 'TEST',
    },
    {
      astronaut_id: 'AST999',
      date: '2026-10-01',
      study_day: 31,
      mission_phase: 'IN_MISSION',
      mission_day: 1,
      heart_rate_bpm: 90, // In-mission reading should NOT contaminate pre-mission baseline
      systolic_bp_mmhg: 140,
      diastolic_bp_mmhg: 90,
      body_temperature_c: 37.5,
      spo2_percent: 95,
      sleep_hours: 5.0,
      sleep_quality_score_1_to_5: 2,
      mood_score_1_to_5: 2,
      stress_score_1_to_5: 5,
      exercise_minutes: 30,
      symptoms: 'Fatigue',
      data_source: 'TEST',
    },
  ];

  const baselines = calculatePreMissionBaselines(records);
  // Pre-mission HR should be mean of 60 and 64 = 62 BPM, ignoring the in-mission 90 BPM!
  assert.strictEqual(baselines.heart_rate_bpm.count, 2);
  assert.strictEqual(baselines.heart_rate_bpm.mean, 62.0);
  assert.strictEqual(baselines.sleep_hours.mean, 7.8);
});

// ============================================================================
// TEST 3: Correct astronaut-specific filtering
// ============================================================================
test('3. Correct astronaut-specific filtering', () => {
  const allRecords = getDefaultDailyHealthRecords();
  const ast001Records = filterRecordsForAstronaut(allRecords, 'AST001');
  const ast003Records = filterRecordsForAstronaut(allRecords, 'AST003');

  assert.strictEqual(ast001Records.length, 90);
  assert.strictEqual(ast003Records.length, 90);

  // Verify all records belong strictly to the requested astronaut
  assert.ok(ast001Records.every((r) => r.astronaut_id === 'AST001'));
  assert.ok(ast003Records.every((r) => r.astronaut_id === 'AST003'));
});

// ============================================================================
// TEST 4: Correct detection of a sustained seven-day sleep decline (REQUIRED SCENARIO)
// ============================================================================
test('4. Correct detection of a sustained seven-day sleep decline scenario', () => {
  const allRecords = getDefaultDailyHealthRecords();
  const allProfiles = getDefaultAstronautProfiles();
  const ast003Profile = allProfiles.find((p) => p.astronaut_id === 'AST003');
  const ast003Records = filterRecordsForAstronaut(allRecords, 'AST003');

  // AST003 has the 7-day sleep decline inserted on Study Days 72-78
  const risks = identifyPotentialHealthRisks(ast003Records, ast003Profile);
  const sleepRisk = risks.find((r) => r.category === 'sleep_decline');

  assert.ok(sleepRisk !== undefined, 'Should detect a sleep decline risk for AST003');
  assert.strictEqual(sleepRisk?.severity, 'Attention');
  assert.ok(
    sleepRisk?.title.toLowerCase().includes('sleep') &&
    sleepRisk?.title.toLowerCase().includes('decline'),
    'Alert title should mention sleep decline'
  );
  assert.ok(
    sleepRisk?.timing.includes('72') && sleepRisk?.timing.includes('78'),
    'Alert should identify Study Days 72 to 78'
  );
  assert.ok(
    (sleepRisk?.supportingObservations.length ?? 0) >= 7,
    'Should contain supporting observations for each day of the decline'
  );
});

// ============================================================================
// TEST 5: Correct detection of unusually elevated heart rate
// ============================================================================
test('5. Correct detection of unusually elevated heart rate', () => {
  const allRecords = getDefaultDailyHealthRecords();
  const allProfiles = getDefaultAstronautProfiles();
  const ast001Profile = allProfiles.find((p) => p.astronaut_id === 'AST001');
  const ast001Records = filterRecordsForAstronaut(allRecords, 'AST001');

  // AST001 has elevated HR (~78 BPM vs 64 baseline) on Study Days 50-55
  const risks = identifyPotentialHealthRisks(ast001Records, ast001Profile);
  const hrRisk = risks.find((r) => r.category === 'elevated_hr');

  assert.ok(hrRisk !== undefined, 'Should detect elevated HR risk for AST001');
  assert.strictEqual(hrRisk?.severity, 'Attention');
  assert.ok(
    hrRisk?.baselineComparison.includes('64') || hrRisk?.baselineComparison.includes('BPM'),
    'Should state difference from baseline'
  );
});

// ============================================================================
// TEST 6: Correct handling of stable normal readings
// ============================================================================
test('6. Correct handling of stable normal readings without false alerts', () => {
  // Create fixture with completely nominal data perfectly matching baseline
  const nominalRecords: DailyHealthRecord[] = Array.from({ length: 40 }, (_, i) => ({
    astronaut_id: 'AST_NOMINAL',
    date: `2026-10-${String(i + 1).padStart(2, '0')}`,
    study_day: i + 1,
    mission_phase: i < 20 ? 'PRE_MISSION' : 'IN_MISSION',
    mission_day: i < 20 ? 0 : i - 19,
    heart_rate_bpm: 68.0,
    systolic_bp_mmhg: 118.0,
    diastolic_bp_mmhg: 76.0,
    body_temperature_c: 36.7,
    spo2_percent: 98.2,
    sleep_hours: 7.8,
    sleep_quality_score_1_to_5: 4,
    mood_score_1_to_5: 4,
    stress_score_1_to_5: 2,
    exercise_minutes: 100,
    symptoms: 'None',
    data_source: 'TEST',
  }));

  const mockProfile: AstronautProfileRecord = {
    astronaut_id: 'AST_NOMINAL',
    display_name: 'Nominal Test',
    age_years: 36,
    mission_role: 'Specialist',
    baseline_resting_hr_bpm: 68,
    baseline_systolic_bp_mmhg: 118,
    baseline_diastolic_bp_mmhg: 76,
    baseline_temperature_c: 36.7,
    baseline_spo2_percent: 98,
    baseline_sleep_hours: 7.8,
    baseline_stress_score: 2,
    baseline_mood_score: 4,
    baseline_exercise_minutes: 100,
    data_source: 'TEST',
  };

  const risks = identifyPotentialHealthRisks(nominalRecords, mockProfile);
  assert.strictEqual(risks.length, 1);
  assert.strictEqual(risks[0].severity, 'Normal');
  assert.ok(risks[0].title.includes('Nominal Biometric Stability'));

  const anomalies = detectBiometricAnomalies(nominalRecords, mockProfile);
  assert.strictEqual(anomalies.length, 0, 'No anomalies should be flagged for nominal readings');
});

// ============================================================================
// TEST 7: Correct handling of missing data
// ============================================================================
test('7. Correct handling of missing data and empty arrays', () => {
  const emptyReport = generatePredictiveAnalyticsReport('NON_EXISTENT_ID', '30d');
  assert.strictEqual(emptyReport.isInsufficientData, true);
  assert.strictEqual(emptyReport.timeSeries.length, 0);
  assert.strictEqual(emptyReport.overviewCards.heartRate.value, 'N/A');

  const emptyComp = calculateHistoricalComparison([], 7);
  assert.strictEqual(emptyComp.isInsufficientData, true);
});

// ============================================================================
// TEST 8: Correct handling of insufficient history
// ============================================================================
test('8. Correct handling of insufficient history', () => {
  // Only 2 records available
  const shortHistory: DailyHealthRecord[] = [
    {
      astronaut_id: 'AST_SHORT',
      date: '2026-11-01',
      study_day: 1,
      mission_phase: 'PRE_MISSION',
      mission_day: 0,
      heart_rate_bpm: 70,
      systolic_bp_mmhg: 120,
      diastolic_bp_mmhg: 80,
      body_temperature_c: 36.6,
      spo2_percent: 98,
      sleep_hours: 7.5,
      sleep_quality_score_1_to_5: 4,
      mood_score_1_to_5: 4,
      stress_score_1_to_5: 2,
      exercise_minutes: 60,
      symptoms: 'None',
      data_source: 'TEST',
    },
    {
      astronaut_id: 'AST_SHORT',
      date: '2026-11-02',
      study_day: 2,
      mission_phase: 'PRE_MISSION',
      mission_day: 0,
      heart_rate_bpm: 72,
      systolic_bp_mmhg: 122,
      diastolic_bp_mmhg: 82,
      body_temperature_c: 36.7,
      spo2_percent: 98,
      sleep_hours: 7.3,
      sleep_quality_score_1_to_5: 4,
      mood_score_1_to_5: 4,
      stress_score_1_to_5: 2,
      exercise_minutes: 60,
      symptoms: 'None',
      data_source: 'TEST',
    },
  ];

  const comp = calculateHistoricalComparison(shortHistory, 7);
  assert.strictEqual(comp.isInsufficientData, true);
  assert.ok(comp.insufficientReason?.includes('Insufficient historical baseline'));
});

// ============================================================================
// TEST 9: Correct date ordering
// ============================================================================
test('9. Correct date ordering', () => {
  const unsortedCsv = `astronaut_id,date,study_day,mission_phase,mission_day,heart_rate_bpm,systolic_bp_mmhg,diastolic_bp_mmhg,body_temperature_c,spo2_percent,sleep_hours,sleep_quality_score_1_to_5,mood_score_1_to_5,stress_score_1_to_5,exercise_minutes,symptoms,data_source
AST001,2026-09-03,3,PRE_MISSION,0,67.9,115.4,72.7,36.64,98.4,7.7,4,4,4,103,None,SIM
AST001,2026-09-01,1,PRE_MISSION,0,65.0,111.8,76.3,36.87,96.6,6.7,4,4,2,95,None,SIM
AST001,2026-09-02,2,PRE_MISSION,0,66.5,116.3,77.4,36.78,97.4,7.7,3,5,2,107,None,SIM`;

  const parsed = parseDailyMonitoring(unsortedCsv);
  assert.strictEqual(parsed[0].study_day, 1);
  assert.strictEqual(parsed[1].study_day, 2);
  assert.strictEqual(parsed[2].study_day, 3);
  assert.strictEqual(parsed[0].date, '2026-09-01');
  assert.strictEqual(parsed[2].date, '2026-09-03');
});

// ============================================================================
// TEST 10: Correct 7/30/90-day filtering
// ============================================================================
test('10. Correct 7/30/90-day filtering', () => {
  const allRecords = getDefaultDailyHealthRecords();
  const ast001Records = filterRecordsForAstronaut(allRecords, 'AST001');

  const rec7 = filterRecentRecords(ast001Records, 7);
  assert.strictEqual(rec7.length, 7);
  assert.strictEqual(rec7[rec7.length - 1].study_day, 90);
  assert.strictEqual(rec7[0].study_day, 84);

  const rec30 = filterRecentRecords(ast001Records, 30);
  assert.strictEqual(rec30.length, 30);
  assert.strictEqual(rec30[0].study_day, 61);

  const rec90 = filterRecentRecords(ast001Records, 90);
  assert.strictEqual(rec90.length, 90);
  assert.strictEqual(rec90[0].study_day, 1);
});

// ============================================================================
// TEST 11: No mixing of astronaut identities
// ============================================================================
test('11. No mixing of astronaut identities in baselines or comparisons', () => {
  const allRecords = getDefaultDailyHealthRecords();
  const allProfiles = getDefaultAstronautProfiles();

  // Generate reports for two different astronauts
  const report1 = generatePredictiveAnalyticsReport('AST001', '30d', allRecords, allProfiles);
  const report2 = generatePredictiveAnalyticsReport('AST002', '30d', allRecords, allProfiles);

  assert.strictEqual(report1.astronautId, 'AST001');
  assert.strictEqual(report2.astronautId, 'AST002');
  assert.strictEqual(report1.astronautName, 'Commander A');
  assert.strictEqual(report2.astronautName, 'Specialist B');

  // Verify baseline HR in preMissionComparison matches their respective profiles
  const hrComp1 = report1.preMissionComparisons.find((c) => c.metricKey === 'heart_rate_bpm');
  const hrComp2 = report2.preMissionComparisons.find((c) => c.metricKey === 'heart_rate_bpm');

  assert.strictEqual(hrComp1?.profileBaseline, 64);
  assert.strictEqual(hrComp2?.profileBaseline, 68);
});

// ============================================================================
// TEST 12: No false alerts caused by invalid numeric values
// ============================================================================
test('12. No false alerts caused by invalid numeric values (NaN, null, strings)', () => {
  const dirtyCsv = `astronaut_id,date,study_day,mission_phase,mission_day,heart_rate_bpm,systolic_bp_mmhg,diastolic_bp_mmhg,body_temperature_c,spo2_percent,sleep_hours,sleep_quality_score_1_to_5,mood_score_1_to_5,stress_score_1_to_5,exercise_minutes,symptoms,data_source
AST_TEST,2026-11-01,1,IN_MISSION,1,NaN,,null,undefined,,7.5,4,4,2,0,None,SIM
AST_TEST,2026-11-02,2,IN_MISSION,2,INVALID,120,80,36.6,98,7.5,4,4,2,0,None,SIM`;

  const parsed = parseDailyMonitoring(dirtyCsv);
  assert.ok(Number.isNaN(parsed[0].heart_rate_bpm));

  // Should handle dirty data safely without throwing errors or generating false anomalies
  const anomalies = detectBiometricAnomalies(parsed);
  assert.strictEqual(anomalies.length, 0);

  const risks = identifyPotentialHealthRisks(parsed);
  assert.ok(risks.length >= 1);
});
