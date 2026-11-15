import { AdaptiveQuestion, SymptomCategory } from './types';

export const QUESTION_BANK: Record<SymptomCategory, AdaptiveQuestion[]> = {
  dizziness: [
    {
      id: 'diz-onset',
      symptomId: 'dizziness',
      text: 'When did the dizziness begin, and under what circumstances?',
      type: 'single-choice',
      required: true,
      contextHint: 'Helps distinguish acute neuro-vestibular shifts from orthostatic deconditioning.',
      options: [
        { value: 'sudden-at-rest', label: 'Suddenly while at rest or seated' },
        { value: 'posture-change', label: 'Upon translating or rapid head pitch/yaw rotation' },
        { value: 'post-exercise', label: 'Immediately following resistive/aerobic exercise session' },
        { value: 'post-eva', label: 'Following suit doffing or post-EVA airlock return' },
        { value: 'gradual', label: 'Gradual onset developing over several hours' },
      ],
    },
    {
      id: 'diz-pattern',
      symptomId: 'dizziness',
      text: 'Is the sensation continuous or occasional?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'continuous', label: 'Continuous unremitting disequilibrium' },
        { value: 'intermittent', label: 'Intermittent episodes lasting minutes' },
        { value: 'triggered', label: 'Brief spells (< 30 seconds) triggered only by motion' },
      ],
    },
    {
      id: 'diz-nausea-cross',
      symptomId: 'dizziness',
      text: 'Are you experiencing stomach awareness, queasiness, or nausea alongside the dizziness?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'No stomach discomfort or nausea' },
        { value: 'mild-queasy', label: 'Mild stomach awareness' },
        { value: 'moderate-nausea', label: 'Moderate nausea, but no retching' },
        { value: 'severe-vomiting', label: 'Severe nausea with dry heaves or vomiting', isRedFlag: true },
      ],
    },
    {
      id: 'diz-vision-cross',
      symptomId: 'dizziness',
      text: 'Are you experiencing changes in vision (such as blurred sight, oscillopsia, or dark tunnels)?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'normal', label: 'Normal visual clarity' },
        { value: 'blurred-transient', label: 'Transient blurring during head turns' },
        { value: 'tunnel-vision', label: 'Graying out or tunnel vision', isRedFlag: true },
        { value: 'diplopia', label: 'Double vision (diplopia)', isRedFlag: true },
      ],
    },
    {
      id: 'diz-weakness-cross',
      symptomId: 'dizziness',
      text: 'Have you noticed any unusual motor weakness, stumbling, or loss of limb coordination?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'No weakness or motor incoordination' },
        { value: 'mild-clumsy', label: 'Mild clumsiness handling small tools' },
        { value: 'unsteady-translation', label: 'Marked difficulty translating cleanly along handrails' },
        { value: 'asymmetric-weakness', label: 'Unilateral arm or leg weakness', isRedFlag: true },
      ],
    },
  ],

  fatigue: [
    {
      id: 'fat-duration',
      symptomId: 'fatigue',
      text: 'How long have you been experiencing this fatigue?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'today-only', label: 'Only during this current work shift' },
        { value: 'last-2-days', label: 'Across the past 24 to 48 hours' },
        { value: 'over-week', label: 'Persistent over the past week' },
        { value: 'gradual-cumulative', label: 'Cumulative fatigue building over multiple mission weeks' },
      ],
    },
    {
      id: 'fat-sleep-hours',
      symptomId: 'fatigue',
      text: 'How many hours of sleep did you achieve in your most recent rest interval?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'under-4', label: 'Less than 4.0 hours (acute sleep deficit)' },
        { value: '4-to-6', label: '4.0 to 6.0 hours (below target)' },
        { value: '6-to-7.5', label: '6.0 to 7.5 hours (near baseline)' },
        { value: '8-plus', label: '8.0+ hours (adequate duration, yet unrefreshing)' },
      ],
    },
    {
      id: 'fat-weakness-cross',
      symptomId: 'fatigue',
      text: 'Are you experiencing noticeable muscle weakness or heavy limbs alongside fatigue?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'No muscular weakness; strictly mental/energy fatigue' },
        { value: 'mild-heaviness', label: 'Mild sensation of heavy limbs' },
        { value: 'unable-workout', label: 'Muscular fatigue preventing full exercise countermeasure' },
      ],
    },
    {
      id: 'fat-activity-change',
      symptomId: 'fatigue',
      text: 'Has your physical activity or operational workload changed recently?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'standard', label: 'Nominal operational cadence and workout' },
        { value: 'high-eva', label: 'High EVA or high physical payload handling' },
        { value: 'missed-exercise', label: 'Missed planned aerobic/resistive countermeasure sessions' },
        { value: 'intense-cognitive', label: 'Extended high-focus troubleshooting without physical exertion' },
      ],
    },
    {
      id: 'fat-hydration',
      symptomId: 'fatigue',
      text: 'How has your hydration and electrolyte intake been during this shift?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'optimal', label: 'Optimal (> 2.5L water + electrolyte packet consumed)' },
        { value: 'moderate-low', label: 'Slightly reduced fluid intake (~1.5L, no electrolytes)' },
        { value: 'significantly-low', label: 'Significantly restricted fluid intake (< 1.0L)' },
      ],
    },
  ],

  headache: [
    {
      id: 'head-onset',
      symptomId: 'headache',
      text: 'When did the headache begin, and how rapidly did it develop?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'thunderclap', label: 'Sudden intense onset (< 5 minutes, "thunderclap")', isRedFlag: true },
        { value: 'morning-wake', label: 'Present immediately upon waking from sleep chamber' },
        { value: 'mid-shift-gradual', label: 'Gradual onset during active shift' },
        { value: 'post-exercise', label: 'Triggered during intense resistive exercise strain' },
      ],
    },
    {
      id: 'head-severity',
      symptomId: 'headache',
      text: 'How severe is the cranial pain on a 1–10 scale?',
      type: 'scale',
      min: 1,
      max: 10,
      minLabel: '1 (Very Mild)',
      maxLabel: '10 (Debilitating)',
      required: true,
    },
    {
      id: 'head-location',
      symptomId: 'headache',
      text: 'Where is the pain predominantly located?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'frontal-eyes', label: 'Frontal forehead & behind orbits/eyes' },
        { value: 'occipital-neck', label: 'Occipital (back of head) & upper neck' },
        { value: 'temporal-throbbing', label: 'One or both temples (throbbing)' },
        { value: 'vertex-diffuse', label: 'Top of head or diffuse generalized pressure ("head fullness")' },
      ],
    },
    {
      id: 'head-additional-symptoms',
      symptomId: 'headache',
      text: 'Are you experiencing any additional associated symptoms?',
      type: 'multi-choice',
      required: false,
      options: [
        { value: 'photophobia', label: 'Sensitivity to cabin lighting (photophobia)' },
        { value: 'phonophobia', label: 'Sensitivity to equipment hum/noise' },
        { value: 'neck-stiffness', label: 'Neck stiffness upon chin-to-chest flexion', isRedFlag: true },
        { value: 'sinus-congestion', label: 'Sinus/nasal congestion (microgravity fluid shift)' },
        { value: 'nausea', label: 'Mild nausea' },
      ],
    },
  ],

  'sleep-difficulties': [
    {
      id: 'sleep-hours',
      symptomId: 'sleep-difficulties',
      text: 'How many total hours of sleep did you achieve in your last sleep period?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'less-than-4', label: 'Under 4.0 hours' },
        { value: '4-to-5.5', label: '4.0 to 5.5 hours' },
        { value: '5.5-to-7', label: '5.5 to 7.0 hours' },
        { value: 'normal-duration-poor-quality', label: '7+ hours, but interrupted and non-restorative' },
      ],
    },
    {
      id: 'sleep-interruptions',
      symptomId: 'sleep-difficulties',
      text: 'How often have you experienced interrupted sleep or early awakenings?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'sleep-onset', label: 'Difficulty falling asleep (> 45 min latency)' },
        { value: 'frequent-wakes', label: 'Waking up 3 or more times per night' },
        { value: 'early-wake', label: 'Prematurely waking 2+ hours before alarm without resuming sleep' },
        { value: 'environmental', label: 'Interrupted by cabin airflow noise, alarms, or sleeping bag restraint' },
      ],
    },
    {
      id: 'sleep-daytime-fatigue',
      symptomId: 'sleep-difficulties',
      text: 'Have you noticed increased daytime fatigue or reduced cognitive reaction time?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'Minimal impairment; cognitive alertness remains high' },
        { value: 'mild-slump', label: 'Mild mid-shift sluggishness or concentration lapse' },
        { value: 'significant-fog', label: 'Significant brain fog, requiring re-checking mission steps' },
        { value: 'microsleep', label: 'Brief unintentional drowsy spells (microsleep risk)', isRedFlag: true },
      ],
    },
    {
      id: 'sleep-countermeasures',
      symptomId: 'sleep-difficulties',
      text: 'Are you currently utilizing any sleep countermeasures or circadian lighting aids?',
      type: 'multi-choice',
      required: false,
      options: [
        { value: 'melatonin', label: 'Oral Melatonin (per medical kit baseline)' },
        { value: 'circadian-lighting', label: 'Crew quarters blue-light mitigation / dim mode' },
        { value: 'eye-mask-plugs', label: 'Eye mask and noise-attenuating earplugs' },
        { value: 'none', label: 'No countermeasures active' },
      ],
    },
  ],

  nausea: [
    {
      id: 'nau-triggers',
      symptomId: 'nausea',
      text: 'Did the nausea correlate with specific triggers?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'head-turns', label: 'Rapid head rotation or translating between modules' },
        { value: 'food-consumption', label: 'Immediately following packaged food or rehydration pouch' },
        { value: 'cabin-odor', label: 'Cabin air odors or thermal stuffiness' },
        { value: 'spontaneous', label: 'Spontaneous onset without obvious physical trigger' },
      ],
    },
    {
      id: 'nau-emesis',
      symptomId: 'nausea',
      text: 'Have you experienced episodes of emesis (vomiting)?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'Queasiness only; no vomiting' },
        { value: 'single-episode', label: '1 isolated episode of vomiting' },
        { value: 'recurrent-vomiting', label: 'Multiple episodes (> 2); unable to retain oral fluids', isRedFlag: true },
      ],
    },
    {
      id: 'nau-fluid-tolerance',
      symptomId: 'nausea',
      text: 'Are you able to tolerate oral water or electrolyte fluid packets?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'full', label: 'Yes, sipping fluids normally without worsening symptoms' },
        { value: 'small-sips', label: 'Only very small sips with delayed gastric emptying sensation' },
        { value: 'intolerant', label: 'Cannot tolerate fluids without retching', isRedFlag: true },
      ],
    },
  ],

  'muscle-weakness': [
    {
      id: 'musc-distribution',
      symptomId: 'muscle-weakness',
      text: 'Which muscle groups are primarily affected?',
      type: 'multi-choice',
      required: true,
      options: [
        { value: 'calves-quads', label: 'Lower limbs (calves, quadriceps, postural stabilizers)' },
        { value: 'shoulders-arms', label: 'Shoulders, forearms, or grip strength' },
        { value: 'core-paraspinal', label: 'Spinal erectors and core muscles' },
        { value: 'generalized', label: 'Generalized whole-body muscular fatigue' },
      ],
    },
    {
      id: 'musc-symmetry',
      symptomId: 'muscle-weakness',
      text: 'Is the weakness symmetric or isolated to one limb/side?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'symmetric', label: 'Symmetrical on both sides (typical for fatigue/post-workout)' },
        { value: 'asymmetric-arm', label: 'Mainly in one arm or hand', isRedFlag: true },
        { value: 'asymmetric-leg', label: 'Mainly in one leg', isRedFlag: true },
      ],
    },
    {
      id: 'musc-paresthesia',
      symptomId: 'muscle-weakness',
      text: 'Are you experiencing accompanying numbness, tingling ("pins and needles"), or burning?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'No tingling or sensory disturbances' },
        { value: 'mild-fingers', label: 'Transient numbness in fingers or toes' },
        { value: 'progressive-numbness', label: 'Definite persistent numbness or nerve tingling', isRedFlag: true },
      ],
    },
  ],

  stress: [
    {
      id: 'str-factors',
      symptomId: 'stress',
      text: 'What primary mission factors are currently contributing to your stress level?',
      type: 'multi-choice',
      required: true,
      options: [
        { value: 'timeline-pressure', label: 'Tight operational timeline or experiment deadlines' },
        { value: 'equipment-anomaly', label: 'Critical habitat system maintenance or hardware anomalies' },
        { value: 'sleep-deprivation', label: 'Cumulative sleep deprivation or circadian shift' },
        { value: 'isolation-confinement', label: 'Confinement, distance from Earth, or family communication lag' },
        { value: 'crew-dynamics', label: 'Crew coordination and communication friction' },
      ],
    },
    {
      id: 'str-operational-impact',
      symptomId: 'stress',
      text: 'How is this stress impacting your operational focus and task safety?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'manageable', label: 'Manageable; duties executed with full attention' },
        { value: 'extra-effort', label: 'Requires significant extra cognitive effort to avoid minor errors' },
        { value: 'distracted', label: 'Noticeably distracted; requesting second-crew verification' },
        { value: 'overwhelmed', label: 'Feeling overwhelmed; impaired capacity to command or operate safety systems', isRedFlag: true },
      ],
    },
    {
      id: 'str-somatic-symptoms',
      symptomId: 'stress',
      text: 'Are you feeling somatic stress signs (chest tightness, palpitations, or muscle tension)?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'No somatic physical symptoms' },
        { value: 'mild-jaw-neck', label: 'Neck/jaw clenching and tension' },
        { value: 'palpitations', label: 'Occasional awareness of rapid heartbeat or shallow breathing' },
        { value: 'chest-constriction', label: 'Persistent chest tightness or shortness of breath', isRedFlag: true },
      ],
    },
  ],

  'vision-changes': [
    {
      id: 'vis-characteristics',
      symptomId: 'vision-changes',
      text: 'Describe the specific visual disturbance you are experiencing:',
      type: 'multi-choice',
      required: true,
      options: [
        { value: 'near-blur', label: 'Difficulty focusing on close tablet/manual text (hyperopic shift)' },
        { value: 'cotton-wool', label: 'Transient floaters, flashes, or spots' },
        { value: 'distorted-lines', label: 'Distorted or wavy straight lines' },
        { value: 'sudden-loss', label: 'Sudden blind spot, dark quadrant, or visual field loss', isRedFlag: true },
      ],
    },
    {
      id: 'vis-globe-pain',
      symptomId: 'vision-changes',
      text: 'Do you feel retro-orbital globe pain or pressure behind the eyes?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'none', label: 'No ocular pain' },
        { value: 'mild-strain', label: 'Mild eye strain after screen work' },
        { value: 'moderate-pressure', label: 'Definite sensation of backward fullness or pressure' },
        { value: 'severe-pain', label: 'Severe aching pain with eye movement', isRedFlag: true },
      ],
    },
  ],

  'back-pain': [
    {
      id: 'back-region',
      symptomId: 'back-pain',
      text: 'Where along your spine is the discomfort centered?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'lumbar', label: 'Lower back (lumbar microgravity elongation ache)' },
        { value: 'thoracic', label: 'Mid-back / between shoulder blades' },
        { value: 'cervical', label: 'Neck / cervical spine' },
        { value: 'radiating-sciatic', label: 'Radiating pain shooting down into buttock or leg', isRedFlag: true },
      ],
    },
    {
      id: 'back-fetal-tuck',
      symptomId: 'back-pain',
      text: 'Does assuming the passive fetal tuck (knees drawn to chest) relieve the discomfort?',
      type: 'single-choice',
      required: true,
      options: [
        { value: 'yes-relief', label: 'Yes, fetal tuck reduces spinal tension significantly' },
        { value: 'partial', label: 'Partial mild relief' },
        { value: 'no-relief', label: 'No relief; pain remains steady regardless of posture' },
      ],
    },
  ],
};

/**
 * Intelligent helper to select and deduplicate questions for multiple selected symptoms.
 * When multiple symptoms are reported, questions that overlap (e.g. sleep duration, muscle weakness cross-questions)
 * are cleanly pruned or merged so the astronaut is never asked redundant questions.
 */
export function getAdaptiveQuestionsForSymptoms(selectedSymptoms: SymptomCategory[]): AdaptiveQuestion[] {
  if (!selectedSymptoms.length) return [];

  const questions: AdaptiveQuestion[] = [];
  const coveredTopics = new Set<string>();

  // Helper to tag high-level topics to avoid repetitive questioning across symptoms
  const getTopic = (q: AdaptiveQuestion): string | null => {
    if (q.id === 'fat-sleep-hours' || q.id === 'sleep-hours') return 'sleep-hours';
    if (q.id === 'diz-weakness-cross' || q.id === 'fat-weakness-cross' || q.id === 'musc-distribution') return 'muscle-weakness';
    if (q.id === 'diz-nausea-cross' || q.id === 'nau-emesis') return 'nausea-emesis';
    if (q.id === 'diz-vision-cross' || q.id === 'vis-characteristics') return 'vision';
    return null;
  };

  for (const symptom of selectedSymptoms) {
    const symptomQuestions = QUESTION_BANK[symptom] || [];

    for (const q of symptomQuestions) {
      const topic = getTopic(q);
      if (topic) {
        // If the primary symptom is specifically that topic, prioritize its direct question over cross-check
        if (coveredTopics.has(topic)) {
          // Skip redundant cross-cutting question if the dedicated symptom question is already included
          continue;
        }
        coveredTopics.add(topic);
      }
      questions.push(q);
    }
  }

  return questions;
}
