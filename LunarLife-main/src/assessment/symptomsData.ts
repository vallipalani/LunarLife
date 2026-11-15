import { SymptomCategory, SymptomDefinition, SymptomDuration, SymptomSeverity } from './types';

export const SYMPTOM_DEFINITIONS: SymptomDefinition[] = [
  {
    id: 'dizziness',
    name: 'Dizziness & Vertigo',
    categoryTag: 'Neuro-Vestibular',
    description: 'Postural instability, spinning sensation, disequilibrium, or space motion sensitivity.',
    iconName: 'Compass',
    flightContext: 'Often related to otolith microgravity recalibration, fluid redistribution, or vascular pooling.',
  },
  {
    id: 'fatigue',
    name: 'Fatigue & Exhaustion',
    categoryTag: 'Physical & Metabolic',
    description: 'General lethargy, reduced physical stamina, heavy limbs, or unrefreshing recovery.',
    iconName: 'BatteryLow',
    flightContext: 'Can stem from cumulative workload, disrupted sleep cycles, or electrolyte/hydration shifts.',
  },
  {
    id: 'headache',
    name: 'Headache & Cephalic Fullness',
    categoryTag: 'Cardiovascular & Cranial',
    description: 'Frontal or occipital cranial pressure, throbbing, or feeling of cephalic engorgement.',
    iconName: 'Brain',
    flightContext: 'Correlates with microgravity headward fluid shifts (puffy-face syndrome) or cabin CO2 elevation.',
  },
  {
    id: 'nausea',
    name: 'Nausea & Stomach Awareness',
    categoryTag: 'Gastrointestinal',
    description: 'Queasiness, loss of appetite, stomach awareness, or space motion sickness (SMS).',
    iconName: 'AlertCircle',
    flightContext: 'Occurs primarily during sensory conflict between visual and vestibular balance signals in orbit.',
  },
  {
    id: 'muscle-weakness',
    name: 'Muscle Weakness & Soreness',
    categoryTag: 'Musculoskeletal',
    description: 'Loss of muscular force, unexpected tremors, post-EVA soreness, or limb heaviness.',
    iconName: 'Dumbbell',
    flightContext: 'Monitored to differentiate normal post-workout adaptation from rapid muscle atrophy or electrolyte deficit.',
  },
  {
    id: 'sleep-difficulties',
    name: 'Sleep Difficulties & Insomnia',
    categoryTag: 'Circadian & Sleep',
    description: 'Difficulty falling asleep, frequent awakenings, early waking, or non-restorative sleep.',
    iconName: 'Moon',
    flightContext: 'Impacted by lack of 24h natural solar cues, cabin ventilation acoustics, and circadian disruption.',
  },
  {
    id: 'stress',
    name: 'Stress & Operational Anxiety',
    categoryTag: 'Cognitive & Behavioral',
    description: 'Mental tension, operational overload, focus difficulty, or heightened situational anxiety.',
    iconName: 'HeartHandshake',
    flightContext: 'High mission cadence, confined habitat dynamics, and communication latency stressors.',
  },
  {
    id: 'vision-changes',
    name: 'Visual Disturbances',
    categoryTag: 'SANS & Ophthalmic',
    description: 'Blurriness, difficulty focusing at near distances, floaters, or transient dark spots.',
    iconName: 'Eye',
    flightContext: 'Monitored for Spaceflight-Associated Neuro-ocular Syndrome (SANS) and intracranial pressure.',
  },
  {
    id: 'back-pain',
    name: 'Spinal Discomfort & Back Pain',
    categoryTag: 'Musculoskeletal',
    description: 'Aching or stiffness along lumbar, thoracic, or cervical spine without gravity compression.',
    iconName: 'Activity',
    flightContext: 'Results from 4–7 cm spinal elongation in zero gravity causing paravertebral muscular tension.',
  },
];

export const SEVERITY_CONFIG: Record<
  SymptomSeverity,
  { label: string; badgeVariant: 'success' | 'amber' | 'rose'; description: string; impactText: string }
> = {
  mild: {
    label: 'Mild',
    badgeVariant: 'amber',
    description: 'Noticeable discomfort, but does not hinder daily operational duties or focus.',
    impactText: 'Minimal operational impact. Self-monitoring advised.',
  },
  moderate: {
    label: 'Moderate',
    badgeVariant: 'amber',
    description: 'Interferes with routine activities or task efficiency; requires compensatory effort.',
    impactText: 'Moderate operational impact. Countermeasures recommended.',
  },
  severe: {
    label: 'Severe',
    badgeVariant: 'rose',
    description: 'Significantly impairs operational readiness, mission duty, or personal well-being.',
    impactText: 'High operational impact. Escalation to Flight Surgeon indicated.',
  },
};

export const DURATION_OPTIONS: { id: SymptomDuration; label: string; subtext: string }[] = [
  { id: 'less-than-2-hours', label: '< 2 Hours', subtext: 'Acute onset during current shift' },
  { id: '2-to-12-hours', label: '2 – 12 Hours', subtext: 'Developed over the course of today' },
  { id: '1-to-2-days', label: '1 – 2 Days', subtext: 'Persisted across recent sleep cycle' },
  { id: '3-to-7-days', label: '3 – 7 Days', subtext: 'Sub-acute, spanning several mission sols' },
  { id: 'more-than-1-week', label: '> 1 Week', subtext: 'Chronic or progressive manifestation' },
];
