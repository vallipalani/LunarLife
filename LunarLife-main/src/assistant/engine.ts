// On-board engine: works with no network. The AI layer is an optional enhancement.
import { HealthContext, AssistantReply, Urgency, maxUrgency } from './types';
import { HAZARD_GUIDANCE, SYMPTOMS, TOPIC_TO_GUIDANCE } from './knowledgeBase';
import { checkRedFlags } from './redFlags';

export function emergencyReply(flags: string[], ctx: HealthContext): AssistantReply {
  return {
    urgency: 'contact-medical-team',
    explanations: [
      'Your message or recorded readings match an emergency warning sign:',
      ...flags,
    ],
    next_steps: [
      'Contact the flight surgeon / medical team NOW.',
      'Stop activity and secure yourself. Alert a crewmate.',
      'Keep the readings and time of onset ready to report.',
    ],
    data_used: ctx.facts.map((f) => `${f.label}: ${f.value}`),
    source: 'onboard',
  };
}

// Which measurements to explain for each topic / keyword
const MEASURE_KEYS: { key: string; re: RegExp }[] = [
  { key: 'hr', re: /heart rate|pulse|bpm|heart/ },
  { key: 'bp', re: /blood pressure|\bbp\b|pressure reading/ },
  { key: 'temp', re: /temperature|fever/ },
  { key: 'spo2', re: /spo2|oxygen|saturation|breath/ },
  { key: 'sleep', re: /sleep/ },
];
const TOPIC_MEASURES: Record<string, string[]> = {
  heart: ['hr', 'bp'], sleep: ['sleep'], fever: ['temp'], breathing: ['spo2'], readings: ['hr', 'bp', 'temp', 'spo2', 'sleep'],
};
const MED_RE = /medicat|medicine|\bpill|tablet|painkiller|ibuprofen|paracetamol|acetaminophen|aspirin|\bdose\b|\bdrug/;

export function onboardReply(message: string, ctx: HealthContext): AssistantReply {
  const m = message.toLowerCase();
  const matched = SYMPTOMS.filter((s) => s.keywords.test(m));
  const topics = matched.length ? matched : SYMPTOMS.filter((s) => s.id === 'readings');

  let urgency: Urgency = 'routine';
  const explanations: string[] = [];
  const steps: string[] = [];

  topics.slice(0, 3).forEach((t) => {
    urgency = maxUrgency(urgency, t.baseUrgency);
    explanations.push(...t.explanations);
    steps.push(...t.next_steps);
    const gid = TOPIC_TO_GUIDANCE[t.id];
    const g = HAZARD_GUIDANCE.find((x) => x.guidance_id === gid);
    if (g) steps.push(`Mission guidance (${g.guidance_id}): ${g.guidance_text}`);
  });

  // Personalise with the astronaut's own data
  if (ctx.deviations.length) {
    explanations.unshift(`Your records show: ${ctx.deviations.join('; ')}.`);
    urgency = maxUrgency(urgency, 'monitor');
  } else if (ctx.latest) {
    explanations.unshift('Your latest readings are all within range of your personal baseline.');
    // If readings are normal and only a mild topic matched, keep it routine
    if (topics.every((t) => t.baseUrgency !== 'monitor')) urgency = 'routine';
  }

  // Measurement interpretation (plain-language meaning of the readings)
  const keys = new Set<string>();
  MEASURE_KEYS.forEach((k) => k.re.test(m) && keys.add(k.key));
  topics.forEach((t) => (TOPIC_MEASURES[t.id] ?? []).forEach((k) => keys.add(k)));
  const meaning = ['hr', 'bp', 'temp', 'spo2', 'sleep'].filter((k) => keys.has(k) && ctx.interpretations[k]).map((k) => ctx.interpretations[k]);
  explanations.splice(1, 0, ...meaning);

  // Medical history
  const { conditions, allergies, medications } = ctx.history;
  if (matched.length && conditions.length) {
    explanations.push(`Your history lists ${conditions.join(', ')}. Mention this to the medical team, as it may change how this symptom is assessed.`);
  }
  if (MED_RE.test(m)) {
    steps.push(
      `Before taking any medication, check with the medical team. Allergies on record: ${allergies.join(', ') || 'none'}. Current medications: ${medications.join(', ') || 'none'}.`
    );
    urgency = maxUrgency(urgency, 'monitor');
  }

  return {
    urgency,
    explanations: Array.from(new Set(explanations)),
    next_steps: Array.from(new Set(steps)),
    data_used: ctx.facts.filter((f) => f.flagged).map((f) => `${f.label}: ${f.value}`).concat(
      ctx.facts.filter((f) => !f.flagged).slice(0, 2).map((f) => `${f.label}: ${f.value}`)
    ),
    source: 'onboard',
  };
}

export { checkRedFlags };
