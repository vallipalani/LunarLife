import { CabinRecord, DailyRecord } from './types';

// Rule-based emergency check. Runs BEFORE any AI and needs no network.

const EMERGENCY_PHRASES: { label: string; re: RegExp }[] = [
  { label: 'chest pain', re: /chest (pain|pressure|tightness)|crushing/ },
  { label: 'fainting / loss of consciousness', re: /faint(ed|ing)?\b|passed out|pass(ing)? out|lost consciousness|blacked out/ },
  { label: 'severe breathing difficulty', re: /can'?t breathe|cannot breathe|struggling to breathe|severe (shortness of breath|breathlessness)|gasping/ },
  { label: 'seizure', re: /seizure|convulsion/ },
  { label: 'confusion', re: /\bconfus(ed|ion)\b|disoriented/ },
  { label: 'sudden vision loss', re: /vision loss|can'?t see|sudden(ly)? blind/ },
  { label: 'stroke-like symptoms', re: /face droop|slurred speech|one side (of my body )?(numb|weak)/ },
  { label: 'severe bleeding', re: /severe bleeding|won'?t stop bleeding|coughing (up )?blood/ },
  { label: 'suicidal thoughts', re: /suicid|want to die|kill myself|end my life/ },
];

const NEGATION =
  /\b(no|not|without|never|denies|deny|dont|do not|does not|doesnt|did not|didnt|have not|havent|haven't had|isnt|is not|ruled out|free of|no signs of|no sign of)\b[^.!?;,]{0,25}$/;

// Curly apostrophes (phones, Word, autocorrect) -> straight, and drop the apostrophe in contractions
const normalise = (t: string) => t.toLowerCase().replace(/[\u2018\u2019\u02bc`]/g, "'");
const stripApostrophes = (t: string) => t.replace(/'/g, '');

export function checkRedFlags(message: string, latest?: DailyRecord, cabin?: CabinRecord): string[] {
  const flags: string[] = [];
  const m = normalise(message);

  for (const { label, re } of EMERGENCY_PHRASES) {
    const match = re.exec(m);
    if (!match) continue;
    // Only look at the same clause: stop at punctuation, "but" or "and"
    const clause = m.slice(0, match.index).split(/[.!?;,]|\bbut\b|\band\b/).pop() ?? '';
    if (NEGATION.test(stripApostrophes(clause))) continue; // "I don't have chest pain" shouldn't trigger
    flags.push(`Reported: ${label}`);
  }

  if (latest) {
    const { heart_rate_bpm: hr, systolic_bp_mmhg: sys, spo2_percent: sp, body_temperature_c: t } = latest;
    if (hr > 130 || hr < 40) flags.push(`Heart rate ${hr} bpm is outside the safe range (40–130)`);
    if (sys > 180 || sys < 85) flags.push(`Systolic BP ${sys} mmHg is outside the safe range (85–180)`);
    if (sp < 90) flags.push(`SpO₂ ${sp}% is critically low (below 90%)`);
    if (t >= 39 || t < 35) flags.push(`Body temperature ${t} °C is outside the safe range (35–39)`);
  }
  if (cabin) {
    if (cabin.cabin_co2_ppm > 5000) flags.push(`Cabin CO₂ ${cabin.cabin_co2_ppm} ppm is dangerously high (above 5000)`);
    if (cabin.cabin_pressure_kpa < 80) flags.push(`Cabin pressure ${cabin.cabin_pressure_kpa} kPa is dangerously low`);
  }
  return flags;
}
