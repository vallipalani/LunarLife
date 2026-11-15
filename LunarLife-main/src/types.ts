export type PageId =
  | 'dashboard'
  | 'ai-assistant'
  | 'adaptive-assessment'
  | 'health-profile-info'
  | 'health-profile-analytics'
  | 'health-profile-recommendations'
  | 'settings';

export interface AstronautProfile {
  name: string;
  astronautId: string;
  role: string;
  mission: string;
  missionDay: string;
  age: number;
  bloodGroup: string;
  height: string;
  weight: string;
  avatarUrl: string;
  status: 'Stable' | 'Monitor' | 'Attention';
  healthScore: number;
  // Medical Details
  existingConditions: string[];
  allergies: string[];
  medications: string[];
  // Baselines
  baselineHeartRate: string;
  baselineBloodPressure: string;
  baselineBodyTemp: string;
  baselineSleep: string;
  baselineMood: string;
  // Pre-mission summary
  preMissionSummary: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'notice' | 'alert' | 'success';
}

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Good' | 'Monitor' | 'Attention';
  subtext: string;
  trend?: string;
  iconName: 'Heart' | 'Activity' | 'Thermometer' | 'Moon' | 'Smile';
}

export interface DailyTask {
  id: string;
  title: string;
  category?: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChartDataPoint {
  time: string;
  heartRate?: number;
  sleepHours?: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: 'Physical Activity' | 'Sleep Management' | 'Stress Management' | 'Preventive Health';
  completed: boolean;
}
