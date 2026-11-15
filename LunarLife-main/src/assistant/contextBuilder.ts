import { AstronautProfile } from '../types';
import { Baseline, CabinRecord, DailyRecord, Fact, HealthContext } from './types';

/** Pull numbers out of strings like "62 bpm" or "118/76 mmHg". */
const nums = (s: string) => (s ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
const firstNum = (s: string, fb: number) => nums(s)[0] ?? fb;
const secondNum = (s: string, fb: number) => nums(s)[1] ?? fb;

// Baselines come from the profile so the assistant never contradicts the other pages.
export function baselineFromProfile(a: AstronautProfile): Baseline {
  return {
    heartRate: firstNum(a.baselineHeartRate, 65),
    systolic: firstNum(a.baselineBloodPressure, 118),
    diastolic: secondNum(a.baselineBloodPressure, 76),
    temperature: firstNum(a.baselineBodyTemp, 36.6),
    sleep: firstNum(a.baselineSleep, 7),
    mood: firstNum(a.baselineMood, 4),
  };
}

export const CO2_ELEVATED_PPM = 3000;

// Plain-language meaning of each reading. Ranges are general adult reference values (demo-grade).
function interpret(l: DailyRecord, b: Baseline): Record<string, string> {
  const hr = l.heart_rate_bpm;
  const hrBand = hr < 60 ? 'below the typical resting range (60–100)' : hr <= 100 ? 'within the typical resting range (60–100)' : 'above the typical resting range (60–100)';
  const sys = l.systolic_bp_mmhg, dia = l.diastolic_bp_mmhg;
  const bpBand = sys >= 130 || dia >= 80 ? 'high-range' : sys >= 120 ? 'slightly elevated' : sys < 90 ? 'low' : 'normal';
  const t = l.body_temperature_c;
  const tBand = t >= 38 ? 'a fever' : t >= 37.3 ? 'slightly raised' : t < 36 ? 'slightly low' : 'normal';
  const sp = l.spo2_percent;
  const spBand = sp >= 95 ? 'normal (95% or above)' : sp >= 91 ? 'low (91–94%), worth rechecking' : 'dangerously low (90% or below)';
  const sl = l.sleep_hours;
  const slBand = sl >= 7 ? 'in the recommended 7–9 h range' : 'below the recommended 7–9 h';
  const d = (v: number, base: number, u: string) => (v === base ? 'equal to your baseline' : `${Math.abs(+(v - base).toFixed(1))}${u} ${v > base ? 'above' : 'below'} your baseline`);
  return {
    hr: `Heart rate ${hr} bpm is ${hrBand} and ${d(hr, b.heartRate, ' bpm')} (${b.heartRate}).`,
    bp: `Blood pressure ${sys}/${dia} mmHg is ${bpBand}; systolic is ${d(sys, b.systolic, '')} (${b.systolic}/${b.diastolic}).`,
    temp: `Body temperature ${t} °C is ${tBand} and ${d(t, b.temperature, ' °C')} (${b.temperature}).`,
    spo2: `SpO₂ ${sp}% is ${spBand}.`,
    sleep: `Sleep of ${sl} h is ${slBand} and ${d(sl, b.sleep, ' h')} (${b.sleep} h).`,
  };
}

export function buildContext(astronaut: AstronautProfile, latest?: DailyRecord, cabin?: CabinRecord): HealthContext {
  const baseline = baselineFromProfile(astronaut);
  const facts: Fact[] = [];
  const deviations: string[] = [];
  let interpretations: Record<string, string> = {};

  if (latest) {
    interpretations = interpret(latest, baseline);
    const dHR = latest.heart_rate_bpm - baseline.heartRate;
    const hrFlag = dHR >= 15;
    facts.push({ label: 'Heart rate', value: `${latest.heart_rate_bpm} bpm (baseline ${baseline.heartRate})`, flagged: hrFlag });
    if (hrFlag) deviations.push(`resting HR ${latest.heart_rate_bpm} vs baseline ${baseline.heartRate} (+${dHR})`);

    const bpFlag = latest.systolic_bp_mmhg - baseline.systolic >= 15;
    facts.push({
      label: 'Blood pressure',
      value: `${latest.systolic_bp_mmhg}/${latest.diastolic_bp_mmhg} mmHg (baseline ${baseline.systolic}/${baseline.diastolic})`,
      flagged: bpFlag,
    });
    if (bpFlag) deviations.push(`systolic BP ${latest.systolic_bp_mmhg} vs baseline ${baseline.systolic}`);

    const tFlag = latest.body_temperature_c - baseline.temperature >= 0.8;
    facts.push({ label: 'Temperature', value: `${latest.body_temperature_c} °C (baseline ${baseline.temperature})`, flagged: tFlag });
    if (tFlag) deviations.push(`temperature ${latest.body_temperature_c} °C vs baseline ${baseline.temperature}`);

    const spFlag = latest.spo2_percent < 95;
    facts.push({ label: 'SpO₂', value: `${latest.spo2_percent}%`, flagged: spFlag });
    if (spFlag) deviations.push(`SpO₂ ${latest.spo2_percent}% (below 95%)`);

    const sFlag = baseline.sleep - latest.sleep_hours >= 1.5;
    facts.push({
      label: 'Sleep',
      value: `${latest.sleep_hours} h, quality ${latest.sleep_quality_score_1_to_5}/5 (baseline ${baseline.sleep} h)`,
      flagged: sFlag,
    });
    if (sFlag) deviations.push(`sleep ${latest.sleep_hours} h vs baseline ${baseline.sleep} h`);

    const mFlag = latest.mood_score_1_to_5 <= 2 || latest.stress_score_1_to_5 >= 4;
    facts.push({ label: 'Mood / stress', value: `mood ${latest.mood_score_1_to_5}/5, stress ${latest.stress_score_1_to_5}/5`, flagged: mFlag });
    if (mFlag) deviations.push(`mood ${latest.mood_score_1_to_5}/5, stress ${latest.stress_score_1_to_5}/5`);

    facts.push({ label: 'Exercise', value: `${latest.exercise_minutes} min` });
    if (latest.symptoms && latest.symptoms.toLowerCase() !== 'none') {
      facts.push({ label: 'Logged symptoms', value: latest.symptoms, flagged: true });
      deviations.push(`logged symptoms: ${latest.symptoms}`);
    }
  }

  if (cabin) {
    const cFlag = cabin.cabin_co2_ppm >= CO2_ELEVATED_PPM;
    facts.push({ label: 'Cabin CO₂', value: `${cabin.cabin_co2_ppm} ppm`, flagged: cFlag });
    if (cFlag) deviations.push(`cabin CO₂ ${cabin.cabin_co2_ppm} ppm (elevated)`);
    facts.push({
      label: 'Cabin air',
      value: `${cabin.cabin_temperature_c} °C, ${cabin.cabin_pressure_kpa} kPa, ${cabin.cabin_relative_humidity_percent}% RH`,
    });
  }

  // Medical history (from the astronaut profile)
  const history = {
    conditions: astronaut.existingConditions ?? [],
    allergies: astronaut.allergies ?? [],
    medications: astronaut.medications ?? [],
  };
  const list = (a: string[]) => (a.length ? a.join(', ') : 'none recorded');
  facts.push({ label: 'Medical history', value: `conditions: ${list(history.conditions)}` });
  facts.push({ label: 'Allergies', value: list(history.allergies) });
  facts.push({ label: 'Medications', value: list(history.medications) });

  const summary =
    `Astronaut: ${astronaut.name}, ${astronaut.age}y, ${astronaut.role}, mission day ${astronaut.missionDay}.\n` +
    `Conditions: ${list(history.conditions)}. Allergies: ${list(history.allergies)}. Medications: ${list(history.medications)}.\n` +
    facts.filter((f) => !['Medical history', 'Allergies', 'Medications'].includes(f.label)).map((f) => `- ${f.label}: ${f.value}`).join('\n') +
    `\nNotable deviations: ${deviations.join('; ') || 'none'}`;

  return { summary, facts, latest, cabin, baseline, deviations, interpretations, history };
}
