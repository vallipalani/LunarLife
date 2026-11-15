import guidance from './data/health_guidance.json';
import { Urgency } from './types';

// Small on-board symptom guide. DEMO CONTENT - requires clinical review before any real use.
export interface SymptomEntry {
  id: string;
  title: string;
  keywords: RegExp;
  explanations: string[];
  next_steps: string[];
  baseUrgency: Urgency;
}

export const SYMPTOMS: SymptomEntry[] = [
  {
    id: 'heart',
    title: 'Fast heartbeat / dizziness',
    keywords: /heart (is )?(beating|racing|pounding)|palpitation|fast(er)? heart|dizz|lightheaded|light-headed/,
    explanations: [
      'In microgravity, fluid shifts toward the head and can change heart rate and blood pressure.',
      'Dehydration, poor sleep, stress, caffeine or heavy exercise can raise heart rate and cause dizziness.',
      'Raised CO₂ or low oxygen can also contribute, so cabin air is worth checking.',
    ],
    next_steps: [
      'Stop activity, rest, and sip water or an electrolyte drink.',
      'Re-measure heart rate, blood pressure and SpO₂ after 10 minutes.',
      'Check the cabin CO₂ reading.',
      'Contact the medical team if it persists beyond 30 minutes, or if chest pain, fainting or breathlessness appears.',
    ],
    baseUrgency: 'monitor',
  },
  {
    id: 'headache',
    title: 'Headache',
    keywords: /headache|head (hurts|is pounding|ache)|migraine/,
    explanations: [
      'Headaches are common in spaceflight: fluid shifts, elevated cabin CO₂, dehydration and sleep loss are frequent causes.',
      'Eye strain and tension from long screen or task sessions can contribute.',
    ],
    next_steps: [
      'Check the cabin CO₂ reading and ventilation status.',
      'Hydrate, rest, and avoid long screen time for a while.',
      'Follow mission-approved medication guidance if the headache continues.',
      'Contact the medical team for sudden severe headache, vision changes, vomiting or confusion.',
    ],
    baseUrgency: 'monitor',
  },
  {
    id: 'sleep',
    title: 'Poor sleep',
    keywords: /sleep|insomnia|tired|fatigue|exhaust|restless/,
    explanations: [
      'Light/dark cycle disruption, noise, schedule shifts and stress commonly shorten sleep on missions.',
      'Short sleep can raise resting heart rate, lower mood and reduce concentration.',
    ],
    next_steps: [
      'Keep a fixed wind-down routine and dim lights an hour before sleep.',
      'Limit caffeine in the second half of the day.',
      'Log sleep daily; review the trend over the next 3 days.',
      'Contact the medical team if poor sleep continues for several nights or affects your tasks.',
    ],
    baseUrgency: 'routine',
  },
  {
    id: 'mood',
    title: 'Stress / low mood',
    keywords: /stress|anxious|anxiety|low mood|sad|depress|lonely|isolat|overwhelm|irritable/,
    explanations: [
      'Isolation, confinement and workload are known stressors on long missions.',
      'Mood and stress often move together with sleep and exercise.',
    ],
    next_steps: [
      'Use mission-approved wellbeing resources and schedule contact with crew or family.',
      'Keep exercise and sleep on plan.',
      'Contact designated crew medical support if low mood or stress persists or worsens.',
    ],
    baseUrgency: 'monitor',
  },
  {
    id: 'nausea',
    title: 'Nausea / space adaptation',
    keywords: /nause|vomit|motion sick|space sick|queasy/,
    explanations: [
      'Space adaptation syndrome is common in the first days of microgravity because of inner-ear and fluid changes.',
      'Later nausea can come from dehydration, CO₂ or illness.',
    ],
    next_steps: [
      'Reduce sudden head movements and rest in a stable position.',
      'Sip fluids slowly.',
      'Contact the medical team if vomiting continues, or if you cannot keep fluids down.',
    ],
    baseUrgency: 'monitor',
  },
  {
    id: 'fever',
    title: 'Fever / feeling unwell',
    keywords: /fever|feverish|temperature|chills|\bsick\b|infection/,
    explanations: [
      'Spaceflight can alter immune response, so infections or latent viruses may show up as fever or chills.',
    ],
    next_steps: [
      'Re-measure temperature and log it.',
      'Hydrate and rest; limit close contact with crew.',
      'Contact the medical team if temperature stays above 38 °C or you feel worse.',
    ],
    baseUrgency: 'monitor',
  },
  {
    id: 'breathing',
    title: 'Breathing / oxygen',
    keywords: /breath|short of air|shortness|cough|spo2|oxygen/,
    explanations: [
      'Breathlessness can come from raised cabin CO₂, reduced oxygen, exertion, or respiratory irritation.',
    ],
    next_steps: [
      'Stop activity, sit/secure yourself, and breathe slowly.',
      'Check SpO₂ and the cabin CO₂ reading.',
      'Contact the medical team promptly if SpO₂ is under 94% or breathing does not ease.',
    ],
    baseUrgency: 'monitor',
  },
  {
    id: 'musculoskeletal',
    title: 'Back / muscle / joint pain',
    keywords: /back (pain|hurts)|muscle|joint|sore|cramp|stiff|bone/,
    explanations: [
      'Microgravity unloads the spine and muscles; back pain and stiffness are common.',
      'Missing exercise sessions speeds up muscle and bone loss.',
    ],
    next_steps: [
      'Follow the assigned exercise plan and gentle stretching.',
      'Record the pain location and severity.',
      'Consult the crew medical or exercise specialist before changing your plan.',
    ],
    baseUrgency: 'routine',
  },
  {
    id: 'readings',
    title: 'Interpret my readings',
    keywords: /reading|vitals|summary|how am i|status|my data|results|check my|explain my/,
    explanations: ['Your latest readings are compared against your personal baseline below.'],
    next_steps: ['Repeat any flagged measurement under mission procedure and log symptoms.'],
    baseUrgency: 'routine',
  },
  {
    id: 'cabin',
    title: 'Cabin air / CO₂',
    keywords: /co2|co₂|carbon dioxide|cabin|air quality|ventilation|humidity/,
    explanations: [
      'Elevated cabin CO₂ is a common cause of headache, drowsiness and faster breathing in closed environments.',
    ],
    next_steps: [
      'Check the sensor status and the environmental-control procedures.',
      'Notify the crew and follow spacecraft ventilation procedures if the reading stays high.',
    ],
    baseUrgency: 'monitor',
  },
];

export interface HazardGuidance {
  guidance_id: string;
  hazard_category: string;
  topic: string;
  guidance_text: string;
}
export const HAZARD_GUIDANCE = guidance as HazardGuidance[];

/** Hazard guidance from the ASTRA pack (G001–G006) matched to a topic id. */
export const TOPIC_TO_GUIDANCE: Record<string, string> = {
  mood: 'G002',
  sleep: 'G006',
  heart: 'G006',
  cabin: 'G005',
  headache: 'G005',
  musculoskeletal: 'G004',
  readings: 'G006',
};
