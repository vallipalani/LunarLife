import {
  DailyHealthRecord,
  AstronautProfileRecord,
  MetricKey,
  AnomalyItem,
  SeverityLevel,
} from './types';
import {
  METRIC_DEFINITIONS,
  calculatePreMissionBaselines,
  getProfileBaselineValue,
} from './baselines';

/**
 * Detect biometric anomalies for a set of records against the astronaut's personal baseline.
 */
export function detectBiometricAnomalies(
  records: DailyHealthRecord[],
  profile?: AstronautProfileRecord
): AnomalyItem[] {
  if (!records || records.length === 0) return [];

  // Compute personal pre-mission baseline statistics
  const preMissionStats = calculatePreMissionBaselines(records);
  const anomalies: AnomalyItem[] = [];

  const keys: MetricKey[] = [
    'sleep_hours',
    'heart_rate_bpm',
    'stress_score_1_to_5',
    'systolic_bp_mmhg',
    'diastolic_bp_mmhg',
    'body_temperature_c',
    'spo2_percent',
    'mood_score_1_to_5',
    'sleep_quality_score_1_to_5',
  ];

  records.forEach((record) => {
    keys.forEach((key) => {
      const def = METRIC_DEFINITIONS[key];
      const observed = record[key];

      if (typeof observed !== 'number' || !Number.isFinite(observed)) {
        return;
      }

      // Expected baseline: observed pre-mission mean if available, else profile baseline
      const stats = preMissionStats[key];
      const profileVal = getProfileBaselineValue(profile, key);
      const baseline = stats && stats.count >= 5 ? stats.mean : profileVal || observed;
      const stdDev = stats && stats.stdDev > 0 ? stats.stdDev : 1.0;

      const diff = Number((observed - baseline).toFixed(2));
      const zScore = Number(((observed - baseline) / stdDev).toFixed(2));
      const percentageDeviation =
        baseline !== 0 ? Number(((diff / baseline) * 100).toFixed(1)) : 0;

      let severity: SeverityLevel = 'Normal';
      let direction: 'elevated' | 'depressed' | 'nominal' = 'nominal';
      let explanation = '';

      if (def.higherIsWorse && !def.bidirectional) {
        // e.g. Stress score
        if (diff > 0) {
          direction = 'elevated';
          if (observed >= 4 || diff >= 2.0 || zScore >= 2.2) {
            severity = 'Attention';
            explanation = `${def.label} reached ${observed} ${def.unit} (+${diff} vs personal baseline of ${baseline}), indicating acute sympathetic elevation.`;
          } else if (observed >= 3 || diff >= 1.0 || zScore >= 1.4) {
            severity = 'Monitor';
            explanation = `${def.label} increased to ${observed} ${def.unit} (+${diff} vs personal baseline of ${baseline}).`;
          }
        }
      } else if (def.lowerIsWorse && !def.bidirectional) {
        // e.g. Sleep hours, SpO2, Mood score, Sleep quality
        if (diff < 0) {
          direction = 'depressed';
          if (key === 'sleep_hours') {
            if (observed < 5.5 || diff <= -2.0 || zScore <= -2.2) {
              severity = 'Attention';
              explanation = `Severe sleep reduction: ${observed}h observed vs ${baseline}h personal baseline (${diff}h, z = ${zScore}).`;
            } else if (observed < 6.8 || diff <= -1.0 || zScore <= -1.4) {
              severity = 'Monitor';
              explanation = `Mild sleep curtailment: ${observed}h observed vs ${baseline}h baseline (${diff}h).`;
            }
          } else if (key === 'spo2_percent') {
            if (observed < 95.0 || diff <= -3.5) {
              severity = 'Attention';
              explanation = `Sub-nominal oxygen saturation: ${observed}% vs ${baseline}% baseline (${diff}%). Cabin atmospheric review suggested.`;
            } else if (observed < 96.5 || diff <= -2.0) {
              severity = 'Monitor';
              explanation = `Slight SpO2 decrease: ${observed}% vs ${baseline}% baseline.`;
            }
          } else {
            // Mood / sleep quality
            if (observed <= 2 || diff <= -2.0 || zScore <= -2.0) {
              severity = 'Attention';
              explanation = `Low ${def.label.toLowerCase()}: recorded score of ${observed} ${def.unit} vs baseline ${baseline}.`;
            } else if (observed <= 3 || diff <= -1.0 || zScore <= -1.3) {
              severity = 'Monitor';
              explanation = `${def.label} score dipped to ${observed} ${def.unit} vs baseline ${baseline}.`;
            }
          }
        }
      } else if (def.bidirectional) {
        // e.g. Heart Rate, Blood Pressure, Body Temperature
        const absDiff = Math.abs(diff);
        const absZ = Math.abs(zScore);

        if (diff > 0) direction = 'elevated';
        else if (diff < 0) direction = 'depressed';

        if (key === 'heart_rate_bpm') {
          if (diff >= 12 || observed > 82 || diff <= -14 || observed < 50 || absZ >= 2.5) {
            severity = 'Attention';
            explanation = `Resting heart rate (${observed} BPM) deviates by ${diff > 0 ? '+' : ''}${diff} BPM from baseline (${baseline} BPM, z = ${zScore}).`;
          } else if (diff >= 7 || diff <= -8 || absZ >= 1.6) {
            severity = 'Monitor';
            explanation = `Resting heart rate shifted to ${observed} BPM (${diff > 0 ? '+' : ''}${diff} BPM vs baseline).`;
          }
        } else if (key === 'systolic_bp_mmhg') {
          if (observed >= 135 || diff >= 18 || observed <= 95 || absZ >= 2.4) {
            severity = 'Attention';
            explanation = `Systolic BP reached ${observed} mmHg (${diff > 0 ? '+' : ''}${diff} mmHg vs baseline of ${baseline} mmHg).`;
          } else if (observed >= 126 || diff >= 10 || absZ >= 1.6) {
            severity = 'Monitor';
            explanation = `Systolic BP slightly elevated to ${observed} mmHg (+${diff} mmHg vs baseline).`;
          }
        } else if (key === 'diastolic_bp_mmhg') {
          if (observed >= 88 || diff >= 14 || observed <= 55 || absZ >= 2.4) {
            severity = 'Attention';
            explanation = `Diastolic BP shifted to ${observed} mmHg (${diff > 0 ? '+' : ''}${diff} mmHg vs baseline of ${baseline} mmHg).`;
          } else if (observed >= 83 || diff >= 8 || absZ >= 1.6) {
            severity = 'Monitor';
            explanation = `Diastolic BP at ${observed} mmHg (+${diff} mmHg vs baseline).`;
          }
        } else if (key === 'body_temperature_c') {
          if (observed >= 37.6 || observed <= 35.8 || absZ >= 2.5) {
            severity = 'Attention';
            explanation = `Core body temperature anomaly: ${observed}°C vs baseline ${baseline}°C (${diff > 0 ? '+' : ''}${diff}°C).`;
          } else if (observed >= 37.3 || observed <= 36.2 || absZ >= 1.7) {
            severity = 'Monitor';
            explanation = `Body temperature slightly displaced: ${observed}°C (${diff > 0 ? '+' : ''}${diff}°C vs baseline).`;
          }
        }
      }

      if (severity !== 'Normal') {
        anomalies.push({
          id: `anomaly-${record.study_day}-${key}`,
          metricKey: key,
          metricLabel: def.label,
          observedValue: observed,
          expectedBaseline: baseline,
          unit: def.unit,
          deviationMagnitude: diff,
          percentageDeviation,
          zScore,
          date: record.date,
          studyDay: record.study_day,
          missionPhase: record.mission_phase,
          severity,
          direction,
          explanation,
        });
      }
    });
  });

  return anomalies;
}
