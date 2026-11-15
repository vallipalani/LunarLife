import { AstronautProfile } from '../types';
import type { WearableDevice, WearableReading } from './wearableData';
import {
  AssessmentNextStep,
  AssessmentObservation,
  AssessmentStatus,
  EscalationNotice,
  HealthAssessmentRecord,
  HealthCheckId,
  HealthCheckResult,
  QuestionAnswer,
  SymptomReport,
} from './types';

/**
 * Validates numeric inputs for each health check type
 */
export function validateCheckInput(
  checkId: HealthCheckId,
  values: Record<string, string | number>
): { isValid: boolean; error?: string } {
  switch (checkId) {
    case 'heart-rate': {
      const hr = Number(values.heartRate);
      if (isNaN(hr)) return { isValid: false, error: 'Please enter a numeric heart rate in BPM.' };
      if (hr < 35 || hr > 220) return { isValid: false, error: 'Heart rate must be between 35 and 220 BPM.' };
      if (values.spo2 !== undefined && values.spo2 !== '') {
        const spo2 = Number(values.spo2);
        if (isNaN(spo2) || spo2 < 70 || spo2 > 100) {
          return { isValid: false, error: 'Blood oxygen (SpO2) must be between 70% and 100%.' };
        }
      }
      if (values.hrv !== undefined && values.hrv !== '') {
        const hrv = Number(values.hrv);
        if (isNaN(hrv) || hrv < 5 || hrv > 250) {
          return { isValid: false, error: 'Heart rate variability (HRV) must be between 5 and 250 ms.' };
        }
      }
      return { isValid: true };
    }
    case 'blood-pressure': {
      const sys = Number(values.systolic);
      const dia = Number(values.diastolic);
      if (isNaN(sys) || isNaN(dia))
        return { isValid: false, error: 'Please enter valid numbers for both systolic and diastolic pressure.' };
      if (sys < 60 || sys > 240) return { isValid: false, error: 'Systolic pressure must be between 60 and 240 mmHg.' };
      if (dia < 40 || dia > 140) return { isValid: false, error: 'Diastolic pressure must be between 40 and 140 mmHg.' };
      if (dia >= sys) return { isValid: false, error: 'Systolic pressure must be greater than diastolic pressure.' };
      return { isValid: true };
    }
    case 'body-temperature': {
      const temp = Number(values.temperature);
      if (isNaN(temp)) return { isValid: false, error: 'Please enter a numeric temperature in °C.' };
      if (temp < 34.0 || temp > 42.0)
        return { isValid: false, error: 'Body temperature must be between 34.0°C and 42.0°C.' };
      return { isValid: true };
    }
    case 'sleep-fatigue': {
      const hours = Number(values.sleepHours);
      const quality = Number(values.sleepQuality);
      if (isNaN(hours) || hours < 0 || hours > 24)
        return { isValid: false, error: 'Please enter valid sleep hours (0 to 24).' };
      if (isNaN(quality) || quality < 1 || quality > 10)
        return { isValid: false, error: 'Sleep quality rating must be between 1 and 10.' };
      return { isValid: true };
    }
    case 'mood-stress': {
      const stress = Number(values.stressLevel);
      if (isNaN(stress) || stress < 1 || stress > 5)
        return { isValid: false, error: 'Stress rating must be between 1 and 5.' };
      return { isValid: true };
    }
    default:
      return { isValid: true };
  }
}

/**
 * Checks for clinical red flags based on reported symptoms, severity, and questionnaire answers
 */
export function evaluateEscalation(
  symptomReport: SymptomReport,
  answers: QuestionAnswer[],
  checks: HealthCheckResult[]
): EscalationNotice {
  const reasons: string[] = [];
  const directives: string[] = [];

  // 1. Severe overall symptom grade
  if (symptomReport.severity === 'severe') {
    reasons.push('Overall symptom severity graded as SEVERE by astronaut.');
  }

  // 2. Question red-flag answers
  for (const ans of answers) {
    const val = Array.isArray(ans.value) ? ans.value : [ans.value];
    if (val.includes('thunderclap')) {
      reasons.push('Sudden onset severe ("thunderclap") cranial pain reported.');
    }
    if (val.includes('tunnel-vision') || val.includes('diplopia') || val.includes('sudden-loss')) {
      reasons.push('Acute visual disturbances (tunnel vision, diplopia, or field loss) reported.');
    }
    if (val.includes('asymmetric-weakness') || val.includes('asymmetric-arm') || val.includes('asymmetric-leg')) {
      reasons.push('Unilateral / asymmetric muscle weakness detected.');
    }
    if (val.includes('severe-vomiting') || val.includes('recurrent-vomiting') || val.includes('intolerant')) {
      reasons.push('Persistent vomiting with oral fluid intolerance; dehydration risk.');
    }
    if (val.includes('chest-constriction')) {
      reasons.push('Persistent chest tightness or somatic constriction reported.');
    }
    if (val.includes('neck-stiffness')) {
      reasons.push('Nuchal rigidity / neck stiffness reported with headache.');
    }
    if (val.includes('overwhelmed')) {
      reasons.push('Operational cognitive capacity overwhelmed.');
    }
  }

  // 3. Vitals threshold flags
  for (const check of checks) {
    if (check.isUnavailable || check.status === 'skipped') continue;

    if (check.checkId === 'heart-rate') {
      const hr = Number(check.recordedValues.heartRate);
      if (hr > 125) reasons.push(`Tachycardia detected: Resting heart rate ${hr} BPM exceeds safe flight limit (>125).`);
      if (hr < 45) reasons.push(`Severe bradycardia: Resting heart rate ${hr} BPM is dangerously low (<45).`);
    }

    if (check.checkId === 'blood-pressure') {
      const sys = Number(check.recordedValues.systolic);
      const dia = Number(check.recordedValues.diastolic);
      if (sys > 165 || dia > 105) {
        reasons.push(`Hypertensive reading: Blood pressure ${sys}/${dia} mmHg requires clinical stabilization.`);
      }
      if (sys < 85) {
        reasons.push(`Hypotensive reading: Systolic blood pressure ${sys} mmHg may cause syncopal episode.`);
      }
    }

    if (check.checkId === 'body-temperature') {
      const temp = Number(check.recordedValues.temperature);
      if (temp >= 38.3) reasons.push(`Elevated core temperature (${temp}°C) indicates febrile response / infection.`);
      if (temp < 35.5) reasons.push(`Low core temperature (${temp}°C) indicates hypothermic shift.`);
    }
  }

  const isEscalated = reasons.length > 0;

  if (isEscalated) {
    directives.push('Immediately stand down from any planned Extravehicular Activity (EVA) or critical robotics ops.');
    directives.push('Notify Flight Surgeon at Ground Medical Support Console via direct space-to-ground link.');
    directives.push('Relocate to crew quarters, assume passive seated/neutral body posture, and hydrate if tolerated.');
    directives.push('Ensure crewmate or secondary astronaut is informed of current health status.');

    return {
      isEscalated: true,
      urgency: 'urgent-flight-surgeon',
      headline: 'MEDICAL ESCALATION NOTICE: Ground Flight Surgeon Review Required',
      reasons,
      immediateDirectives: directives,
    };
  }

  return {
    isEscalated: false,
    urgency: 'routine',
    headline: 'Biometrics Nominal for Spaceflight Routine',
    reasons: [],
    immediateDirectives: [],
  };
}

/**
 * Generates automated clinical observations based on recorded data and astronaut's baseline.
 * Clearly differentiates automated analytical deductions from user records.
 */
export function generateObservations(
  symptomReport: SymptomReport,
  answers: QuestionAnswer[],
  checks: HealthCheckResult[],
  astronaut: AstronautProfile
): AssessmentObservation[] {
  const observations: AssessmentObservation[] = [];

  // 1. Observation on reported symptoms
  observations.push({
    id: 'obs-symptoms',
    category: 'symptom-pattern',
    type: symptomReport.severity === 'severe' ? 'critical' : symptomReport.severity === 'moderate' ? 'warning' : 'info',
    title: `Symptom Complex: ${symptomReport.selectedSymptoms.map((s) => s.replace('-', ' ')).join(', ')}`,
    description: `Astronaut reports ${symptomReport.severity.toUpperCase()} symptoms with onset ${symptomReport.duration.replace(/-/g, ' ')}. ${
      symptomReport.description ? `Notes: "${symptomReport.description}".` : 'No additional free-text notes provided.'
    }`,
  });

  // 2. Observations on vitals vs astronaut baselines
  for (const check of checks) {
    if (check.isUnavailable || check.status === 'skipped') {
      observations.push({
        id: `obs-skip-${check.checkId}`,
        category: 'vital',
        type: 'info',
        title: `${check.title}: Measurement Not Available`,
        description: `This diagnostic check was skipped (${check.unavailableReason || 'equipment unavailable or deferred'}). Re-check when operational schedule permits.`,
      });
      continue;
    }

    if (check.checkId === 'heart-rate') {
      const hr = Number(check.recordedValues.heartRate);
      const isElevated = hr > 85;
      const isDepressed = hr < 58;

      observations.push({
        id: 'obs-hr',
        category: 'vital',
        type: isElevated || isDepressed ? 'warning' : 'positive',
        title: `Heart Rate: ${hr} BPM vs Baseline (${astronaut.baselineHeartRate})`,
        description: isElevated
          ? `Resting pulse is elevated above astronaut Alex Morgan's typical baseline (${astronaut.baselineHeartRate}). Indicates possible sympathetic arousal, mild dehydration, or vestibular compensation.`
          : isDepressed
          ? `Resting pulse is below baseline (${astronaut.baselineHeartRate}). Check for athletic bradycardia or autonomic vagal tone.`
          : `Resting pulse aligns well with pre-mission baseline (${astronaut.baselineHeartRate}). Cardiovascular stability maintained.`,
      });

      if (check.recordedValues.spo2 !== undefined && check.recordedValues.spo2 !== '') {
        const spo2 = Number(check.recordedValues.spo2);
        observations.push({
          id: 'obs-spo2',
          category: 'vital',
          type: spo2 < 95 ? 'warning' : 'positive',
          title: `Blood Oxygen (SpO2): ${spo2}%`,
          description:
            spo2 < 95
              ? `Peripheral oxygen saturation (${spo2}%) is below nominal cabin flight threshold (≥95%). Check cabin partial oxygen pressure (ppO2) and posture.`
              : `Blood oxygen saturation (${spo2}%) demonstrates optimal pulmonary gas diffusion under habitat atmospheric pressure.`,
        });
      }

      if (check.recordedValues.hrv !== undefined && check.recordedValues.hrv !== '') {
        const hrv = Number(check.recordedValues.hrv);
        observations.push({
          id: 'obs-hrv',
          category: 'vital',
          type: 'positive',
          title: `Heart Rate Variability (HRV): ${hrv} ms`,
          description: `R-R interval autonomic variation (${hrv} ms) indicates balanced parasympathetic response and healthy cardiovascular recovery dynamics.`,
        });
      }
    }

    if (check.checkId === 'blood-pressure') {
      const sys = Number(check.recordedValues.systolic);
      const dia = Number(check.recordedValues.diastolic);
      const isHigh = sys > 130 || dia > 85;
      const isLow = sys < 100 || dia < 60;

      observations.push({
        id: 'obs-bp',
        category: 'vital',
        type: isHigh || isLow ? 'warning' : 'positive',
        title: `Blood Pressure: ${sys}/${dia} mmHg vs Baseline (${astronaut.baselineBloodPressure})`,
        description: isHigh
          ? `Pressure exceeds astronaut's baseline (${astronaut.baselineBloodPressure}). In zero-G, cephalic fluid shift and intracranial vascular tone may elevate upper-body arterial pressure.`
          : isLow
          ? `Arterial pressure is below baseline (${astronaut.baselineBloodPressure}). May correlate with orthostatic intolerance or hypovolemia.`
          : `Arterial pressure is in equilibrium with baseline screening (${astronaut.baselineBloodPressure}).`,
      });
    }

    if (check.checkId === 'body-temperature') {
      const temp = Number(check.recordedValues.temperature);
      const isFever = temp >= 37.5;
      const isLow = temp < 36.3;
      const isSkinTemp = check.provenance?.temperature?.source === 'wearable-simulated';

      observations.push({
        id: 'obs-temp',
        category: 'vital',
        type: isFever ? 'warning' : isLow ? 'info' : 'positive',
        title: `${isSkinTemp ? 'Skin Temperature' : 'Core Temperature'}: ${temp}°C vs Baseline (${astronaut.baselineBodyTemp})`,
        description: isSkinTemp
          ? `Wearable dermal sensor reading (${temp}°C) indicates nominal peripheral microgravity thermoregulation. Dermal temperature typically tracks ~0.2–0.5°C below core tympanic baseline (${astronaut.baselineBodyTemp}).`
          : isFever
          ? `Mild temperature elevation relative to baseline (${astronaut.baselineBodyTemp}). Space flight microgravity impairs convective cooling; ensure hydration and monitor for viral/bacterial signs.`
          : isLow
          ? `Core temperature slightly below normal baseline (${astronaut.baselineBodyTemp}). Check crew module environmental thermal settings.`
          : `Core temperature is in thermal equilibrium with baseline (${astronaut.baselineBodyTemp}).`,
      });
    }

    if (check.checkId === 'sleep-fatigue') {
      const hours = Number(check.recordedValues.sleepHours);
      const quality = Number(check.recordedValues.sleepQuality);
      const sleepDeficit = hours < 6.5;
      const isEstimated = check.provenance?.sleepHours?.isEstimated;

      observations.push({
        id: 'obs-sleep',
        category: 'baseline-variance',
        type: sleepDeficit ? 'warning' : 'positive',
        title: `Sleep Duration: ${hours}h vs Target Baseline (${astronaut.baselineSleep})${isEstimated ? ' [Estimated]' : ''}`,
        description: sleepDeficit
          ? `Sleep duration fell short of the 8.0h baseline by ${(8.0 - hours).toFixed(1)} hours (Restorativeness: ${quality}/10). Cumulative sleep debt impairs situational reaction times.${isEstimated ? ' Note: Duration estimated from sleep mat sensor algorithm.' : ''}`
          : `Sleep duration (${hours}h) meets targeted rest parameters (Restorativeness: ${quality}/10).${isEstimated ? ' Inferred from circadian sleep tracking algorithm.' : ''}`,
      });
    }

    if (check.checkId === 'mood-stress') {
      const stress = Number(check.recordedValues.stressLevel);
      observations.push({
        id: 'obs-mood',
        category: 'microgravity-adaptation',
        type: stress >= 4 ? 'warning' : stress >= 3 ? 'info' : 'positive',
        title: `Cognitive & Stress Rating: Level ${stress}/5 (Baseline: ${astronaut.baselineMood})`,
        description:
          stress >= 4
            ? `High cognitive strain reported. Mission task pacing and stress-mitigation protocols advised.`
            : `Operational mental composure remains within acceptable flight parameters.`,
      });
    }
  }

  return observations;
}

/**
 * Formulates structured next steps and actionable guidance
 */
export function generateNextSteps(
  symptomReport: SymptomReport,
  escalation: EscalationNotice,
  checks: HealthCheckResult[]
): AssessmentNextStep[] {
  const steps: AssessmentNextStep[] = [];

  if (escalation.isEscalated) {
    steps.push({
      id: 'step-esc-1',
      priority: 'urgent',
      action: 'Notify Flight Surgeon via Ground Medical Link',
      details:
        'Transmit this completed assessment summary to Johnson Space Center / EAC Flight Surgeon console for clinical evaluation.',
    });
    steps.push({
      id: 'step-esc-2',
      priority: 'urgent',
      action: 'Stand Down from Hazardous Duties',
      details: 'Temporarily pause any EVA preparation, manual robotics docking, or heavy maintenance tasks.',
    });
  }

  // Hydration step if fatigue, headache, dizziness, or nausea reported
  const needsHydration = symptomReport.selectedSymptoms.some((s) =>
    ['fatigue', 'headache', 'dizziness', 'nausea'].includes(s)
  );
  if (needsHydration) {
    steps.push({
      id: 'step-hyd',
      priority: 'recommended',
      action: 'Hydration & Electrolyte Countermeasure',
      details:
        'Consume 500 mL of oral electrolyte solution over the next 45 minutes to counteract microgravity intravascular volume reduction.',
    });
  }

  // Sleep countermeasure if sleep or fatigue reported
  if (symptomReport.selectedSymptoms.includes('sleep-difficulties') || symptomReport.selectedSymptoms.includes('fatigue')) {
    steps.push({
      id: 'step-sleep',
      priority: 'recommended',
      action: 'Optimize Crew Quarters Circadian Sleep Environment',
      details:
        'Engage 450nm blue-attenuated cabin lighting 60 minutes prior to sleep period; verify sleep restraint ventilation fan velocity.',
    });
  }

  // Headache / neck relief
  if (symptomReport.selectedSymptoms.includes('headache') || symptomReport.selectedSymptoms.includes('back-pain')) {
    steps.push({
      id: 'step-posture',
      priority: 'routine',
      action: 'Neutral Body Posture & Spinal Decompression',
      details:
        'Assume passive neutral zero-G posture or gentle fetal tuck for 15 minutes to relieve lumbar spinal lengthening and paraspinal tension.',
    });
  }

  // Routine recheck step
  steps.push({
    id: 'step-recheck',
    priority: 'routine',
    action: 'Follow-Up Biometric Check in 4 Hours',
    details:
      'Log an updated pulse and blood pressure telemetry check in 4 hours to verify physiological trend resolution.',
  });

  return steps;
}

/**
 * Builds the complete HealthAssessmentRecord
 */
export function compileAssessmentRecord(
  astronaut: AstronautProfile,
  symptomReport: SymptomReport,
  answers: QuestionAnswer[],
  checks: HealthCheckResult[],
  wearableSummary?: { device: WearableDevice; readings: WearableReading[] }
): HealthAssessmentRecord {
  const escalation = evaluateEscalation(symptomReport, answers, checks);
  const observations = generateObservations(symptomReport, answers, checks, astronaut);
  const nextSteps = generateNextSteps(symptomReport, escalation, checks);

  let status: AssessmentStatus = 'Completed';
  if (escalation.isEscalated) {
    status = 'Urgent Escalation';
  } else if (symptomReport.severity === 'moderate' || checks.some((c) => c.status === 'abnormal')) {
    status = 'Requires Medical Review';
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')} UTC`;

  return {
    id: `ASSESS-${Date.now()}`,
    astronautId: astronaut.astronautId,
    astronautName: astronaut.name,
    missionDay: astronaut.missionDay,
    timestamp: `${dateStr} ${timeStr}`,
    status,
    symptomReport,
    answers,
    healthChecks: checks,
    observations,
    nextSteps,
    escalation,
    wearableSummary,
    storageType: 'Mission Session Cache',
  };
}
