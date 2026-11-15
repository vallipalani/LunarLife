// CSVs are bundled into the app with Vite's ?raw import, so everything works offline.
// Copy the two files from the ASTRA pack into src/assistant/data/ first.
import dailyRaw from './data/daily_health_monitoring.csv?raw';
import cabinRaw from './data/cabin_environment_log.csv?raw';
import { DailyRecord, CabinRecord } from './types';

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  const header = splitLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = splitLine(l);
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row;
  });
}

const num = (v: string) => (v === '' ? NaN : Number(v));

export const dailyRecords: DailyRecord[] = parseCsv(dailyRaw).map((r) => ({
  astronaut_id: r.astronaut_id,
  date: r.date,
  mission_day: num(r.mission_day),
  heart_rate_bpm: num(r.heart_rate_bpm),
  systolic_bp_mmhg: num(r.systolic_bp_mmhg),
  diastolic_bp_mmhg: num(r.diastolic_bp_mmhg),
  body_temperature_c: num(r.body_temperature_c),
  spo2_percent: num(r.spo2_percent),
  sleep_hours: num(r.sleep_hours),
  sleep_quality_score_1_to_5: num(r.sleep_quality_score_1_to_5),
  mood_score_1_to_5: num(r.mood_score_1_to_5),
  stress_score_1_to_5: num(r.stress_score_1_to_5),
  exercise_minutes: num(r.exercise_minutes),
  symptoms: r.symptoms ?? '',
}));

export const cabinRecords: CabinRecord[] = parseCsv(cabinRaw).map((r) => ({
  astronaut_id: r.astronaut_id,
  date: r.date,
  cabin_co2_ppm: num(r.cabin_co2_ppm),
  cabin_temperature_c: num(r.cabin_temperature_c),
  cabin_pressure_kpa: num(r.cabin_pressure_kpa),
  cabin_relative_humidity_percent: num(r.cabin_relative_humidity_percent),
}));

/** Latest daily + cabin row for one astronaut. Falls back to the first ID in the CSV
 *  if the profile's astronautId isn't found, so the demo never breaks. */
export function latestFor(astronautId: string): { daily?: DailyRecord; cabin?: CabinRecord } {
  const ids = new Set(dailyRecords.map((r) => r.astronaut_id));
  const id = ids.has(astronautId) ? astronautId : dailyRecords[0]?.astronaut_id;
  const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);
  const daily = dailyRecords.filter((r) => r.astronaut_id === id).sort(byDate).pop();
  const cabin = cabinRecords
    .filter((r) => r.astronaut_id === id && (!daily || r.date <= daily.date))
    .sort(byDate)
    .pop();
  return { daily, cabin };
}
