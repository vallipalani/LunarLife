import {
  MetricKey,
  MetricDefinition,
  StatisticalSummary,
  DailyHealthRecord,
  AstronautProfileRecord,
} from './types';

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  heart_rate_bpm: {
    key: 'heart_rate_bpm',
    label: 'Heart Rate',
    shortLabel: 'HR',
    unit: 'BPM',
    higherIsWorse: true,
    lowerIsWorse: true,
    bidirectional: true,
    minNominal: 60,
    maxNominal: 80,
    zScoreAttentionThreshold: 2.5,
    zScoreMonitorThreshold: 1.8,
  },
  systolic_bp_mmhg: {
    key: 'systolic_bp_mmhg',
    label: 'Systolic Blood Pressure',
    shortLabel: 'Sys BP',
    unit: 'mmHg',
    higherIsWorse: true,
    lowerIsWorse: true,
    bidirectional: true,
    minNominal: 105,
    maxNominal: 125,
    zScoreAttentionThreshold: 2.3,
    zScoreMonitorThreshold: 1.7,
  },
  diastolic_bp_mmhg: {
    key: 'diastolic_bp_mmhg',
    label: 'Diastolic Blood Pressure',
    shortLabel: 'Dia BP',
    unit: 'mmHg',
    higherIsWorse: true,
    lowerIsWorse: true,
    bidirectional: true,
    minNominal: 65,
    maxNominal: 82,
    zScoreAttentionThreshold: 2.3,
    zScoreMonitorThreshold: 1.7,
  },
  body_temperature_c: {
    key: 'body_temperature_c',
    label: 'Body Temperature',
    shortLabel: 'Temp',
    unit: '°C',
    higherIsWorse: true,
    lowerIsWorse: true,
    bidirectional: true,
    minNominal: 36.4,
    maxNominal: 37.3,
    zScoreAttentionThreshold: 2.5,
    zScoreMonitorThreshold: 1.8,
  },
  spo2_percent: {
    key: 'spo2_percent',
    label: 'Oxygen Saturation',
    shortLabel: 'SpO2',
    unit: '%',
    higherIsWorse: false,
    lowerIsWorse: true,
    bidirectional: false,
    minNominal: 96.0,
    maxNominal: 100.0,
    zScoreAttentionThreshold: 2.4,
    zScoreMonitorThreshold: 1.8,
  },
  sleep_hours: {
    key: 'sleep_hours',
    label: 'Sleep Duration',
    shortLabel: 'Sleep',
    unit: 'hours',
    higherIsWorse: false,
    lowerIsWorse: true,
    bidirectional: false,
    minNominal: 7.0,
    maxNominal: 9.0,
    zScoreAttentionThreshold: 2.2,
    zScoreMonitorThreshold: 1.6,
  },
  sleep_quality_score_1_to_5: {
    key: 'sleep_quality_score_1_to_5',
    label: 'Sleep Quality',
    shortLabel: 'Sleep Q',
    unit: '/5',
    higherIsWorse: false,
    lowerIsWorse: true,
    bidirectional: false,
    minNominal: 3.5,
    maxNominal: 5.0,
    zScoreAttentionThreshold: 2.2,
    zScoreMonitorThreshold: 1.6,
  },
  mood_score_1_to_5: {
    key: 'mood_score_1_to_5',
    label: 'Mood Score',
    shortLabel: 'Mood',
    unit: '/5',
    higherIsWorse: false,
    lowerIsWorse: true,
    bidirectional: false,
    minNominal: 3.5,
    maxNominal: 5.0,
    zScoreAttentionThreshold: 2.2,
    zScoreMonitorThreshold: 1.6,
  },
  stress_score_1_to_5: {
    key: 'stress_score_1_to_5',
    label: 'Stress Score',
    shortLabel: 'Stress',
    unit: '/5',
    higherIsWorse: true,
    lowerIsWorse: false,
    bidirectional: false,
    minNominal: 1.0,
    maxNominal: 2.5,
    zScoreAttentionThreshold: 2.3,
    zScoreMonitorThreshold: 1.7,
  },
};

/**
 * Filter valid finite numbers from an array.
 */
export function filterValidNumbers(values: number[]): number[] {
  return values.filter((v) => typeof v === 'number' && Number.isFinite(v));
}

/**
 * Arithmetic Mean.
 */
export function calculateMean(values: number[]): number {
  const valid = filterValidNumbers(values);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / valid.length).toFixed(2));
}

/**
 * Sample Standard Deviation.
 */
export function calculateStdDev(values: number[], precomputedMean?: number): number {
  const valid = filterValidNumbers(values);
  if (valid.length <= 1) return 0;
  const mean = precomputedMean !== undefined ? precomputedMean : calculateMean(valid);
  const varianceSum = valid.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
  return Number(Math.sqrt(varianceSum / (valid.length - 1)).toFixed(2));
}

/**
 * Median calculation (middle value or average of two middle values).
 */
export function calculateMedian(values: number[]): number {
  const valid = filterValidNumbers(values);
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return Number(sorted[mid].toFixed(2));
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

/**
 * Median Absolute Deviation (MAD), a robust measure of statistical dispersion.
 */
export function calculateMAD(values: number[], precomputedMedian?: number): number {
  const valid = filterValidNumbers(values);
  if (valid.length === 0) return 0;
  const median = precomputedMedian !== undefined ? precomputedMedian : calculateMedian(valid);
  const deviations = valid.map((v) => Math.abs(v - median));
  return calculateMedian(deviations);
}

/**
 * Comprehensive Statistical Summary for a series of observations.
 */
export function calculateSummary(values: number[]): StatisticalSummary {
  const valid = filterValidNumbers(values);
  if (valid.length === 0) {
    return {
      count: 0,
      mean: 0,
      stdDev: 0,
      median: 0,
      mad: 0,
      min: 0,
      max: 0,
    };
  }

  const mean = calculateMean(valid);
  const stdDev = calculateStdDev(valid, mean);
  const median = calculateMedian(valid);
  const mad = calculateMAD(valid, median);
  const min = Number(Math.min(...valid).toFixed(2));
  const max = Number(Math.max(...valid).toFixed(2));

  return {
    count: valid.length,
    mean,
    stdDev,
    median,
    mad,
    min,
    max,
  };
}

/**
 * Extract an array of numeric values for a specific metric key from daily records.
 */
export function extractMetricValues(records: DailyHealthRecord[], key: MetricKey): number[] {
  return records.map((r) => r[key]).filter((v) => typeof v === 'number' && Number.isFinite(v));
}

/**
 * Compute observed pre-mission baselines for all indicators from PRE_MISSION records.
 */
export function calculatePreMissionBaselines(
  records: DailyHealthRecord[]
): Record<MetricKey, StatisticalSummary> {
  const preMissionRecords = records.filter((r) => r.mission_phase === 'PRE_MISSION');
  const result = {} as Record<MetricKey, StatisticalSummary>;

  (Object.keys(METRIC_DEFINITIONS) as MetricKey[]).forEach((key) => {
    const vals = extractMetricValues(preMissionRecords, key);
    result[key] = calculateSummary(vals);
  });

  return result;
}

/**
 * Get profile baseline value for a metric key from an AstronautProfileRecord.
 */
export function getProfileBaselineValue(
  profile: AstronautProfileRecord | undefined,
  metric: MetricKey
): number {
  if (!profile) return 0;
  switch (metric) {
    case 'heart_rate_bpm':
      return profile.baseline_resting_hr_bpm;
    case 'systolic_bp_mmhg':
      return profile.baseline_systolic_bp_mmhg;
    case 'diastolic_bp_mmhg':
      return profile.baseline_diastolic_bp_mmhg;
    case 'body_temperature_c':
      return profile.baseline_temperature_c;
    case 'spo2_percent':
      return profile.baseline_spo2_percent;
    case 'sleep_hours':
      return profile.baseline_sleep_hours;
    case 'sleep_quality_score_1_to_5':
      return 4.0; // standard nominal profile reference
    case 'mood_score_1_to_5':
      return profile.baseline_mood_score;
    case 'stress_score_1_to_5':
      return profile.baseline_stress_score;
    default:
      return 0;
  }
}
