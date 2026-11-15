import { HealthAssessmentRecord } from './types';

const STORAGE_KEY = 'lunarlife_adaptive_health_assessments_v1';

export const INITIAL_HISTORICAL_ASSESSMENTS: HealthAssessmentRecord[] = [
  {
    id: 'ASSESS-DAY118-01',
    astronautId: 'AST-024',
    astronautName: 'Alex Morgan',
    missionDay: 'DAY 118',
    timestamp: '2026-11-09 14:30 UTC',
    status: 'Completed',
    symptomReport: {
      selectedSymptoms: ['fatigue', 'muscle-weakness'],
      severity: 'mild',
      duration: '2-to-12-hours',
      description: 'Post-EVA muscle soreness in trapezius and forearms after 6.5h airlock operation.',
      reportedAt: '2026-11-09 14:20 UTC',
    },
    answers: [
      {
        questionId: 'fat-duration',
        symptomId: 'fatigue',
        questionText: 'How long have you been experiencing this fatigue?',
        value: 'today-only',
      },
      {
        questionId: 'fat-sleep-hours',
        symptomId: 'fatigue',
        questionText: 'How many hours of sleep did you achieve in your most recent rest interval?',
        value: '6-to-7.5',
      },
      {
        questionId: 'musc-distribution',
        symptomId: 'muscle-weakness',
        questionText: 'Which muscle groups are primarily affected?',
        value: ['shoulders-arms'],
      },
      {
        questionId: 'musc-symmetry',
        symptomId: 'muscle-weakness',
        questionText: 'Is the weakness symmetric or isolated to one limb/side?',
        value: 'symmetric',
      },
    ],
    healthChecks: [
      {
        checkId: 'heart-rate',
        title: 'Heart Rate & Pulse Telemetry',
        recordedValues: { heartRate: 74 },
        displaySummary: '74 BPM',
        status: 'nominal',
        comparedToBaseline: 'Within baseline range (65–75 BPM)',
        recordedAt: '2026-11-09 14:25 UTC',
      },
      {
        checkId: 'blood-pressure',
        title: 'Blood Pressure Assessment',
        recordedValues: { systolic: 116, diastolic: 76 },
        displaySummary: '116/76 mmHg',
        status: 'nominal',
        comparedToBaseline: 'Nominal vs baseline (110/70–120/80 mmHg)',
        recordedAt: '2026-11-09 14:27 UTC',
      },
      {
        checkId: 'sleep-fatigue',
        title: 'Sleep Duration & Fatigue Check',
        recordedValues: { sleepHours: 7.2, sleepQuality: 8 },
        displaySummary: '7.2h (Quality 8/10)',
        status: 'nominal',
        comparedToBaseline: 'Near 8.0h baseline',
        recordedAt: '2026-11-09 14:28 UTC',
      },
    ],
    observations: [
      {
        id: 'obs-1',
        category: 'symptom-pattern',
        type: 'info',
        title: 'Symptom Complex: fatigue, muscle weakness',
        description: 'Mild exertional soreness consistent with EVA spacesuit glove and shoulder resistance.',
      },
      {
        id: 'obs-2',
        category: 'vital',
        type: 'positive',
        title: 'Vitals Nominal',
        description: 'Heart rate 74 BPM and BP 116/76 mmHg confirm rapid cardiovascular recovery post-EVA.',
      },
    ],
    nextSteps: [
      {
        id: 'ns-1',
        priority: 'recommended',
        action: 'Electrolyte Hydration & High-Protein Snack',
        details: 'Consume 400 mL electrolyte beverage with targeted branch-chain amino acids.',
      },
      {
        id: 'ns-2',
        priority: 'routine',
        action: 'Scheduled Rest Cycle',
        details: 'Full 8-hour sleep period protected; no midnight telemetry interruptions.',
      },
    ],
    escalation: {
      isEscalated: false,
      urgency: 'routine',
      headline: 'Biometrics Nominal for Spaceflight Routine',
      reasons: [],
      immediateDirectives: [],
    },
    storageType: 'Mission Session Cache',
  },
  {
    id: 'ASSESS-DAY112-02',
    astronautId: 'AST-024',
    astronautName: 'Alex Morgan',
    missionDay: 'DAY 112',
    timestamp: '2026-11-03 07:15 UTC',
    status: 'Requires Medical Review',
    symptomReport: {
      selectedSymptoms: ['headache', 'dizziness'],
      severity: 'moderate',
      duration: 'less-than-2-hours',
      description: 'Morning cephalic fullness and mild vertigo when turning head rapidly in module Columbus.',
      reportedAt: '2026-11-03 07:05 UTC',
    },
    answers: [
      {
        questionId: 'diz-onset',
        symptomId: 'dizziness',
        questionText: 'When did the dizziness begin, and under what circumstances?',
        value: 'posture-change',
      },
      {
        questionId: 'diz-pattern',
        symptomId: 'dizziness',
        questionText: 'Is the sensation continuous or occasional?',
        value: 'triggered',
      },
      {
        questionId: 'head-location',
        symptomId: 'headache',
        questionText: 'Where is the pain predominantly located?',
        value: 'frontal-eyes',
      },
      {
        questionId: 'head-severity',
        symptomId: 'headache',
        questionText: 'How severe is the cranial pain on a 1–10 scale?',
        value: '5',
      },
    ],
    healthChecks: [
      {
        checkId: 'blood-pressure',
        title: 'Blood Pressure Assessment',
        recordedValues: { systolic: 128, diastolic: 84 },
        displaySummary: '128/84 mmHg',
        status: 'abnormal',
        comparedToBaseline: 'Slightly elevated (+8 mmHg systolic above baseline)',
        recordedAt: '2026-11-03 07:10 UTC',
      },
      {
        checkId: 'heart-rate',
        title: 'Heart Rate & Pulse Telemetry',
        recordedValues: { heartRate: 80 },
        displaySummary: '80 BPM',
        status: 'nominal',
        comparedToBaseline: '+5 BPM over nominal rest baseline',
        recordedAt: '2026-11-03 07:11 UTC',
      },
      {
        checkId: 'body-temperature',
        title: 'Core Body Temperature',
        recordedValues: { temperature: 36.9 },
        displaySummary: '36.9°C',
        status: 'nominal',
        comparedToBaseline: 'Nominal thermal balance (36.5–37.2°C)',
        recordedAt: '2026-11-03 07:12 UTC',
      },
    ],
    observations: [
      {
        id: 'obs-h1',
        category: 'vital',
        type: 'warning',
        title: 'Blood Pressure Elevated to 128/84 mmHg',
        description: 'Slightly elevated systolic arterial pressure correlates with microgravity headward cephalic fluid shift.',
      },
      {
        id: 'obs-h2',
        category: 'symptom-pattern',
        type: 'warning',
        title: 'Frontal Headache & Positional Dizziness',
        description: 'Typical presentation for transient space adaptation syndrome or cabin ppCO2 elevation.',
      },
    ],
    nextSteps: [
      {
        id: 'nsh-1',
        priority: 'recommended',
        action: 'Check Cabin Environmental CO2 Telemetry',
        details: 'Verify environmental control system partial pressure of carbon dioxide (ppCO2 < 2.5 mmHg).',
      },
      {
        id: 'nsh-2',
        priority: 'recommended',
        action: 'Fluid Redistribution Countermeasure',
        details: 'Use lower-body negative pressure (LBNP) or elastic thigh cuffs if cleared by medical officer.',
      },
    ],
    escalation: {
      isEscalated: false,
      urgency: 'medical-consult',
      headline: 'Non-Critical Microgravity Fluid Shift Presentation',
      reasons: [],
      immediateDirectives: [],
    },
    storageType: 'Mission Session Cache',
  },
];

/**
 * Loads assessment history from localStorage with fallback to predefined mission records
 */
export function getAssessmentHistory(): HealthAssessmentRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      return INITIAL_HISTORICAL_ASSESSMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_HISTORICAL_ASSESSMENTS;
  } catch (err) {
    console.warn('Failed to load assessments from localStorage, using initial records:', err);
    return INITIAL_HISTORICAL_ASSESSMENTS;
  }
}

/**
 * Saves a new completed assessment record to history
 */
export function saveAssessmentToHistory(record: HealthAssessmentRecord): HealthAssessmentRecord[] {
  const current = getAssessmentHistory();
  // Prepend newest assessment
  const updated = [record, ...current.filter((item) => item.id !== record.id)];

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Failed to persist assessment to localStorage:', err);
  }

  return updated;
}

/**
 * Fetches an individual assessment by ID
 */
export function getAssessmentById(id: string): HealthAssessmentRecord | undefined {
  const all = getAssessmentHistory();
  return all.find((item) => item.id === id);
}

/**
 * Resets history to the default mission baseline records
 */
export function resetAssessmentHistory(): HealthAssessmentRecord[] {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORICAL_ASSESSMENTS));
    }
  } catch {}
  return INITIAL_HISTORICAL_ASSESSMENTS;
}
