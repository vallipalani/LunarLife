/**
 * Types and interfaces for the Predictive Analytics engine (Section 4.2).
 */

export type MissionPhase = 'PRE_MISSION' | 'IN_MISSION';

export type SeverityLevel = 'Normal' | 'Monitor' | 'Attention';

export type TimeFilter = '7d' | '30d' | '90d';

export interface DailyHealthRecord {
  astronaut_id: string;
  date: string; // YYYY-MM-DD
  study_day: number;
  mission_phase: MissionPhase;
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
  data_source: string;
}

export interface AstronautProfileRecord {
  astronaut_id: string;
  display_name: string;
  age_years: number;
  mission_role: string;
  baseline_resting_hr_bpm: number;
  baseline_systolic_bp_mmhg: number;
  baseline_diastolic_bp_mmhg: number;
  baseline_temperature_c: number;
  baseline_spo2_percent: number;
  baseline_sleep_hours: number;
  baseline_stress_score: number;
  baseline_mood_score: number;
  baseline_exercise_minutes: number;
  data_source: string;
}

export type MetricKey =
  | 'heart_rate_bpm'
  | 'systolic_bp_mmhg'
  | 'diastolic_bp_mmhg'
  | 'body_temperature_c'
  | 'spo2_percent'
  | 'sleep_hours'
  | 'sleep_quality_score_1_to_5'
  | 'mood_score_1_to_5'
  | 'stress_score_1_to_5';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  higherIsWorse: boolean;
  lowerIsWorse: boolean;
  bidirectional: boolean;
  minNominal: number;
  maxNominal: number;
  zScoreAttentionThreshold: number; // e.g. 2.5
  zScoreMonitorThreshold: number;   // e.g. 1.8
}

export interface StatisticalSummary {
  count: number;
  mean: number;
  stdDev: number;
  median: number;
  mad: number; // Median Absolute Deviation
  min: number;
  max: number;
}

export interface AnomalyItem {
  id: string;
  metricKey: MetricKey;
  metricLabel: string;
  observedValue: number;
  expectedBaseline: number;
  unit: string;
  deviationMagnitude: number;
  percentageDeviation: number;
  zScore: number;
  date: string;
  studyDay: number;
  missionPhase: MissionPhase;
  severity: SeverityLevel;
  direction: 'elevated' | 'depressed' | 'nominal';
  explanation: string;
}

export interface HistoricalComparisonItem {
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  historicalMean: number;
  recentMean: number;
  absoluteDiff: number;
  percentageDiff: number;
  direction: 'up' | 'down' | 'stable';
  sampleCount: {
    historical: number;
    recent: number;
  };
  status: SeverityLevel;
  interpretation: string;
}

export interface PreMissionComparisonItem {
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  profileBaseline: number;
  preMissionObservedMean: number;
  preMissionStdDev: number;
  currentValue: number;
  absoluteChange: number;
  percentageChange: number;
  status: SeverityLevel;
  interpretation: string;
}

export type RiskCategory =
  | 'sleep_decline'
  | 'elevated_hr'
  | 'high_stress'
  | 'negative_mood'
  | 'bp_deviation'
  | 'spo2_hypoxia'
  | 'compound_fatigue';

export interface PotentialHealthRisk {
  id: string;
  category: RiskCategory;
  title: string;
  severity: SeverityLevel;
  description: string;
  supportingObservations: string[];
  baselineComparison: string;
  timing: string;
  rationale: string;
  recommendationNextStep: string;
}

export interface TimeSeriesPoint {
  date: string;
  studyDay: number;
  missionDay: number;
  missionPhase: MissionPhase;
  displayTime: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  sleepHours: number;
  sleepQuality: number;
  mood: number;
  stress: number;
  temperature: number;
  spo2: number;
  exercise: number;
  movingAvgSleepHours?: number;
  movingAvgHeartRate?: number;
}

export interface PredictiveAnalyticsReport {
  astronautId: string;
  astronautName: string;
  missionRole: string;
  timeFilter: TimeFilter;
  totalRecordsCount: number;
  recentWindowDays: number;
  isInsufficientData: boolean;
  insufficientDataReason?: string;
  timeSeries: TimeSeriesPoint[];
  overviewCards: {
    heartRate: {
      value: string;
      unit: string;
      baseline: string;
      status: SeverityLevel;
      subtext: string;
    };
    sleep: {
      value: string;
      unit: string;
      baseline: string;
      status: SeverityLevel;
      subtext: string;
    };
    bloodPressure: {
      value: string;
      unit: string;
      baseline: string;
      status: SeverityLevel;
      subtext: string;
    };
    overallRisk: {
      status: SeverityLevel;
      activeRisksCount: number;
      summary: string;
    };
  };
  anomalies: AnomalyItem[];
  historicalComparisons: HistoricalComparisonItem[];
  preMissionComparisons: PreMissionComparisonItem[];
  potentialRisks: PotentialHealthRisk[];
  longTermProgressSummary: {
    observationDaysCount: number;
    preMissionDaysCount: number;
    inMissionDaysCount: number;
    summaryText: string;
    trajectory: 'stable' | 'adapting' | 'declining' | 'recovering';
    details: string[];
  };
}
