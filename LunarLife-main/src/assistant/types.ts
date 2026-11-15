export type Urgency = 'routine' | 'monitor' | 'contact-medical-team';

export interface DailyRecord {
  astronaut_id: string;
  date: string;
  mission_day: number;
  heart_rate_bpm: number;
  systolic_bp_mmhg: number;
  diastolic_bp_mmhg: number;
  body_temperature_c: number;
  spo2_percent: number;
  sleep_hours: number;
  sleep_quality_score_1_to_5: number;
  mood_score_1_to_5: number;
  stress_score_1_to_5: number;
  exercise_minutes: number;
  symptoms: string;
}

export interface CabinRecord {
  astronaut_id: string;
  date: string;
  cabin_co2_ppm: number;
  cabin_temperature_c: number;
  cabin_pressure_kpa: number;
  cabin_relative_humidity_percent: number;
}

export interface Baseline {
  heartRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  sleep: number;
  mood: number;
}

export interface Fact {
  label: string;
  value: string;
  flagged?: boolean; // true when it deviates from baseline / normal range
}

export interface HealthContext {
  summary: string; // short text sent to the AI
  facts: Fact[]; // shown in the "data used" panel
  latest?: DailyRecord;
  cabin?: CabinRecord;
  baseline: Baseline;
  /** Human-readable deviations found by the context builder */
  deviations: string[];
  /** Plain-language meaning of each measurement, keyed hr | bp | temp | spo2 | sleep */
  interpretations: Record<string, string>;
  history: { conditions: string[]; allergies: string[]; medications: string[] };
}

export interface AssistantReply {
  explanations: string[];
  next_steps: string[];
  urgency: Urgency;
  data_used: string[];
  source: 'onboard' | 'ai';
}

export const URGENCY_RANK: Record<Urgency, number> = {
  routine: 0,
  monitor: 1,
  'contact-medical-team': 2,
};

export const maxUrgency = (a: Urgency, b: Urgency): Urgency =>
  URGENCY_RANK[a] >= URGENCY_RANK[b] ? a : b;
