import {
  DailyHealthRecord,
  AstronautProfileRecord,
  PreMissionComparisonItem,
  MetricKey,
  SeverityLevel,
} from './types';
import {
  METRIC_DEFINITIONS,
  calculateMean,
  calculateStdDev,
  extractMetricValues,
  getProfileBaselineValue,
} from './baselines';
import { filterRecordsByPhase, filterRecentRecords } from './dataLoader';

/**
 * Compare pre-mission baseline records (PRE_MISSION phase) and profile baselines
 * against current/recent in-mission telemetry.
 */
export function calculatePreMissionComparison(
  records: DailyHealthRecord[],
  profile?: AstronautProfileRecord
): PreMissionComparisonItem[] {
  if (!records || records.length === 0) return [];

  const preMissionRecords = filterRecordsByPhase(records, 'PRE_MISSION');
  const inMissionRecords = filterRecordsByPhase(records, 'IN_MISSION');

  // If in-mission records exist, use the most recent 7 in-mission records or all in-mission records
  const recentMissionRecords =
    inMissionRecords.length > 0
      ? filterRecentRecords(inMissionRecords, 7)
      : filterRecentRecords(records, 7);

  const metrics: MetricKey[] = [
    'heart_rate_bpm',
    'systolic_bp_mmhg',
    'diastolic_bp_mmhg',
    'sleep_hours',
    'stress_score_1_to_5',
    'mood_score_1_to_5',
    'spo2_percent',
    'body_temperature_c',
    'sleep_quality_score_1_to_5',
  ];

  return metrics.map((key) => {
    const def = METRIC_DEFINITIONS[key];
    const profileVal = getProfileBaselineValue(profile, key);

    // Observed pre-mission records
    const preMissionVals = extractMetricValues(preMissionRecords, key);
    const preObservedMean =
      preMissionVals.length > 0 ? calculateMean(preMissionVals) : profileVal;
    const preStdDev =
      preMissionVals.length > 1 ? calculateStdDev(preMissionVals, preObservedMean) : 0;

    // Recent in-mission telemetry
    const recentVals = extractMetricValues(recentMissionRecords, key);
    const currentVal =
      recentVals.length > 0
        ? calculateMean(recentVals)
        : preObservedMean;

    const absChange = Number((currentVal - preObservedMean).toFixed(2));
    const pctChange =
      preObservedMean !== 0
        ? Number(((absChange / preObservedMean) * 100).toFixed(1))
        : 0;

    let status: SeverityLevel = 'Normal';
    let interpretation = 'Consistent with terrestrial baseline range.';

    if (key === 'heart_rate_bpm') {
      if (absChange >= 8 || currentVal > 80) {
        status = 'Monitor';
        interpretation = `Elevated by +${absChange} BPM over pre-mission mean (${preObservedMean} BPM); elevated cardiovascular strain or exertion.`;
      } else if (absChange >= 4) {
        status = 'Normal';
        interpretation = `Nominal cephalad fluid shift adaptation (+${absChange} BPM vs pre-mission baseline).`;
      } else {
        interpretation = `Resting heart rate remains tightly aligned with pre-mission baseline (${preObservedMean} BPM).`;
      }
    } else if (key === 'systolic_bp_mmhg') {
      if (absChange >= 10 || currentVal >= 130) {
        status = 'Monitor';
        interpretation = `Systolic pressure elevated by +${absChange} mmHg above pre-mission baseline (${preObservedMean} mmHg).`;
      } else {
        interpretation = `Cardiovascular arterial pressure remains within expected flight variation.`;
      }
    } else if (key === 'diastolic_bp_mmhg') {
      if (absChange >= 8 || currentVal >= 85) {
        status = 'Monitor';
        interpretation = `Diastolic pressure elevated by +${absChange} mmHg above pre-mission baseline.`;
      } else {
        interpretation = `Diastolic vascular resistance nominal.`;
      }
    } else if (key === 'sleep_hours') {
      if (absChange <= -1.5) {
        status = 'Attention';
        interpretation = `Significant sleep reduction of ${absChange} hours vs pre-mission baseline (${preObservedMean}h).`;
      } else if (absChange <= -0.6) {
        status = 'Monitor';
        interpretation = `Moderate sleep loss of ${absChange} hours vs pre-mission mean (${preObservedMean}h).`;
      } else {
        interpretation = `Rest schedules consistent with pre-mission sleep duration.`;
      }
    } else if (key === 'stress_score_1_to_5') {
      if (absChange >= 1.5 || currentVal >= 4.0) {
        status = 'Attention';
        interpretation = `Operational stress score significantly higher than pre-mission baseline (+${absChange} pts).`;
      } else if (absChange >= 0.8) {
        status = 'Monitor';
        interpretation = `Slight upward drift in perceived stress compared to terrestrial baseline.`;
      } else {
        interpretation = `Stress indicators remain low and stable.`;
      }
    } else if (key === 'mood_score_1_to_5') {
      if (absChange <= -1.5 || currentVal <= 2.5) {
        status = 'Monitor';
        interpretation = `Subjective mood reported lower than pre-mission baseline (${preObservedMean} pts).`;
      } else {
        interpretation = `Psychological readiness scores nominal.`;
      }
    } else if (key === 'spo2_percent') {
      if (currentVal < 95.5 || absChange <= -2.5) {
        status = 'Attention';
        interpretation = `Oxygen saturation lowered relative to pre-mission baseline (${preObservedMean}%).`;
      } else {
        interpretation = `Peripheral capillary oxygenation nominal throughout duty cycles.`;
      }
    } else if (key === 'body_temperature_c') {
      if (Math.abs(absChange) >= 0.6) {
        status = 'Monitor';
        interpretation = `Thermal variance (${absChange > 0 ? '+' : ''}${absChange}°C) observed vs pre-mission mean.`;
      } else {
        interpretation = `Thermoregulatory equilibrium maintained.`;
      }
    }

    return {
      metricKey: key,
      metricLabel: def.label,
      unit: def.unit,
      profileBaseline: profileVal,
      preMissionObservedMean: preObservedMean,
      preMissionStdDev: preStdDev,
      currentValue: currentVal,
      absoluteChange: absChange,
      percentageChange: pctChange,
      status,
      interpretation,
    };
  });
}
