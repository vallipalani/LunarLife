import {
  DailyHealthRecord,
  AstronautProfileRecord,
  PredictiveAnalyticsReport,
  TimeFilter,
  SeverityLevel,
} from './types';
import {
  getDefaultAstronautProfiles,
  getDefaultDailyHealthRecords,
  filterRecordsForAstronaut,
  filterRecentRecords,
  filterRecordsByPhase,
} from './dataLoader';
import {
  calculateMean,
  calculatePreMissionBaselines,
  getProfileBaselineValue,
} from './baselines';
import { detectBiometricAnomalies } from './anomalyDetection';
import { calculateHistoricalComparison } from './historicalComparison';
import { calculatePreMissionComparison } from './preMissionComparison';
import { prepareTimeSeriesData } from './trendAnalysis';
import { identifyPotentialHealthRisks } from './riskDetection';

/**
 * Get all available astronaut profiles from the dataset.
 */
export function getAvailableCrewProfiles(): AstronautProfileRecord[] {
  return getDefaultAstronautProfiles();
}

/**
 * Generate a complete, end-to-end Predictive Analytics Report for an astronaut.
 */
export function generatePredictiveAnalyticsReport(
  astronautId: string,
  filter: TimeFilter = '30d',
  customRecords?: DailyHealthRecord[],
  customProfiles?: AstronautProfileRecord[]
): PredictiveAnalyticsReport {
  const profiles = customProfiles || getDefaultAstronautProfiles();
  const allRecords = customRecords || getDefaultDailyHealthRecords();

  const profile = profiles.find((p) => p.astronaut_id === astronautId);
  const astronautRecords = filterRecordsForAstronaut(allRecords, astronautId);

  const windowDays = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;

  // Handle Insufficient Data state
  if (astronautRecords.length === 0) {
    return {
      astronautId,
      astronautName: profile ? profile.display_name : astronautId,
      missionRole: profile ? profile.mission_role : 'Crew Member',
      timeFilter: filter,
      totalRecordsCount: 0,
      recentWindowDays: windowDays,
      isInsufficientData: true,
      insufficientDataReason: `No telemetry records found for astronaut ID "${astronautId}" in the daily monitoring dataset.`,
      timeSeries: [],
      overviewCards: {
        heartRate: {
          value: 'N/A',
          unit: 'BPM',
          baseline: 'N/A',
          status: 'Normal',
          subtext: 'Insufficient telemetry data',
        },
        sleep: {
          value: 'N/A',
          unit: 'hours',
          baseline: 'N/A',
          status: 'Normal',
          subtext: 'Insufficient telemetry data',
        },
        bloodPressure: {
          value: 'N/A',
          unit: 'mmHg',
          baseline: 'N/A',
          status: 'Normal',
          subtext: 'Insufficient telemetry data',
        },
        overallRisk: {
          status: 'Normal',
          activeRisksCount: 0,
          summary: 'Telemetry stream pending or unmapped.',
        },
      },
      anomalies: [],
      historicalComparisons: [],
      preMissionComparisons: [],
      potentialRisks: [],
      longTermProgressSummary: {
        observationDaysCount: 0,
        preMissionDaysCount: 0,
        inMissionDaysCount: 0,
        summaryText: 'Insufficient telemetry data available for long-term health progress assessment.',
        trajectory: 'stable',
        details: ['Awaiting ingestion of astronaut daily health logs.'],
      },
    };
  }

  // Calculate pre-mission baselines and recent records
  const preMissionStats = calculatePreMissionBaselines(astronautRecords);
  const recentRecords = filterRecentRecords(astronautRecords, windowDays);
  const inMissionRecords = filterRecordsByPhase(astronautRecords, 'IN_MISSION');
  const preMissionRecords = filterRecordsByPhase(astronautRecords, 'PRE_MISSION');

  // Baseline and recent values for Overview Cards
  const hrProfileBaseline = getProfileBaselineValue(profile, 'heart_rate_bpm');
  const hrObservedBaseline = preMissionStats.heart_rate_bpm?.mean || hrProfileBaseline || 70;
  const recentHrMean = calculateMean(recentRecords.map((r) => r.heart_rate_bpm));

  const sleepProfileBaseline = getProfileBaselineValue(profile, 'sleep_hours');
  const sleepObservedBaseline = preMissionStats.sleep_hours?.mean || sleepProfileBaseline || 7.5;
  const recentSleepMean = calculateMean(recentRecords.map((r) => r.sleep_hours));

  const sysProfileBaseline = getProfileBaselineValue(profile, 'systolic_bp_mmhg');
  const sysObservedBaseline = preMissionStats.systolic_bp_mmhg?.mean || sysProfileBaseline || 118;
  const diaProfileBaseline = getProfileBaselineValue(profile, 'diastolic_bp_mmhg');
  const diaObservedBaseline = preMissionStats.diastolic_bp_mmhg?.mean || diaProfileBaseline || 76;
  const recentSysMean = calculateMean(recentRecords.map((r) => r.systolic_bp_mmhg));
  const recentDiaMean = calculateMean(recentRecords.map((r) => r.diastolic_bp_mmhg));

  // Determine overview card statuses
  let hrStatus: SeverityLevel = 'Normal';
  const hrDelta = recentHrMean - hrObservedBaseline;
  if (hrDelta >= 8 || recentHrMean > 80) hrStatus = 'Attention';
  else if (hrDelta >= 4 || hrDelta <= -6) hrStatus = 'Monitor';

  let sleepStatus: SeverityLevel = 'Normal';
  const sleepDelta = recentSleepMean - sleepObservedBaseline;
  if (sleepDelta <= -1.2 || recentSleepMean < 6.0) sleepStatus = 'Attention';
  else if (sleepDelta <= -0.5) sleepStatus = 'Monitor';

  let bpStatus: SeverityLevel = 'Normal';
  const sysDelta = recentSysMean - sysObservedBaseline;
  if (sysDelta >= 12 || recentSysMean >= 132 || recentDiaMean >= 86) bpStatus = 'Attention';
  else if (sysDelta >= 6 || recentSysMean >= 125 || recentDiaMean >= 82) bpStatus = 'Monitor';

  // Compute components
  const timeSeries = prepareTimeSeriesData(astronautRecords, filter);
  const anomalies = detectBiometricAnomalies(recentRecords, profile);
  const historicalComp = calculateHistoricalComparison(astronautRecords, windowDays);
  const preMissionComp = calculatePreMissionComparison(astronautRecords, profile);
  const potentialRisks = identifyPotentialHealthRisks(astronautRecords, profile);

  // Overall risk computation
  const activeAttentionRisks = potentialRisks.filter((r) => r.severity === 'Attention').length;
  const activeMonitorRisks = potentialRisks.filter((r) => r.severity === 'Monitor').length;

  let overallStatus: SeverityLevel = 'Normal';
  let overallSummary = 'All physiological markers within established personal adaptation boundaries.';
  if (activeAttentionRisks > 0) {
    overallStatus = 'Attention';
    overallSummary = `${activeAttentionRisks} elevated health pattern${activeAttentionRisks > 1 ? 's' : ''} detected requiring clinical review.`;
  } else if (activeMonitorRisks > 0) {
    overallStatus = 'Monitor';
    overallSummary = `${activeMonitorRisks} biometric drift pattern${activeMonitorRisks > 1 ? 's' : ''} flagged for proactive monitoring.`;
  }

  // Long-Term Health Progress Summary
  let trajectory: 'stable' | 'adapting' | 'declining' | 'recovering' = 'stable';
  if (activeAttentionRisks > 0) trajectory = 'declining';
  else if (activeMonitorRisks > 0) trajectory = 'adapting';

  const longTermDetails = [
    `Complete observation log encompasses ${astronautRecords.length} recorded mission days (${preMissionRecords.length} pre-mission baseline days, ${inMissionRecords.length} in-mission orbital flight days).`,
    `Resting heart rate averaged ${recentHrMean.toFixed(1)} BPM across the recent ${windowDays}-day period compared to ${hrObservedBaseline.toFixed(1)} BPM pre-mission mean (${hrDelta >= 0 ? '+' : ''}${hrDelta.toFixed(1)} BPM).`,
    `Sleep duration averaged ${recentSleepMean.toFixed(1)} hours per day (${sleepDelta >= 0 ? '+' : ''}${sleepDelta.toFixed(1)}h relative to pre-mission baseline of ${sleepObservedBaseline.toFixed(1)}h).`,
    `Blood pressure averaged ${recentSysMean.toFixed(0)}/${recentDiaMean.toFixed(0)} mmHg across the active filter window.`,
  ];

  return {
    astronautId,
    astronautName: profile ? profile.display_name : astronautId,
    missionRole: profile ? profile.mission_role : 'Crew Member',
    timeFilter: filter,
    totalRecordsCount: astronautRecords.length,
    recentWindowDays: windowDays,
    isInsufficientData: false,
    timeSeries,
    overviewCards: {
      heartRate: {
        value: `${recentHrMean.toFixed(0)}`,
        unit: 'BPM',
        baseline: `${hrObservedBaseline.toFixed(0)} BPM baseline`,
        status: hrStatus,
        subtext: `Recent ${windowDays}d avg vs ${hrObservedBaseline.toFixed(0)} baseline`,
      },
      sleep: {
        value: `${recentSleepMean.toFixed(1)}`,
        unit: 'hrs',
        baseline: `${sleepObservedBaseline.toFixed(1)} hrs target`,
        status: sleepStatus,
        subtext: `${sleepDelta >= 0 ? '+' : ''}${sleepDelta.toFixed(1)}h vs target`,
      },
      bloodPressure: {
        value: `${recentSysMean.toFixed(0)}/${recentDiaMean.toFixed(0)}`,
        unit: 'mmHg',
        baseline: `${sysObservedBaseline.toFixed(0)}/${diaObservedBaseline.toFixed(0)} mmHg baseline`,
        status: bpStatus,
        subtext: `Arterial pressure (${windowDays}d mean)`,
      },
      overallRisk: {
        status: overallStatus,
        activeRisksCount: activeAttentionRisks + activeMonitorRisks,
        summary: overallSummary,
      },
    },
    anomalies,
    historicalComparisons: historicalComp.items,
    preMissionComparisons: preMissionComp,
    potentialRisks,
    longTermProgressSummary: {
      observationDaysCount: astronautRecords.length,
      preMissionDaysCount: preMissionRecords.length,
      inMissionDaysCount: inMissionRecords.length,
      summaryText: overallSummary,
      trajectory,
      details: longTermDetails,
    },
  };
}
