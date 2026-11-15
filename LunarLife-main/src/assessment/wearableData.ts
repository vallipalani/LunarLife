export type WearableMetricType =
  | 'heart-rate'
  | 'hrv'
  | 'blood-oxygen'
  | 'skin-temperature'
  | 'sleep-duration'
  | 'activity';

export interface WearableDevice {
  id: string;
  name: string;
  model: string;
  status: 'connected' | 'offline' | 'simulated';
  batteryLevel: number;
  lastSyncTimestamp: string;
  isSimulated: boolean;
  disclaimer: string;
}

export interface WearableReading {
  type: WearableMetricType;
  label: string;
  value: number | string;
  unit: string;
  sourceDevice: string;
  sensorType: string;
  timestamp: string;
  dataSource: 'wearable-simulated' | 'wearable-live' | 'manual';
  isEstimated: boolean;
  status: 'nominal' | 'elevated' | 'low' | 'concerning';
  nominalRange: string;
  isOutdated?: boolean;
}

export interface FieldProvenance {
  fieldName: string;
  source: 'wearable-simulated' | 'wearable-live' | 'manual';
  sourceDevice: string;
  timestamp: string;
  isEstimated: boolean;
  isManuallyEdited: boolean;
  originalWearableValue?: string | number;
  measurementType?: string;
}

export const WEARABLE_DEVICE_INFO: WearableDevice = {
  id: 'astra-bioband-sim-01',
  name: 'ASTRA Bio-Telemetry SmartBand',
  model: 'BioBand FlightSpec Mk-IV',
  status: 'connected',
  batteryLevel: 91,
  lastSyncTimestamp: 'Just now (Simulated)',
  isSimulated: true,
  disclaimer: 'Simulated / Demo Telemetry Prototype. No physical medical device connected.',
};

/**
 * Returns a standardized current UTC timestamp string
 */
export function getUtcTimestamp(): string {
  const n = new Date();
  return `${n.getUTCHours().toString().padStart(2, '0')}:${n
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${n.getUTCSeconds().toString().padStart(2, '0')} UTC`;
}

/**
 * Generates realistic simulated wearable telemetry for Commander Alex Morgan.
 * Clearly separates directly measured vitals from algorithm-estimated parameters.
 */
export function createInitialWearableReadings(
  seedOffset: number = 0,
  isOutdated: boolean = false
): WearableReading[] {
  const timeStr = isOutdated ? '42 minutes ago' : getUtcTimestamp();

  // Subtle physiological variations around astronaut's nominal resting profile
  const hrVal = 74 + (seedOffset % 5) - 2; // ~72-77 BPM (baseline: 65-75 BPM)
  const hrvVal = 58 + (seedOffset % 7) - 3; // ~55-62 ms (nominal flight range: 45-75 ms)
  const spo2Val = Math.min(99, Math.max(96, 98 + ((seedOffset % 3) - 1))); // 97-99%
  const skinTempVal = (36.6 + ((seedOffset % 4) - 2) * 0.1).toFixed(1); // 36.4 - 36.8°C
  const sleepVal = (7.4 + ((seedOffset % 3) - 1) * 0.2).toFixed(1); // 7.2 - 7.6 hrs

  return [
    {
      type: 'heart-rate',
      label: 'Resting Heart Rate',
      value: hrVal,
      unit: 'BPM',
      sourceDevice: 'ASTRA BioBand Mk-IV [Simulated]',
      sensorType: 'Optical Photoplethysmography (PPG)',
      timestamp: timeStr,
      dataSource: 'wearable-simulated',
      isEstimated: false,
      status: hrVal > 85 ? 'elevated' : 'nominal',
      nominalRange: '60 – 100 BPM (Alex Baseline: 65–75 BPM)',
      isOutdated,
    },
    {
      type: 'blood-oxygen',
      label: 'Blood Oxygen (SpO2)',
      value: spo2Val,
      unit: '%',
      sourceDevice: 'ASTRA BioBand Mk-IV [Simulated]',
      sensorType: 'Dual-Wavelength Pulse Oximetry',
      timestamp: timeStr,
      dataSource: 'wearable-simulated',
      isEstimated: false,
      status: spo2Val < 95 ? 'low' : 'nominal',
      nominalRange: '95% – 100% (Cabin Norm: 97–99%)',
      isOutdated,
    },
    {
      type: 'hrv',
      label: 'Heart Rate Variability (HRV)',
      value: hrvVal,
      unit: 'ms',
      sourceDevice: 'ASTRA BioBand Mk-IV [Simulated]',
      sensorType: 'R-R Interval Variance (Autonomic Tone)',
      timestamp: timeStr,
      dataSource: 'wearable-simulated',
      isEstimated: false,
      status: 'nominal',
      nominalRange: '45 – 75 ms (Autonomic Recovery Stable)',
      isOutdated,
    },
    {
      type: 'skin-temperature',
      label: 'Skin Temperature',
      value: Number(skinTempVal),
      unit: '°C',
      sourceDevice: 'ASTRA Dermal Sensor Patch [Simulated]',
      sensorType: 'Infrared Dermal Thermopile',
      timestamp: timeStr,
      dataSource: 'wearable-simulated',
      isEstimated: false,
      status: 'nominal',
      nominalRange: '36.3°C – 37.0°C (Dermal Equilibrium)',
      isOutdated,
    },
    {
      type: 'sleep-duration',
      label: 'Estimated Sleep Duration',
      value: Number(sleepVal),
      unit: 'hours',
      sourceDevice: 'Crew Quarters Sleep Mat [Simulated]',
      sensorType: 'Ballistocardiography & Sleep Architecture Algorithm',
      timestamp: timeStr,
      dataSource: 'wearable-simulated',
      isEstimated: true, // Clearly identified as estimated
      status: Number(sleepVal) < 6.5 ? 'low' : 'nominal',
      nominalRange: '7.5 – 8.5 Hours (Alex Baseline: 8.0h)',
      isOutdated,
    },
    {
      type: 'activity',
      label: 'Daily Physical Activity',
      value: '4,680 steps',
      unit: 'steps (Moderate)',
      sourceDevice: 'ASTRA BioBand IMU [Simulated]',
      sensorType: '3-Axis Inertial Accelerometry',
      timestamp: timeStr,
      dataSource: 'wearable-simulated',
      isEstimated: true, // Movement estimate
      status: 'nominal',
      nominalRange: '3,500 – 6,000 steps (Countermeasure Goal Met)',
      isOutdated,
    },
  ];
}

/**
 * Simulates receiving a fresh sync packet from the wearable device
 */
export function refreshWearableTelemetry(
  currentIteration: number = 1,
  isOutdated: boolean = false
): { device: WearableDevice; readings: WearableReading[] } {
  const timestamp = isOutdated ? '42 minutes ago (Outdated)' : getUtcTimestamp();
  const battery = Math.max(65, 91 - (currentIteration % 15));

  const device: WearableDevice = {
    ...WEARABLE_DEVICE_INFO,
    batteryLevel: battery,
    lastSyncTimestamp: timestamp,
    status: 'connected',
  };

  const readings = createInitialWearableReadings(currentIteration, isOutdated);

  return { device, readings };
}
