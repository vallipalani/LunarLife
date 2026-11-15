import {
  DailyHealthRecord,
  TimeSeriesPoint,
  TimeFilter,
} from './types';
import { filterRecentRecords } from './dataLoader';

/**
 * Compute simple rolling moving average of a series of numbers with a specified window size.
 */
export function computeRollingMovingAverage(
  values: (number | undefined)[],
  windowSize: number = 5
): (number | undefined)[] {
  return values.map((_, idx) => {
    const start = Math.max(0, idx - windowSize + 1);
    const windowSlice = values.slice(start, idx + 1).filter(
      (v): v is number => typeof v === 'number' && Number.isFinite(v)
    );
    if (windowSlice.length === 0) return undefined;
    const avg = windowSlice.reduce((a, b) => a + b, 0) / windowSlice.length;
    return Number(avg.toFixed(2));
  });
}

/**
 * Calculate ordinary least squares (OLS) linear slope for a series.
 * Returns change per day (slope).
 */
export function calculateLinearTrendSlope(values: number[]): {
  slope: number;
  direction: 'upward' | 'downward' | 'flat';
} {
  const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  const n = valid.length;
  if (n < 2) return { slope: 0, direction: 'flat' };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = valid[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, direction: 'flat' };

  const slope = Number(((n * sumXY - sumX * sumY) / denominator).toFixed(3));
  let direction: 'upward' | 'downward' | 'flat' = 'flat';
  if (slope > 0.03) direction = 'upward';
  else if (slope < -0.03) direction = 'downward';

  return { slope, direction };
}

/**
 * Prepare time-series chart data points for the specified filter window (7d, 30d, 90d).
 */
export function prepareTimeSeriesData(
  records: DailyHealthRecord[],
  filter: TimeFilter
): TimeSeriesPoint[] {
  if (!records || records.length === 0) return [];

  const windowDays = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
  const filteredRecords = filterRecentRecords(records, windowDays);

  const rawSleepHours = filteredRecords.map((r) => r.sleep_hours);
  const rawHeartRate = filteredRecords.map((r) => r.heart_rate_bpm);

  const rollingSleep = computeRollingMovingAverage(rawSleepHours, 3);
  const rollingHeartRate = computeRollingMovingAverage(rawHeartRate, 3);

  return filteredRecords.map((rec, idx) => {
    const shortDate = rec.date ? rec.date.slice(5) : `D${rec.study_day}`;
    const displayLabel = `Day ${rec.study_day} (${shortDate})`;

    return {
      date: rec.date,
      studyDay: rec.study_day,
      missionDay: rec.mission_day,
      missionPhase: rec.mission_phase,
      displayTime: displayLabel,
      heartRate: rec.heart_rate_bpm,
      systolic: rec.systolic_bp_mmhg,
      diastolic: rec.diastolic_bp_mmhg,
      sleepHours: rec.sleep_hours,
      sleepQuality: rec.sleep_quality_score_1_to_5,
      mood: rec.mood_score_1_to_5,
      stress: rec.stress_score_1_to_5,
      temperature: rec.body_temperature_c,
      spo2: rec.spo2_percent,
      exercise: rec.exercise_minutes,
      movingAvgSleepHours: rollingSleep[idx],
      movingAvgHeartRate: rollingHeartRate[idx],
    };
  });
}
