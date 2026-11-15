import { HealthCheckConfig, HealthCheckId, SymptomCategory } from './types';

export const HEALTH_CHECKS_CONFIG: Record<HealthCheckId, HealthCheckConfig> = {
  'heart-rate': {
    id: 'heart-rate',
    title: 'Heart Rate & Pulse Telemetry',
    parameter: 'Resting Pulse Rate',
    unit: 'BPM',
    purpose:
      'Evaluates autonomic cardiovascular balance, microgravity baroreceptor tone, and potential tachycardia or bradycardia.',
    instructions: [
      'Ensure you are anchored in your crew station restraint and seated comfortably.',
      'Remain calm and still for at least 30 seconds before taking the reading.',
      'Check reading on your wireless pulse oximeter finger sensor or read current optical PPG telemetry from your mission band.',
      'Enter the stable resting value in BPM below.',
    ],
    equipment: 'Crew Medical Kit Finger Pulse Oximeter / Bio-Telemetry Smart Band',
    baselineKey: 'baselineHeartRate',
    nominalRangeText: '60 – 100 BPM (Nominal Astronaut Range: 65 – 75 BPM)',
    inputConfig: {
      type: 'single-number',
      fields: [
        {
          name: 'heartRate',
          label: 'Heart Rate (BPM)',
          placeholder: 'e.g. 72',
          unit: 'BPM',
          min: 35,
          max: 220,
          step: 1,
        },
        {
          name: 'spo2',
          label: 'Blood Oxygen (SpO2 %)',
          placeholder: 'e.g. 98',
          unit: '%',
          min: 70,
          max: 100,
          step: 1,
        },
        {
          name: 'hrv',
          label: 'Heart Rate Variability (HRV)',
          placeholder: 'e.g. 58',
          unit: 'ms',
          min: 10,
          max: 200,
          step: 1,
        },
      ],
    },
  },

  'blood-pressure': {
    id: 'blood-pressure',
    title: 'Blood Pressure Assessment',
    parameter: 'Brachial Arterial Pressure',
    unit: 'mmHg',
    purpose:
      'Monitors headward vascular fluid redistribution, orthostatic regulation, and mean arterial perfusion pressure.',
    instructions: [
      'Locate the automated non-invasive blood pressure (NIBP) arm cuff from Drawer MED-02.',
      'Position the cuff snug on your left upper arm, 2 cm above the elbow crease, aligned at heart level.',
      'Rest your forearm on the workstation surface and breathe evenly without speaking.',
      'Initiate cuff measurement and record the systolic and diastolic numbers shown.',
    ],
    equipment: 'LunarLife Automated Non-Invasive Blood Pressure (NIBP) Monitor',
    baselineKey: 'baselineBloodPressure',
    nominalRangeText: 'Systolic 90–120 / Diastolic 60–80 mmHg (Alex Baseline: 110/70–120/80 mmHg)',
    inputConfig: {
      type: 'dual-number',
      fields: [
        {
          name: 'systolic',
          label: 'Systolic (mmHg)',
          placeholder: 'e.g. 118',
          unit: 'mmHg',
          min: 60,
          max: 240,
          step: 1,
        },
        {
          name: 'diastolic',
          label: 'Diastolic (mmHg)',
          placeholder: 'e.g. 78',
          unit: 'mmHg',
          min: 40,
          max: 140,
          step: 1,
        },
      ],
    },
  },

  'body-temperature': {
    id: 'body-temperature',
    title: 'Core Body Temperature',
    parameter: 'Tympanic Core Temperature',
    unit: '°C',
    purpose:
      'Monitors thermoregulation in microgravity, detecting low-grade infection, subclinical inflammation, or space flight fever.',
    instructions: [
      'Take the infrared tympanic ear thermometer from the Crew Diagnostic Module.',
      'Attach a fresh hygienic probe cover.',
      'Gently pull ear pinna backward and insert probe snug into ear canal until acoustic confirmation beep sounds.',
      'Enter the Celsius reading.',
    ],
    equipment: 'Infrared Tympanic Thermometer / Continuous Thermal Dermal Patch',
    baselineKey: 'baselineBodyTemp',
    nominalRangeText: '36.5°C – 37.2°C (Core Thermal Equilibrium)',
    inputConfig: {
      type: 'single-number',
      fields: [
        {
          name: 'temperature',
          label: 'Core Temperature (°C)',
          placeholder: 'e.g. 36.8',
          unit: '°C',
          min: 34.0,
          max: 42.0,
          step: 0.1,
        },
      ],
    },
  },

  'sleep-fatigue': {
    id: 'sleep-fatigue',
    title: 'Sleep Duration & Fatigue Check',
    parameter: 'Sleep Architecture & Recovery',
    unit: 'Score / Hours',
    purpose:
      'Quantifies recent restorative sleep duration against baseline needs to gauge cumulative circadian sleep debt.',
    instructions: [
      'Review recorded sleep telemetry from your crew quarters smart sleep mat or estimate your last rest period.',
      'Rate the perceived restorative quality of your sleep on a scale from 1 (Exhausted / restless) to 10 (Deep / fully refreshed).',
      'Enter the actual hours slept.',
    ],
    equipment: 'Crew Quarters Sleep Telemetry Mat / Subjective Sleep Quality Log',
    baselineKey: 'baselineSleep',
    nominalRangeText: '7.5 – 8.5 Hours Restful (Alex Baseline: 8.0 hours)',
    inputConfig: {
      type: 'rating-and-hours',
      fields: [
        {
          name: 'sleepHours',
          label: 'Recorded Sleep Duration (Hours)',
          placeholder: 'e.g. 7.5',
          unit: 'hours',
          min: 0,
          max: 18,
          step: 0.5,
        },
        {
          name: 'sleepQuality',
          label: 'Sleep Restorativeness Rating (1–10)',
          placeholder: 'e.g. 8',
          unit: '/10',
          min: 1,
          max: 10,
          step: 1,
        },
      ],
    },
  },

  'mood-stress': {
    id: 'mood-stress',
    title: 'Mood & Operational Readiness Self-Check',
    parameter: 'Psychological & Cognitive State',
    unit: 'Readiness Scale',
    purpose:
      'Evaluates behavioral health, operational cognitive load, mental fatigue, and acute situational stress.',
    instructions: [
      'Reflect on your present mental clarity, stress levels, and emotional composure.',
      'Select your current operational strain rating from 1 (Calm & Focused) to 5 (High Acute Strain).',
      'Provide a brief descriptor of your cognitive readiness for complex mission tasks.',
    ],
    equipment: 'Standard NASA Operational Readiness Questionnaire Framework',
    baselineKey: 'baselineMood',
    nominalRangeText: 'Level 1 – 2 (Nominal Mission Composure; Baseline: Stable)',
    inputConfig: {
      type: 'scale',
      fields: [
        {
          name: 'stressLevel',
          label: 'Stress / Strain Level (1: Calm, 5: High Strain)',
          placeholder: '1 to 5',
          min: 1,
          max: 5,
          step: 1,
        },
      ],
    },
  },
};

/**
 * Dynamically determines which guided health checks are most relevant based on reported symptoms.
 * Checks are ordered by clinical priority.
 */
export function getRecommendedHealthChecks(selectedSymptoms: SymptomCategory[]): HealthCheckId[] {
  if (!selectedSymptoms.length) {
    return ['heart-rate', 'blood-pressure'];
  }

  const checkScores: Record<HealthCheckId, number> = {
    'heart-rate': 0,
    'blood-pressure': 0,
    'body-temperature': 0,
    'sleep-fatigue': 0,
    'mood-stress': 0,
  };

  selectedSymptoms.forEach((s) => {
    switch (s) {
      case 'dizziness':
        checkScores['blood-pressure'] += 4;
        checkScores['heart-rate'] += 3;
        checkScores['body-temperature'] += 1;
        break;
      case 'fatigue':
        checkScores['sleep-fatigue'] += 4;
        checkScores['heart-rate'] += 2;
        checkScores['mood-stress'] += 2;
        break;
      case 'headache':
        checkScores['blood-pressure'] += 4;
        checkScores['body-temperature'] += 3;
        checkScores['heart-rate'] += 2;
        break;
      case 'nausea':
        checkScores['body-temperature'] += 3;
        checkScores['blood-pressure'] += 2;
        checkScores['heart-rate'] += 2;
        break;
      case 'muscle-weakness':
        checkScores['heart-rate'] += 2;
        checkScores['blood-pressure'] += 2;
        checkScores['sleep-fatigue'] += 1;
        break;
      case 'sleep-difficulties':
        checkScores['sleep-fatigue'] += 5;
        checkScores['mood-stress'] += 3;
        checkScores['heart-rate'] += 1;
        break;
      case 'stress':
        checkScores['mood-stress'] += 5;
        checkScores['heart-rate'] += 3;
        checkScores['blood-pressure'] += 2;
        break;
      case 'vision-changes':
        checkScores['blood-pressure'] += 4;
        checkScores['heart-rate'] += 2;
        break;
      case 'back-pain':
        checkScores['sleep-fatigue'] += 2;
        checkScores['mood-stress'] += 1;
        break;
    }
  });

  // Return checks that scored at least 1, sorted by highest score
  const sorted = (Object.keys(checkScores) as HealthCheckId[])
    .filter((id) => checkScores[id] > 0)
    .sort((a, b) => checkScores[b] - checkScores[a]);

  // Ensure at least top 2 checks are returned
  return sorted.length >= 2 ? sorted : ['heart-rate', 'blood-pressure'];
}
