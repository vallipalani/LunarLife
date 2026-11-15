import { AstronautProfile } from '../types';
import type { FieldProvenance, WearableDevice, WearableReading } from './wearableData';

export type SymptomCategory =
  | 'dizziness'
  | 'fatigue'
  | 'headache'
  | 'nausea'
  | 'muscle-weakness'
  | 'sleep-difficulties'
  | 'stress'
  | 'vision-changes'
  | 'back-pain';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type SymptomDuration =
  | 'less-than-2-hours'
  | '2-to-12-hours'
  | '1-to-2-days'
  | '3-to-7-days'
  | 'more-than-1-week';

export interface SymptomDefinition {
  id: SymptomCategory;
  name: string;
  categoryTag: string;
  description: string;
  iconName: string;
  flightContext: string;
  isPotentialRedFlag?: boolean;
}

export interface SymptomReport {
  selectedSymptoms: SymptomCategory[];
  severity: SymptomSeverity;
  duration: SymptomDuration;
  customDuration?: string;
  description: string;
  reportedAt: string;
}

export type QuestionType = 'single-choice' | 'multi-choice' | 'text' | 'scale';

export interface QuestionOption {
  value: string;
  label: string;
  subtext?: string;
  isRedFlag?: boolean;
}

export interface AdaptiveQuestion {
  id: string;
  symptomId: SymptomCategory | 'general';
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required?: boolean;
  contextHint?: string;
}

export interface QuestionAnswer {
  questionId: string;
  symptomId: SymptomCategory | 'general';
  questionText: string;
  value: string | string[];
}

export type HealthCheckId =
  | 'heart-rate'
  | 'blood-pressure'
  | 'body-temperature'
  | 'sleep-fatigue'
  | 'mood-stress';

export interface HealthCheckConfig {
  id: HealthCheckId;
  title: string;
  parameter: string;
  unit: string;
  purpose: string;
  instructions: string[];
  equipment: string;
  baselineKey: keyof Pick<
    AstronautProfile,
    'baselineHeartRate' | 'baselineBloodPressure' | 'baselineBodyTemp' | 'baselineSleep' | 'baselineMood'
  >;
  nominalRangeText: string;
  inputConfig: {
    type: 'single-number' | 'dual-number' | 'rating-and-hours' | 'scale';
    fields: {
      name: string;
      label: string;
      placeholder?: string;
      unit?: string;
      min?: number;
      max?: number;
      step?: number;
    }[];
  };
}

export interface HealthCheckResult {
  checkId: HealthCheckId;
  title: string;
  recordedValues: Record<string, string | number>;
  displaySummary: string;
  status: 'nominal' | 'abnormal' | 'concerning' | 'unavailable' | 'skipped';
  isUnavailable?: boolean;
  unavailableReason?: string;
  notes?: string;
  comparedToBaseline?: string;
  recordedAt: string;
  provenance?: Record<string, FieldProvenance>;
}

export interface AssessmentObservation {
  id: string;
  category: 'vital' | 'symptom-pattern' | 'baseline-variance' | 'microgravity-adaptation';
  type: 'info' | 'positive' | 'warning' | 'critical';
  title: string;
  description: string;
}

export interface AssessmentNextStep {
  id: string;
  priority: 'urgent' | 'recommended' | 'routine';
  action: string;
  details: string;
}

export interface EscalationNotice {
  isEscalated: boolean;
  urgency: 'routine' | 'medical-consult' | 'urgent-flight-surgeon';
  headline: string;
  reasons: string[];
  immediateDirectives: string[];
}

export type AssessmentStatus = 'Completed' | 'Requires Medical Review' | 'Urgent Escalation';

export interface HealthAssessmentRecord {
  id: string;
  astronautId: string;
  astronautName: string;
  missionDay: string;
  timestamp: string;
  status: AssessmentStatus;
  symptomReport: SymptomReport;
  answers: QuestionAnswer[];
  healthChecks: HealthCheckResult[];
  observations: AssessmentObservation[];
  nextSteps: AssessmentNextStep[];
  escalation: EscalationNotice;
  wearableSummary?: {
    device: WearableDevice;
    readings: WearableReading[];
  };
  storageType?: 'Mission Session Cache' | 'Persistent Archive';
}
