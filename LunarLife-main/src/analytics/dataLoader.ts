import {
  DailyHealthRecord,
  AstronautProfileRecord,
  MissionPhase,
} from './types';

// Bundled simulated datasets via Vite raw string import
import profilesCsvRaw from '../../Datasets/Simulated Datasets/astronaut_profiles.csv?raw';
import dailyHealthCsvRaw from '../../Datasets/Simulated Datasets/daily_health_monitoring.csv?raw';

/**
 * Robust CSV line splitter that handles quoted fields containing commas.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Generic CSV string parser converting CSV text to an array of key-value objects.
 */
export function parseCsvToObjects(csvText: string): Record<string, string>[] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Safe numeric parser with fallback for invalid or missing values.
 */
function parseSafeNumber(val: string | undefined, fallback: number = 0): number {
  if (val === undefined || val === null || val.trim() === '') return fallback;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Parse Astronaut Profiles CSV into typed records.
 */
export function parseAstronautProfiles(csvText: string): AstronautProfileRecord[] {
  const rawRows = parseCsvToObjects(csvText);
  return rawRows.map((row) => ({
    astronaut_id: row.astronaut_id || '',
    display_name: row.display_name || row.astronaut_id || 'Unknown',
    age_years: parseSafeNumber(row.age_years, 35),
    mission_role: row.mission_role || 'Crew Member',
    baseline_resting_hr_bpm: parseSafeNumber(row.baseline_resting_hr_bpm, 70),
    baseline_systolic_bp_mmhg: parseSafeNumber(row.baseline_systolic_bp_mmhg, 120),
    baseline_diastolic_bp_mmhg: parseSafeNumber(row.baseline_diastolic_bp_mmhg, 80),
    baseline_temperature_c: parseSafeNumber(row.baseline_temperature_c, 36.7),
    baseline_spo2_percent: parseSafeNumber(row.baseline_spo2_percent, 98),
    baseline_sleep_hours: parseSafeNumber(row.baseline_sleep_hours, 7.5),
    baseline_stress_score: parseSafeNumber(row.baseline_stress_score, 2),
    baseline_mood_score: parseSafeNumber(row.baseline_mood_score, 4),
    baseline_exercise_minutes: parseSafeNumber(row.baseline_exercise_minutes, 90),
    data_source: row.data_source || 'SIMULATED',
  }));
}

/**
 * Parse Daily Health Monitoring CSV into typed records.
 */
export function parseDailyMonitoring(csvText: string): DailyHealthRecord[] {
  const rawRows = parseCsvToObjects(csvText);
  return rawRows
    .map((row) => {
      const phaseStr = (row.mission_phase || '').toUpperCase();
      const phase: MissionPhase = phaseStr.includes('PRE') ? 'PRE_MISSION' : 'IN_MISSION';

      return {
        astronaut_id: row.astronaut_id || '',
        date: row.date || '',
        study_day: parseSafeNumber(row.study_day, 0),
        mission_phase: phase,
        mission_day: parseSafeNumber(row.mission_day, 0),
        heart_rate_bpm: parseSafeNumber(row.heart_rate_bpm, NaN),
        systolic_bp_mmhg: parseSafeNumber(row.systolic_bp_mmhg, NaN),
        diastolic_bp_mmhg: parseSafeNumber(row.diastolic_bp_mmhg, NaN),
        body_temperature_c: parseSafeNumber(row.body_temperature_c, NaN),
        spo2_percent: parseSafeNumber(row.spo2_percent, NaN),
        sleep_hours: parseSafeNumber(row.sleep_hours, NaN),
        sleep_quality_score_1_to_5: parseSafeNumber(row.sleep_quality_score_1_to_5, NaN),
        mood_score_1_to_5: parseSafeNumber(row.mood_score_1_to_5, NaN),
        stress_score_1_to_5: parseSafeNumber(row.stress_score_1_to_5, NaN),
        exercise_minutes: parseSafeNumber(row.exercise_minutes, 0),
        symptoms: row.symptoms || 'None',
        data_source: row.data_source || 'SIMULATED',
      };
    })
    .sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      return a.study_day - b.study_day;
    });
}

// Cached default dataset records parsed once
let cachedProfiles: AstronautProfileRecord[] | null = null;
let cachedDailyRecords: DailyHealthRecord[] | null = null;

export function getDefaultAstronautProfiles(): AstronautProfileRecord[] {
  if (!cachedProfiles) {
    cachedProfiles = parseAstronautProfiles(profilesCsvRaw);
  }
  return cachedProfiles;
}

export function getDefaultDailyHealthRecords(): DailyHealthRecord[] {
  if (!cachedDailyRecords) {
    cachedDailyRecords = parseDailyMonitoring(dailyHealthCsvRaw);
  }
  return cachedDailyRecords;
}

/**
 * Filter records for a specific astronaut, chronologically ordered.
 * Guarantees no cross-astronaut record mixing.
 */
export function filterRecordsForAstronaut(
  records: DailyHealthRecord[],
  astronautId: string
): DailyHealthRecord[] {
  return records
    .filter((r) => r.astronaut_id === astronautId)
    .sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      return a.study_day - b.study_day;
    });
}

/**
 * Filter records by mission phase (PRE_MISSION or IN_MISSION).
 */
export function filterRecordsByPhase(
  records: DailyHealthRecord[],
  phase: MissionPhase
): DailyHealthRecord[] {
  return records.filter((r) => r.mission_phase === phase);
}

/**
 * Get recent records up to a window length (e.g. 7, 30, 90 records / days).
 * Takes the last N records chronologically.
 */
export function filterRecentRecords(
  records: DailyHealthRecord[],
  windowDays: number
): DailyHealthRecord[] {
  if (records.length <= windowDays) return [...records];
  return records.slice(-windowDays);
}

/**
 * Get historical records preceding the recent window to prevent future data leakage.
 * If total records <= windowDays, returns all records before the last record,
 * or pre-mission baseline records.
 */
export function getHistoricalRecordsBeforeWindow(
  records: DailyHealthRecord[],
  windowDays: number
): DailyHealthRecord[] {
  if (records.length <= windowDays) {
    // If fewer records than window, return the pre-mission records if any exist
    const preMission = filterRecordsByPhase(records, 'PRE_MISSION');
    return preMission.length > 0 ? preMission : records.slice(0, Math.floor(records.length / 2));
  }
  // Strictly records that occurred prior to the recent window
  return records.slice(0, records.length - windowDays);
}
