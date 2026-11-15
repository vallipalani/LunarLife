import {
  DailyHealthRecord,
  MetricKey,
  HistoricalComparisonItem,
  SeverityLevel,
} from './types';
import {
  METRIC_DEFINITIONS,
  calculateMean,
  extractMetricValues,
} from './baselines';
import {
  filterRecentRecords,
  getHistoricalRecordsBeforeWindow,
} from './dataLoader';

export interface HistoricalComparisonResult {
  isInsufficientData: boolean;
  insufficientReason?: string;
  windowDays: number;
  recentCount: number;
  historicalCount: number;
  items: HistoricalComparisonItem[];
}

/**
 * Compare recent measurements within a configured window (7, 30, 90 days)
 * against the astronaut's historical measurements that strictly precede that window.
 */
export function calculateHistoricalComparison(
  records: DailyHealthRecord[],
  windowDays: number
): HistoricalComparisonResult {
  if (!records || records.length === 0) {
    return {
      isInsufficientData: true,
      insufficientReason: 'No health records available for this astronaut.',
      windowDays,
      recentCount: 0,
      historicalCount: 0,
      items: [],
    };
  }

  const recentRecords = filterRecentRecords(records, windowDays);
  const historicalRecords = getHistoricalRecordsBeforeWindow(records, windowDays);

  // If there are fewer than 3 historical records to compare against, flag insufficient historical data
  if (historicalRecords.length < 3) {
    return {
      isInsufficientData: true,
      insufficientReason: `Insufficient historical baseline records (${historicalRecords.length} records found; minimum 3 required) prior to the recent ${windowDays}-day window.`,
      windowDays,
      recentCount: recentRecords.length,
      historicalCount: historicalRecords.length,
      items: [],
    };
  }

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

  const items: HistoricalComparisonItem[] = metrics.map((key) => {
    const def = METRIC_DEFINITIONS[key];
    const histVals = extractMetricValues(historicalRecords, key);
    const recentVals = extractMetricValues(recentRecords, key);

    const histMean = calculateMean(histVals);
    const recMean = calculateMean(recentVals);
    const absDiff = Number((recMean - histMean).toFixed(2));
    const pctDiff =
      histMean !== 0 ? Number(((absDiff / histMean) * 100).toFixed(1)) : 0;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (absDiff > 0.1) direction = 'up';
    else if (absDiff < -0.1) direction = 'down';

    // Determine status & interpretation
    let status: SeverityLevel = 'Normal';
    let interpretation = `Stable compared to historical average of ${histMean} ${def.unit}.`;

    if (key === 'sleep_hours') {
      if (absDiff <= -1.2) {
        status = 'Attention';
        interpretation = `Substantial reduction: recent average ${recMean}h vs historical ${histMean}h (${absDiff}h / ${pctDiff}%).`;
      } else if (absDiff <= -0.5) {
        status = 'Monitor';
        interpretation = `Moderate decline: recent average ${recMean}h vs historical ${histMean}h (${absDiff}h).`;
      } else if (absDiff >= 0.5) {
        status = 'Normal';
        interpretation = `Sleep duration improved by +${absDiff}h vs historical average.`;
      }
    } else if (key === 'stress_score_1_to_5') {
      if (absDiff >= 1.5 || recMean >= 4.0) {
        status = 'Attention';
        interpretation = `High sustained stress: recent average ${recMean} vs historical ${histMean} (+${absDiff}).`;
      } else if (absDiff >= 0.8 || recMean >= 3.0) {
        status = 'Monitor';
        interpretation = `Stress levels trending upward: recent average ${recMean} vs historical ${histMean}.`;
      }
    } else if (key === 'heart_rate_bpm') {
      if (absDiff >= 8 || absDiff <= -10) {
        status = 'Attention';
        interpretation = `Notable resting pulse deviation: recent ${recMean} BPM vs historical ${histMean} BPM (${absDiff > 0 ? '+' : ''}${absDiff} BPM).`;
      } else if (absDiff >= 4 || absDiff <= -5) {
        status = 'Monitor';
        interpretation = `Mild resting pulse shift: ${recMean} BPM vs historical ${histMean} BPM.`;
      }
    } else if (key === 'systolic_bp_mmhg') {
      if (absDiff >= 10 || recMean >= 130) {
        status = 'Attention';
        interpretation = `Elevated arterial pressure: recent mean ${recMean} mmHg vs historical ${histMean} mmHg.`;
      } else if (absDiff >= 5) {
        status = 'Monitor';
        interpretation = `Slight upward drift in systolic BP: ${recMean} mmHg vs ${histMean} mmHg.`;
      }
    } else if (key === 'spo2_percent') {
      if (recMean < 96.0 || absDiff <= -1.5) {
        status = 'Attention';
        interpretation = `Oxygen saturation reduction: recent mean ${recMean}% vs historical ${histMean}%.`;
      } else if (absDiff <= -0.8) {
        status = 'Monitor';
        interpretation = `Mild oxygen saturation decrease: recent mean ${recMean}% vs historical ${histMean}%.`;
      }
    } else if (key === 'mood_score_1_to_5') {
      if (absDiff <= -1.0 || recMean <= 2.5) {
        status = 'Monitor';
        interpretation = `Negative mood trend: recent mean ${recMean} vs historical ${histMean}.`;
      }
    }

    return {
      metricKey: key,
      metricLabel: def.label,
      unit: def.unit,
      historicalMean: histMean,
      recentMean: recMean,
      absoluteDiff: absDiff,
      percentageDiff: pctDiff,
      direction,
      sampleCount: {
        historical: histVals.length,
        recent: recentVals.length,
      },
      status,
      interpretation,
    };
  });

  return {
    isInsufficientData: false,
    windowDays,
    recentCount: recentRecords.length,
    historicalCount: historicalRecords.length,
    items,
  };
}
