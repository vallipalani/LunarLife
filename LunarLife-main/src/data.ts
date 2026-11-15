import {
  AstronautProfile,
  NotificationItem,
  HealthMetric,
  DailyTask,
  ChatMessage,
  ChartDataPoint,
  RecommendationItem,
} from './types';

// ============================================================================
// 1. ASTRONAUT PROFILE (Alex Morgan)
// ============================================================================

export const initialAstronautProfile: AstronautProfile = {
  name: 'Alex Morgan',
  astronautId: 'AST-024',
  role: 'Mission Commander & Lead Specialist',
  mission: 'ORION-07',
  missionDay: 'DAY 124',
  age: 32,
  bloodGroup: 'O+',
  height: '180 cm',
  weight: '74 kg',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  status: 'Stable',
  healthScore: 92,
  // Medical History
  existingConditions: [
    'Childhood exercise-induced bronchospasm (resolved, no symptoms in >10 years)',
    'Mild seasonal rhinitis (controlled with antihistamines when required)',
  ],
  allergies: [
    'Penicillin (moderate cutaneous reaction / urticaria)',
    'No known food, latex, or zero-G adhesive allergies',
  ],
  medications: [
    'Daily Multivitamin + Vitamin D3 2,000 IU (bone density countermeasure)',
    'Electrolyte-fortified hydration pack (1 packet BID during shift)',
    'Melatonin 1.0 mg (PRN during orbital circadian shift intervals)',
  ],
  // Baselines
  baselineHeartRate: '65–75 BPM',
  baselineBloodPressure: '110/70–120/80 mmHg',
  baselineBodyTemp: '36.5–37.2°C',
  baselineSleep: '8.0 hours',
  baselineMood: 'Stable',
  // Pre-mission Assessment
  preMissionSummary:
    'Passed NASA/ESA Class-I Long-Duration Flight Physical at Johnson Space Center (T-45). Cardiovascular endurance top 5th percentile (VO2 max 52.4 mL/kg/min). Bone mineral density baseline T-score +1.2. Vestibular microgravity adaptation profile rated exceptional. Cleared for unrestricted mission duties, including Extravehicular Activity (EVA).',
};

// ============================================================================
// 2. DASHBOARD HEALTH METRICS
// ============================================================================

export const dashboardMetrics: HealthMetric[] = [
  {
    id: 'heart-rate',
    label: 'Heart Rate',
    value: '72',
    unit: 'BPM',
    status: 'Normal',
    subtext: 'Resting pulse nominal',
    trend: 'Stable vs 7-day avg',
    iconName: 'Heart',
  },
  {
    id: 'blood-pressure',
    label: 'Blood Pressure',
    value: '118/78',
    unit: 'mmHg',
    status: 'Normal',
    subtext: 'Cardiovascular equilibrium',
    trend: 'Optimal zone',
    iconName: 'Activity',
  },
  {
    id: 'body-temperature',
    label: 'Body Temperature',
    value: '36.8',
    unit: '°C',
    status: 'Normal',
    subtext: 'Core thermal balance',
    trend: 'Consistent',
    iconName: 'Thermometer',
  },
  {
    id: 'sleep',
    label: 'Sleep Duration',
    value: '7.5',
    unit: 'hours',
    status: 'Good',
    subtext: '88% sleep efficiency',
    trend: '-30m from target (8.0h)',
    iconName: 'Moon',
  },
  {
    id: 'mood',
    label: 'Mood & Readiness',
    value: 'Good',
    unit: 'Positive',
    status: 'Good',
    subtext: 'Cognitive alertness high',
    trend: 'Resilience rated high',
    iconName: 'Smile',
  },
];

// ============================================================================
// 3. DASHBOARD DAILY TASKS
// ============================================================================

export const initialDailyTasks: DailyTask[] = [
  { id: 'task-1', title: 'Complete health assessment', completed: true },
  { id: 'task-2', title: 'Drink sufficient water', completed: true },
  { id: 'task-3', title: 'Complete daily exercise', completed: true },
  { id: 'task-4', title: 'Record mood', completed: false },
  { id: 'task-5', title: 'Maintain sleep schedule', completed: false },
];

// ============================================================================
// 4. RECENT ALERTS
// ============================================================================

export const recentAlerts: NotificationItem[] = [
  {
    id: 'alt-1',
    title: 'Sleep duration was slightly below target.',
    description: 'Recorded 7.5 hours vs target of 8.0 hours. Recommend adjusting cabin dim cycle.',
    time: '06:30 UTC',
    unread: true,
    type: 'alert',
  },
  {
    id: 'alt-2',
    title: 'Health measurements updated.',
    description: 'Autonomous morning biometric telemetry synchronised with Ground Medical Control.',
    time: '08:15 UTC',
    unread: false,
    type: 'notice',
  },
  {
    id: 'alt-3',
    title: 'Daily health assessment completed.',
    description: 'Cardiovascular, metabolic, and neuro-vestibular ratings logged successfully.',
    time: '09:00 UTC',
    unread: false,
    type: 'success',
  },
];

// ============================================================================
// 5. DASHBOARD TRENDS DATA (24 Hours, 7 Days, 30 Days)
// ============================================================================

export const dashboardTrendsData: Record<'24h' | '7d' | '30d', { heartRate: ChartDataPoint[]; sleep: ChartDataPoint[] }> = {
  '24h': {
    heartRate: [
      { time: '00:00', heartRate: 64 },
      { time: '03:00', heartRate: 61 },
      { time: '06:00', heartRate: 68 },
      { time: '09:00', heartRate: 78 },
      { time: '12:00', heartRate: 74 },
      { time: '15:00', heartRate: 85 }, // workout
      { time: '18:00', heartRate: 72 },
      { time: '21:00', heartRate: 67 },
      { time: 'Now', heartRate: 72 },
    ],
    sleep: [
      { time: 'Cycle 1', sleepHours: 7.2 },
      { time: 'Cycle 2', sleepHours: 7.8 },
      { time: 'Cycle 3', sleepHours: 7.5 },
      { time: 'Today', sleepHours: 7.5 },
    ],
  },
  '7d': {
    heartRate: [
      { time: 'Day 118', heartRate: 70 },
      { time: 'Day 119', heartRate: 73 },
      { time: 'Day 120', heartRate: 71 },
      { time: 'Day 121', heartRate: 69 },
      { time: 'Day 122', heartRate: 74 },
      { time: 'Day 123', heartRate: 71 },
      { time: 'Day 124', heartRate: 72 },
    ],
    sleep: [
      { time: 'Day 118', sleepHours: 7.8 },
      { time: 'Day 119', sleepHours: 8.0 },
      { time: 'Day 120', sleepHours: 7.4 },
      { time: 'Day 121', sleepHours: 8.1 },
      { time: 'Day 122', sleepHours: 7.6 },
      { time: 'Day 123', sleepHours: 7.3 },
      { time: 'Day 124', sleepHours: 7.5 },
    ],
  },
  '30d': {
    heartRate: [
      { time: 'Wk 1', heartRate: 69 },
      { time: 'Wk 2', heartRate: 71 },
      { time: 'Wk 3', heartRate: 73 },
      { time: 'Wk 4', heartRate: 72 },
    ],
    sleep: [
      { time: 'Wk 1', sleepHours: 7.9 },
      { time: 'Wk 2', sleepHours: 7.8 },
      { time: 'Wk 3', sleepHours: 7.6 },
      { time: 'Wk 4', sleepHours: 7.5 },
    ],
  },
};

// ============================================================================
// 6. PREDICTIVE ANALYTICS DATA (7 Days, 30 Days, 90 Days)
// ============================================================================

export interface PredictiveChartSet {
  heartRate: ChartDataPoint[];
  sleep: ChartDataPoint[];
  bloodPressure: ChartDataPoint[];
}

export const predictiveAnalyticsData: Record<'7d' | '30d' | '90d', PredictiveChartSet> = {
  '7d': {
    heartRate: [
      { time: 'Day 118', heartRate: 70 },
      { time: 'Day 119', heartRate: 73 },
      { time: 'Day 120', heartRate: 71 },
      { time: 'Day 121', heartRate: 69 },
      { time: 'Day 122', heartRate: 74 },
      { time: 'Day 123', heartRate: 71 },
      { time: 'Day 124', heartRate: 72 },
    ],
    sleep: [
      { time: 'Day 118', sleepHours: 7.8 },
      { time: 'Day 119', sleepHours: 8.0 },
      { time: 'Day 120', sleepHours: 7.4 },
      { time: 'Day 121', sleepHours: 8.1 },
      { time: 'Day 122', sleepHours: 7.6 },
      { time: 'Day 123', sleepHours: 7.3 },
      { time: 'Day 124', sleepHours: 7.5 },
    ],
    bloodPressure: [
      { time: 'Day 118', systolic: 116, diastolic: 76 },
      { time: 'Day 119', systolic: 118, diastolic: 78 },
      { time: 'Day 120', systolic: 117, diastolic: 77 },
      { time: 'Day 121', systolic: 115, diastolic: 75 },
      { time: 'Day 122', systolic: 119, diastolic: 79 },
      { time: 'Day 123', systolic: 117, diastolic: 77 },
      { time: 'Day 124', systolic: 118, diastolic: 78 },
    ],
  },
  '30d': {
    heartRate: [
      { time: 'Day 95', heartRate: 69 },
      { time: 'Day 100', heartRate: 70 },
      { time: 'Day 105', heartRate: 72 },
      { time: 'Day 110', heartRate: 71 },
      { time: 'Day 115', heartRate: 74 },
      { time: 'Day 120', heartRate: 71 },
      { time: 'Day 124', heartRate: 72 },
    ],
    sleep: [
      { time: 'Day 95', sleepHours: 8.0 },
      { time: 'Day 100', sleepHours: 7.9 },
      { time: 'Day 105', sleepHours: 7.8 },
      { time: 'Day 110', sleepHours: 7.7 },
      { time: 'Day 115', sleepHours: 7.6 },
      { time: 'Day 120', sleepHours: 7.4 },
      { time: 'Day 124', sleepHours: 7.5 },
    ],
    bloodPressure: [
      { time: 'Day 95', systolic: 115, diastolic: 75 },
      { time: 'Day 100', systolic: 116, diastolic: 76 },
      { time: 'Day 105', systolic: 117, diastolic: 77 },
      { time: 'Day 110', systolic: 118, diastolic: 77 },
      { time: 'Day 115', systolic: 119, diastolic: 78 },
      { time: 'Day 120', systolic: 117, diastolic: 76 },
      { time: 'Day 124', systolic: 118, diastolic: 78 },
    ],
  },
  '90d': {
    heartRate: [
      { time: 'Day 35', heartRate: 68 },
      { time: 'Day 50', heartRate: 69 },
      { time: 'Day 65', heartRate: 70 },
      { time: 'Day 80', heartRate: 72 },
      { time: 'Day 95', heartRate: 71 },
      { time: 'Day 110', heartRate: 73 },
      { time: 'Day 124', heartRate: 72 },
    ],
    sleep: [
      { time: 'Day 35', sleepHours: 8.2 },
      { time: 'Day 50', sleepHours: 8.1 },
      { time: 'Day 65', sleepHours: 7.9 },
      { time: 'Day 80', sleepHours: 7.8 },
      { time: 'Day 95', sleepHours: 7.7 },
      { time: 'Day 110', sleepHours: 7.5 },
      { time: 'Day 124', sleepHours: 7.5 },
    ],
    bloodPressure: [
      { time: 'Day 35', systolic: 114, diastolic: 74 },
      { time: 'Day 50', systolic: 115, diastolic: 75 },
      { time: 'Day 65', systolic: 116, diastolic: 76 },
      { time: 'Day 80', systolic: 117, diastolic: 76 },
      { time: 'Day 95', systolic: 118, diastolic: 77 },
      { time: 'Day 110', systolic: 118, diastolic: 78 },
      { time: 'Day 124', systolic: 118, diastolic: 78 },
    ],
  },
};

// ============================================================================
// 7. HEALTH COMPARISONS (Pre-mission Baseline vs Current)
// ============================================================================

export interface HealthComparisonItem {
  metric: string;
  baseline: string;
  current: string;
  difference: string;
  status: 'Normal' | 'Monitor' | 'Attention';
  description: string;
}

export const healthComparisonData: HealthComparisonItem[] = [
  {
    metric: 'Heart Rate',
    baseline: '68 BPM',
    current: '72 BPM',
    difference: '+4 BPM',
    status: 'Normal',
    description: 'Well within the baseline resting band (65–75 BPM).',
  },
  {
    metric: 'Blood Pressure',
    baseline: '115/75 mmHg',
    current: '118/78 mmHg',
    difference: '+3 / +3 mmHg',
    status: 'Normal',
    description: 'Stable arterial pressure with nominal cerebral perfusion.',
  },
  {
    metric: 'Body Temperature',
    baseline: '36.6°C',
    current: '36.8°C',
    difference: '+0.2°C',
    status: 'Normal',
    description: 'Thermoregulation nominal during cabin duty cycles.',
  },
  {
    metric: 'Sleep Duration',
    baseline: '8.0 hours',
    current: '7.5 hours',
    difference: '-0.5 hours',
    status: 'Monitor',
    description: 'Slight decrease attributed to recent orbital EVA prep.',
  },
];

// ============================================================================
// 8. PREDICTIVE OBSERVATIONS
// ============================================================================

export interface ObservationItem {
  id: string;
  text: string;
  status: 'Normal' | 'Monitor' | 'Attention';
  detail: string;
}

export const predictiveObservations: ObservationItem[] = [
  {
    id: 'obs-1',
    text: 'Sleep duration has slightly decreased.',
    status: 'Monitor',
    detail: 'Average sleep over the past 14 days has trended down by 30 minutes, likely influenced by the circadian shift schedule.',
  },
  {
    id: 'obs-2',
    text: 'Heart rate remains within the expected baseline.',
    status: 'Normal',
    detail: 'Resting pulse stability indicates excellent cardiovascular adaptation to continuous microgravity.',
  },
  {
    id: 'obs-3',
    text: 'Stress indicators have increased slightly.',
    status: 'Attention',
    detail: 'Elevated daytime sympathetic tone and mild cortisol markers detected following the Day 120 spacewalk readiness drills.',
  },
];

// ============================================================================
// 9. HEALTH RECOMMENDATIONS
// ============================================================================

export const initialRecommendations: RecommendationItem[] = [
  // Physical Activity
  {
    id: 'rec-1',
    category: 'Physical Activity',
    title: 'ARED High-Resistance Regimen',
    description: 'Perform 45 minutes on the Advanced Resistive Exercise Device focusing on squat, deadlift, and heel-raise equivalents to preserve bone mineral density.',
    completed: true,
  },
  {
    id: 'rec-2',
    category: 'Physical Activity',
    title: 'Cycle Ergometer Aerobic Training',
    description: 'Execute 30 minutes of interval cardiovascular conditioning maintaining 75% VO2 peak with heart rate targets between 135–150 BPM.',
    completed: false,
  },
  {
    id: 'rec-3',
    category: 'Physical Activity',
    title: 'Spinal Decompression & Postural Alignment',
    description: 'Dedicate 15 minutes of targeted zero-G axial stretching to alleviate microgravity-induced spinal elongation and lower lumbar tension.',
    completed: true,
  },

  // Sleep Management
  {
    id: 'rec-4',
    category: 'Sleep Management',
    title: 'Circadian Light Attenuation Protocol',
    description: 'Dim crew quarters ambient lighting to 20% blue-attenuated light 45 minutes before scheduled rest to stimulate endogenous melatonin release.',
    completed: false,
  },
  {
    id: 'rec-5',
    category: 'Sleep Management',
    title: 'Acoustic Masking & Thermal Pod Calibration',
    description: 'Maintain sleep compartment airflow temperature at 19.5°C and ensure active noise-cancelling headset protocol is engaged during sleep cycles.',
    completed: true,
  },
  {
    id: 'rec-6',
    category: 'Sleep Management',
    title: 'Consistent Sleep Window Adherence',
    description: 'Enforce strict 22:00 to 06:00 UTC sleep scheduling even across orbital high-frequency ground transmission intervals.',
    completed: false,
  },

  // Stress Management
  {
    id: 'rec-7',
    category: 'Stress Management',
    title: 'Cyclic Box Breathing Exercises',
    description: 'Practice 5 minutes of 4-4-4-4 cyclic breath pacing (inhale, hold, exhale, hold) twice daily to downregulate autonomic sympathetic tone.',
    completed: true,
  },
  {
    id: 'rec-8',
    category: 'Stress Management',
    title: 'Earth Biome Sensory Decompression',
    description: 'Engage with 15 minutes of immersive natural soundscapes or visual biophilic media to combat cabin sensory deprivation.',
    completed: false,
  },
  {
    id: 'rec-9',
    category: 'Stress Management',
    title: 'Mission Journaling & Psychological Check-In',
    description: 'Log subjective mood and cognitive workload in the secure flight logbook prior to end-of-shift crew handover.',
    completed: false,
  },

  // Preventive Health
  {
    id: 'rec-10',
    category: 'Preventive Health',
    title: 'Targeted Electrolyte Hydration Protocol',
    description: 'Consume a minimum of 2.5 litres of electrolyte-balanced fluid daily to compensate for microgravity cephalad fluid shifts.',
    completed: true,
  },
  {
    id: 'rec-11',
    category: 'Preventive Health',
    title: 'Bone Density Micronutrient Intake',
    description: 'Take prescribed daily 2,000 IU Vitamin D3 and 1,000 mg Calcium supplements following the midday meal.',
    completed: true,
  },
  {
    id: 'rec-12',
    category: 'Preventive Health',
    title: 'Midday Biometric Baseline Verification',
    description: 'Perform a secondary tympanic temperature scan and cuffless blood pressure reading prior to afternoon EVA simulations.',
    completed: false,
  },
];

export const initialFollowUpTasks: DailyTask[] = [
  { id: 'fu-1', title: 'Monitor sleep duration', completed: true },
  { id: 'fu-2', title: 'Complete daily health assessment', completed: true },
  { id: 'fu-3', title: 'Record mood', completed: false },
  { id: 'fu-4', title: 'Maintain daily activity', completed: true },
];

// ============================================================================
// 10. AI ASSISTANT DEMO KNOWLEDGE BASE
// ============================================================================

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: 'Hello Commander Morgan. I am your autonomous AI Medical Assistant aboard ORION-07. All systems are synchronised with your current biometric telemetry. How can I assist you with your health, telemetry readings, or daily protocols today?',
    timestamp: '09:00 UTC',
  },
];

export const suggestedAssistantQuestions = [
  'Why is my heart rate higher today?',
  'How can I improve my sleep?',
  'Can you explain my latest health readings?',
  'How can I manage stress during my mission?',
];

export function getAssistantResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('heart rate') || q.includes('bpm') || q.includes('pulse')) {
    return 'Your current heart rate is 72 BPM, which is well within your nominal resting band (65–75 BPM). The minor +4 BPM elevation compared to your pre-mission baseline is standard microgravity cardiovascular adaptation. However, during your 15:00 UTC workout, your peak reached 85 BPM, indicating healthy cardiac response to aerobic exertion.';
  }

  if (q.includes('sleep') || q.includes('rest') || q.includes('insomnia') || q.includes('tired')) {
    return 'Your sleep telemetry for last night recorded 7.5 hours with 88% efficiency, which is -30 minutes below your 8.0-hour target. In microgravity, slight reductions are common during orbital operational phases. I recommend initiating your cabin light-dimming protocol 45 minutes earlier tonight and keeping your quarters temperature at 19.5°C.';
  }

  if (q.includes('reading') || q.includes('vitals') || q.includes('measurements') || q.includes('explain')) {
    return 'Here is a breakdown of your latest orbital telemetry (Day 124):\n• Heart Rate: 72 BPM (Nominal)\n• Blood Pressure: 118/78 mmHg (Optimal cerebral perfusion)\n• Body Temperature: 36.8°C (Normal thermoregulation)\n• Sleep: 7.5 hours (Good, minor decrease)\n• Mood: Positive readiness\nOverall composite score is 92/100 (Stable).';
  }

  if (q.includes('stress') || q.includes('anxiety') || q.includes('relaxation') || q.includes('pressure')) {
    return 'Elevated sympathetic tone was noted around Day 120 following spacewalk preparation drills. To mitigate cognitive fatigue, I recommend 5 minutes of cyclic 4-4-4-4 box breathing before handover, followed by a 15-minute Earth biome sensory session. These techniques reduce cortisol markers by up to 24% in zero-G environments.';
  }

  if (q.includes('water') || q.includes('hydration') || q.includes('fluid')) {
    return 'Hydration check: You have logged 2.1L out of your 2.5L daily target. Remember that in microgravity, thirst sensations can diminish due to fluid shifting toward the upper torso. Please complete your remaining electrolyte pack before the end of the shift.';
  }

  if (q.includes('exercise') || q.includes('workout') || q.includes('ared')) {
    return 'Your daily physical countermeasure requires 45 minutes on the ARED resistive unit (squats & deadlifts) and 30 minutes on the cycle ergometer. You have completed the ARED session; 30 minutes of aerobic conditioning remains scheduled for this orbital cycle.';
  }

  return `I have reviewed your query regarding "${query}". Based on your Day 124 telemetry, your physiological markers remain Stable with a 92/100 readiness score. Continue following your prescribed exercise and hydration protocols. If any symptoms or discomfort persist, Ground Medical Flight Surgeons are available for telemetry review.`;
}
