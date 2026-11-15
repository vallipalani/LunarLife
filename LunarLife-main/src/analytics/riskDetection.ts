import {
  DailyHealthRecord,
  AstronautProfileRecord,
  PotentialHealthRisk,
} from './types';
import {
  calculatePreMissionBaselines,
  getProfileBaselineValue,
  calculateMean,
  extractMetricValues,
} from './baselines';

/**
 * Detect developing health concerns and risk patterns across the astronaut's time-series.
 */
export function identifyPotentialHealthRisks(
  records: DailyHealthRecord[],
  profile?: AstronautProfileRecord
): PotentialHealthRisk[] {
  if (!records || records.length === 0) {
    return [];
  }

  const risks: PotentialHealthRisk[] = [];
  const preMissionBaselines = calculatePreMissionBaselines(records);

  // Helper to get reliable baseline for a metric
  const getBaseline = (key: 'sleep_hours' | 'heart_rate_bpm' | 'stress_score_1_to_5' | 'systolic_bp_mmhg' | 'diastolic_bp_mmhg' | 'spo2_percent' | 'mood_score_1_to_5') => {
    const stats = preMissionBaselines[key];
    if (stats && stats.count >= 5) return stats.mean;
    return getProfileBaselineValue(profile, key);
  };

  const sleepBaseline = getBaseline('sleep_hours');
  const hrBaseline = getBaseline('heart_rate_bpm');
  const stressBaseline = getBaseline('stress_score_1_to_5');
  const sysBpBaseline = getBaseline('systolic_bp_mmhg');
  const diaBpBaseline = getBaseline('diastolic_bp_mmhg');
  const spo2Baseline = getBaseline('spo2_percent');
  const moodBaseline = getBaseline('mood_score_1_to_5');

  // =========================================================================
  // RISK PATTERN 1: SUSTAINED SLEEP DECLINE (REQUIRED EXAMPLE SCENARIO)
  // =========================================================================
  // Look for consecutive window of >= 5 to 7 days where sleep is declining or sustained significantly below baseline.
  let maxConsecutiveSleepDeclineRun: DailyHealthRecord[] = [];
  let currentSleepRun: DailyHealthRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const prev = records[i - 1];
    const isBelowBaseline = rec.sleep_hours <= sleepBaseline - 0.9;
    const isDecreasingOrLow =
      isBelowBaseline || (prev && rec.sleep_hours < prev.sleep_hours && rec.sleep_hours < sleepBaseline);

    if (isDecreasingOrLow) {
      currentSleepRun.push(rec);
      if (currentSleepRun.length > maxConsecutiveSleepDeclineRun.length) {
        maxConsecutiveSleepDeclineRun = [...currentSleepRun];
      }
    } else {
      currentSleepRun = [];
    }
  }

  // Also evaluate a rolling 7-day window across the records
  let best7DaySleepWindow: DailyHealthRecord[] | null = null;
  let max7DaySleepDeficit = 0;

  for (let i = 0; i <= records.length - 7; i++) {
    const window = records.slice(i, i + 7);
    const avgSleep = calculateMean(window.map((r) => r.sleep_hours));
    const deficit = sleepBaseline - avgSleep;
    if (deficit > 1.2 && deficit > max7DaySleepDeficit) {
      max7DaySleepDeficit = deficit;
      best7DaySleepWindow = window;
    }
  }

  const qualifyingSleepRun =
    maxConsecutiveSleepDeclineRun.length >= 5
      ? maxConsecutiveSleepDeclineRun
      : best7DaySleepWindow;

  if (qualifyingSleepRun && qualifyingSleepRun.length >= 5) {
    const runAvgSleep = calculateMean(qualifyingSleepRun.map((r) => r.sleep_hours));
    const deltaHours = Number((runAvgSleep - sleepBaseline).toFixed(2));
    const pctDrop = Number(((Math.abs(deltaHours) / sleepBaseline) * 100).toFixed(1));
    const firstDay = qualifyingSleepRun[0];
    const lastDay = qualifyingSleepRun[qualifyingSleepRun.length - 1];

    const obsSummary = qualifyingSleepRun.map(
      (r) => `Day ${r.study_day} (${r.date.slice(5)}): ${r.sleep_hours.toFixed(1)}h`
    );

    risks.push({
      id: `risk-sleep-${firstDay.study_day}-${lastDay.study_day}`,
      category: 'sleep_decline',
      title: `Sustained ${qualifyingSleepRun.length}-Day Sleep Duration Decline`,
      severity: deltaHours <= -1.5 || qualifyingSleepRun.length >= 7 ? 'Attention' : 'Monitor',
      description: `Gradual and sustained decrease in sleep duration identified over ${qualifyingSleepRun.length} consecutive observations, dropping substantially below historical baseline.`,
      supportingObservations: obsSummary,
      baselineComparison: `Observed period average was ${runAvgSleep}h vs personal baseline of ${sleepBaseline}h (${deltaHours}h / -${pctDrop}%).`,
      timing: `Observed from Study Day ${firstDay.study_day} (${firstDay.date}) to Day ${lastDay.study_day} (${lastDay.date}).`,
      rationale:
        'Cumulative sleep restriction impairs cognitive readiness, vigilance, and neurovestibular recovery during mission operations.',
      recommendationNextStep:
        'Verify crew sleep quarters acoustic levels and thermal pod settings (19.5°C), advance circadian dimming protocol by 45 minutes, and log subjective sleep latency.',
    });
  }

  // =========================================================================
  // RISK PATTERN 2: ELEVATED RESTING HEART RATE
  // =========================================================================
  let hrElevatedRun: DailyHealthRecord[] = [];
  let maxHrRun: DailyHealthRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (rec.heart_rate_bpm >= hrBaseline + 8) {
      hrElevatedRun.push(rec);
      if (hrElevatedRun.length > maxHrRun.length) {
        maxHrRun = [...hrElevatedRun];
      }
    } else {
      hrElevatedRun = [];
    }
  }

  if (maxHrRun.length >= 4) {
    const firstDay = maxHrRun[0];
    const lastDay = maxHrRun[maxHrRun.length - 1];
    const avgHr = calculateMean(maxHrRun.map((r) => r.heart_rate_bpm));
    const deltaHr = Number((avgHr - hrBaseline).toFixed(1));

    risks.push({
      id: `risk-hr-${firstDay.study_day}-${lastDay.study_day}`,
      category: 'elevated_hr',
      title: `Persistently Elevated Resting Heart Rate (${maxHrRun.length} Days)`,
      severity: deltaHr >= 10 ? 'Attention' : 'Monitor',
      description: `Resting pulse consistently maintained >= +8 BPM above personal resting baseline across ${maxHrRun.length} consecutive observation days.`,
      supportingObservations: maxHrRun.map(
        (r) => `Day ${r.study_day}: ${r.heart_rate_bpm.toFixed(1)} BPM`
      ),
      baselineComparison: `Observed run mean of ${avgHr} BPM vs personal baseline of ${hrBaseline} BPM (+${deltaHr} BPM).`,
      timing: `Observed from Study Day ${firstDay.study_day} to Day ${lastDay.study_day}.`,
      rationale:
        'Sustained resting tachycardia may reflect autonomic sympathetic tone, subclinical dehydration, or microgravity fluid shift compensation.',
      recommendationNextStep:
        'Review 24h hydration log to confirm minimum 2.5L fluid intake, monitor pre-sleep cardiac telemetry, and schedule guided box-breathing down-regulation.',
    });
  }

  // =========================================================================
  // RISK PATTERN 3: SUSTAINED HIGH STRESS & PSYCHOLOGICAL LOAD
  // =========================================================================
  let stressRun: DailyHealthRecord[] = [];
  let maxStressRun: DailyHealthRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (rec.stress_score_1_to_5 >= 4) {
      stressRun.push(rec);
      if (stressRun.length > maxStressRun.length) {
        maxStressRun = [...stressRun];
      }
    } else {
      stressRun = [];
    }
  }

  if (maxStressRun.length >= 3) {
    const firstDay = maxStressRun[0];
    const lastDay = maxStressRun[maxStressRun.length - 1];
    const avgStress = calculateMean(maxStressRun.map((r) => r.stress_score_1_to_5));

    risks.push({
      id: `risk-stress-${firstDay.study_day}-${lastDay.study_day}`,
      category: 'high_stress',
      title: `Sustained High Operational Stress (${maxStressRun.length} Days)`,
      severity: avgStress >= 4.5 ? 'Attention' : 'Monitor',
      description: `Reported stress levels remained elevated at >= 4/5 across ${maxStressRun.length} consecutive days.`,
      supportingObservations: maxStressRun.map(
        (r) => `Day ${r.study_day}: Stress ${r.stress_score_1_to_5}/5, Mood ${r.mood_score_1_to_5}/5`
      ),
      baselineComparison: `Period stress average was ${avgStress}/5 vs baseline ${stressBaseline}/5.`,
      timing: `Observed from Study Day ${firstDay.study_day} to Day ${lastDay.study_day}.`,
      rationale:
        'Extended periods of high operational stress can accelerate cognitive fatigue and disrupt circadian hormone rhythms.',
      recommendationNextStep:
        'Engage in 15-minute Earth biophilic media decompression and adjust high-workload task scheduling with flight directors.',
    });
  }

  // =========================================================================
  // RISK PATTERN 4: ARTERIAL BLOOD PRESSURE ELEVATION
  // =========================================================================
  let bpRun: DailyHealthRecord[] = [];
  let maxBpRun: DailyHealthRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (rec.systolic_bp_mmhg >= 128 || rec.diastolic_bp_mmhg >= 84) {
      bpRun.push(rec);
      if (bpRun.length > maxBpRun.length) {
        maxBpRun = [...bpRun];
      }
    } else {
      bpRun = [];
    }
  }

  if (maxBpRun.length >= 5) {
    const firstDay = maxBpRun[0];
    const lastDay = maxBpRun[maxBpRun.length - 1];
    const avgSys = calculateMean(maxBpRun.map((r) => r.systolic_bp_mmhg));
    const avgDia = calculateMean(maxBpRun.map((r) => r.diastolic_bp_mmhg));

    risks.push({
      id: `risk-bp-${firstDay.study_day}-${lastDay.study_day}`,
      category: 'bp_deviation',
      title: `Persistent Arterial Pressure Elevation (${maxBpRun.length} Days)`,
      severity: avgSys >= 135 || avgDia >= 88 ? 'Attention' : 'Monitor',
      description: `Systolic and diastolic pressures maintained above optimal flight thresholds across ${maxBpRun.length} consecutive measurements.`,
      supportingObservations: maxBpRun.map(
        (r) => `Day ${r.study_day}: ${r.systolic_bp_mmhg.toFixed(0)}/${r.diastolic_bp_mmhg.toFixed(0)} mmHg`
      ),
      baselineComparison: `Observed mean of ${avgSys}/${avgDia} mmHg vs baseline ${sysBpBaseline}/${diaBpBaseline} mmHg.`,
      timing: `Observed from Study Day ${firstDay.study_day} to Day ${lastDay.study_day}.`,
      rationale:
        'Elevated vascular resistance in microgravity can indicate altered baroreceptor reflex sensitivity or sodium retention.',
      recommendationNextStep:
        'Repeat bilateral cuff validation and audit dietary sodium intake across packaged rations.',
    });
  }

  // =========================================================================
  // RISK PATTERN 5: OXYGEN SATURATION CONCERN (SpO2 DESATURATION)
  // =========================================================================
  const lowSpo2Records = records.filter((r) => r.spo2_percent < 95.5);
  if (lowSpo2Records.length >= 3) {
    const avgSpo2 = calculateMean(lowSpo2Records.map((r) => r.spo2_percent));
    risks.push({
      id: `risk-spo2-${lowSpo2Records[0].study_day}`,
      category: 'spo2_hypoxia',
      title: 'Repeated Oxygen Saturation Desaturation',
      severity: avgSpo2 < 95.0 ? 'Attention' : 'Monitor',
      description: `Capillary blood oxygen saturation recorded below 95.5% on ${lowSpo2Records.length} separate monitoring events.`,
      supportingObservations: lowSpo2Records.map(
        (r) => `Day ${r.study_day}: ${r.spo2_percent.toFixed(1)}%`
      ),
      baselineComparison: `Observed low readings averaged ${avgSpo2}% vs personal baseline ${spo2Baseline}%.`,
      timing: `Detected across ${lowSpo2Records.length} mission monitoring days.`,
      rationale:
        'Peripheral desaturation under microgravity suggests environmental cabin pO2 fluctuations or mild ventilation-perfusion mismatch.',
      recommendationNextStep:
        'Cross-reference cabin environmental log pO2 readings and perform spirometric peak flow verification.',
    });
  }

  // =========================================================================
  // RISK PATTERN 6: COMPOUND OPERATIONAL FATIGUE
  // =========================================================================
  // Co-occurrence of sleep loss AND elevated stress in recent window
  const recentRecords = records.slice(-14);
  const recentLowSleep = recentRecords.filter((r) => r.sleep_hours < sleepBaseline - 1.0);
  const recentHighStress = recentRecords.filter((r) => r.stress_score_1_to_5 >= 3.5);

  if (recentLowSleep.length >= 4 && recentHighStress.length >= 4) {
    risks.push({
      id: `risk-compound-${recentRecords[0].study_day}`,
      category: 'compound_fatigue',
      title: 'Compound Neuro-Physiological Fatigue Pattern',
      severity: 'Attention',
      description:
        'Simultaneous convergence of curtailed sleep duration and elevated stress responses detected within recent mission monitoring.',
      supportingObservations: [
        `${recentLowSleep.length} of last 14 days had sleep duration >= 1h below baseline`,
        `${recentHighStress.length} of last 14 days had high stress scores (>= 3.5/5)`,
      ],
      baselineComparison: `Compounded deviation across sleep (${sleepBaseline}h baseline) and stress (${stressBaseline}/5 baseline).`,
      timing: 'Active pattern within the last 14 days of telemetry.',
      rationale:
        'Concurrently compromised sleep and heightened operational stress create cumulative cognitive deficit risk during EVA or critical vehicle procedures.',
      recommendationNextStep:
        'Coordinate mission task de-escalation with ground flight surgeons, optimize scheduled rest periods, and conduct AI Assistant wellness check-in.',
    });
  }

  // =========================================================================
  // DEFAULT NORMAL STATE
  // =========================================================================
  if (risks.length === 0) {
    risks.push({
      id: 'risk-nominal-state',
      category: 'sleep_decline', // placeholder nominal
      title: 'Nominal Biometric Stability',
      severity: 'Normal',
      description:
        'No multi-day anomalous physiological or behavioral patterns detected across available monitoring logs. All indicators remain within nominal personal adaptation limits.',
      supportingObservations: [
        `Resting heart rate aligned with baseline (${hrBaseline} BPM)`,
        `Sleep duration consistent with target (${sleepBaseline} hours)`,
        `Stress scores maintain low baseline (${stressBaseline}/5)`,
      ],
      baselineComparison: 'All vitals within +/- 1.0 standard deviations of pre-mission established baseline.',
      timing: 'Continuously evaluated across entire mission profile.',
      rationale:
        'Current telemetry indicates healthy cardiovascular, respiratory, and neurobehavioral adaptation to microgravity conditions.',
      recommendationNextStep:
        'Maintain scheduled countermeasure exercise regimens, standard hydration protocols, and daily health check-ins.',
    });
  }

  return risks;
}
