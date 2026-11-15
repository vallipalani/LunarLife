import { CabinRecord, DailyRecord } from './types';

// Demo overrides applied on top of the latest CSV row, for testing the 4 scenarios.
export interface Scenario {
  id: string;
  label: string;
  daily?: Partial<DailyRecord>;
  cabin?: Partial<CabinRecord>;
}

export const SCENARIOS: Scenario[] = [
  { id: 'live', label: 'Live data (latest CSV row)' },
  { id: 'fast-hr', label: 'Fast HR + dizzy', daily: { heart_rate_bpm: 98, systolic_bp_mmhg: 134, spo2_percent: 96 } },
  { id: 'poor-sleep', label: 'Poor sleep', daily: { sleep_hours: 4.2, sleep_quality_score_1_to_5: 2, mood_score_1_to_5: 2, stress_score_1_to_5: 4 } },
  { id: 'high-co2', label: 'High CO₂ headache', cabin: { cabin_co2_ppm: 4200 }, daily: { symptoms: 'headache' } },
  { id: 'low-spo2', label: 'Low SpO₂ (emergency)', daily: { spo2_percent: 86, heart_rate_bpm: 118 } },
];
