export type PageId =
  | 'dashboard'
  | 'ai-assistant'
  | 'health-profile-info'
  | 'health-profile-analytics'
  | 'health-profile-recommendations'
  | 'crew-health'
  | 'settings'
  |'adaptive-assessment';

export interface AstronautProfile {
  name: string;
  astronautId: string;
  role: string;
  mission: string;
  missionDay: string;
  age: number;
  bloodGroup: string;
  height: string;
  weight: string;
  avatarUrl: string;
  status: 'Stable' | 'Monitor' | 'Attention';
  healthScore: number;
  // Medical Details
  existingConditions: string[];
  allergies: string[];
  medications: string[];
  // Baselines
  baselineHeartRate: string;
  baselineBloodPressure: string;
  baselineBodyTemp: string;
  baselineSleep: string;
  baselineMood: string;
  // Pre-mission summary
  preMissionSummary: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'notice' | 'alert' | 'success';
}

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Good' | 'Monitor' | 'Attention';
  subtext: string;
  trend?: string;
  iconName: 'Heart' | 'Activity' | 'Thermometer' | 'Moon' | 'Smile';
}

export interface DailyTask {
  id: string;
  title: string;
  category?: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChartDataPoint {
  time: string;
  heartRate?: number;
  sleepHours?: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: 'Physical Activity' | 'Sleep Management' | 'Stress Management' | 'Preventive Health';
  completed: boolean;
}
// ----------------------------------------------------------------------------
// Person 5: Personalised Health Profile & Integration/Database Types
// ----------------------------------------------------------------------------

export interface PersonalBaseline {
  restingHeartRate: number; // BPM
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  bodyTemperature: number; // °C
  spo2: number; // %
  sleepHours: number; // hrs
  exerciseMinutes: number; // min
  stressScore: number; // 1-5
  moodScore: number; // 1-5
  calibratedFrom: 'Pre-Mission Medical Screening' | '60-Day Rolling Average' | 'Flight Surgeon Protocol';
  lastRecalibrated: string;
}

export interface PreMissionAssessmentRecord {
  astronautId: string;
  certificationNumber: string;
  clinicalFacility: string;
  flightClearance: 'CLASS I FLIGHT CERTIFIED' | 'QUALIFIED WITH WAIVER' | 'RESTRICTED';
  examiningFlightSurgeon: string;
  certificationDate: string;
  expirationDate: string;
  cardiovascularStress: {
    protocol: string;
    vo2Max: number;
    restingHr: number;
    maxHr: number;
    ecgSummary: string;
  };
  boneMineralDensity: {
    lumbarTScore: number;
    femoralTScore: number;
    dxaStatus: 'Normal Bone Mass' | 'Osteopenia Risk' | 'Monitored';
  };
  pulmonaryFunction: {
    fvcLiters: number;
    fev1Liters: number;
    baselineSpo2: number;
  };
  vestibularAdaptation: {
    sotScore: number;
    motionSicknessSusceptibility: 'Low' | 'Moderate' | 'High';
  };
  laboratoryBaselineSummary: string;
  generalClinicalNotes: string;
}

export interface HistoricalHealthMeasurement {
  id: string;
  astronautId: string;
  date: string;
  missionPhase: 'PRE_MISSION' | 'IN_FLIGHT' | 'POST_MISSION';
  missionDay: number;
  heartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  bodyTemperatureC: number;
  spo2Percent: number;
  sleepHours: number;
  sleepQuality: number;
  moodScore: number;
  stressScore: number;
  exerciseMinutes: number;
  symptoms: string;
  dataProvenance: 'CSV_DATABASE' | 'LOCAL_MANUAL_ENTRY';
  status: 'Normal' | 'Monitor' | 'Review';
}

export interface SelfExaminationRecord {
  id: string;
  astronautId: string;
  date: string;
  examinationType: 'Cardiovascular Auscultation' | 'Orthostatic Tolerance' | 'Visual Acuity & SANS' | 'Neuromuscular & Reflexes';
  findings: string;
  outcome: 'Passed / Normal' | 'Minor Anomaly Observed' | 'Escalate to Flight Surgeon';
  notes: string;
  examiner: string;
}
