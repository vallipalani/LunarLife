import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Moon,
  Smile,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Info,
  ShieldAlert,
  PowerOff,
  LucideIcon,
  HelpCircle,
  Zap,
  RotateCcw,
  Check,
  Footprints,
} from 'lucide-react';
import { Card, Badge } from '../../components';
import { AstronautProfile } from '../../types';
import { HEALTH_CHECKS_CONFIG } from '../healthChecksData';
import { validateCheckInput } from '../assessmentLogic';
import {
  HealthCheckId,
  HealthCheckResult,
  QuestionAnswer,
  SymptomCategory,
  SymptomReport,
} from '../types';
import {
  FieldProvenance,
  WearableDevice,
  WearableReading,
  WEARABLE_DEVICE_INFO,
  createInitialWearableReadings,
  refreshWearableTelemetry,
} from '../wearableData';
import { WearableMonitoringCard } from './WearableMonitoringCard';

interface GuidedChecksViewProps {
  recommendedCheckIds: HealthCheckId[];
  symptomReport: SymptomReport;
  answers: QuestionAnswer[];
  astronaut: AstronautProfile;
  initialResults?: HealthCheckResult[];
  onBackToQuestions: () => void;
  onProceed: (
    results: HealthCheckResult[],
    wearableSummary?: { device: WearableDevice; readings: WearableReading[] }
  ) => void;
}

const CHECK_ICONS: Record<HealthCheckId, LucideIcon> = {
  'heart-rate': Heart,
  'blood-pressure': Activity,
  'body-temperature': Thermometer,
  'sleep-fatigue': Moon,
  'mood-stress': Smile,
};

export function GuidedChecksView({
  recommendedCheckIds,
  symptomReport,
  answers,
  astronaut,
  initialResults = [],
  onBackToQuestions,
  onProceed,
}: GuidedChecksViewProps) {
  // Wearable Device State
  const [device, setDevice] = useState<WearableDevice>(WEARABLE_DEVICE_INFO);
  const [wearableReadings, setWearableReadings] = useState<WearableReading[]>(() =>
    createInitialWearableReadings(0, false)
  );
  const [isOffline, setIsOffline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOutdated, setIsOutdated] = useState(false);
  const [syncCount, setSyncCount] = useState(1);
  const [preservedEditsNotice, setPreservedEditsNotice] = useState<string | null>(null);

  // Store form inputs per check: checkId -> { [field]: value }
  const [formData, setFormData] = useState<Record<HealthCheckId, Record<string, string | number>>>(() => {
    const map: Record<HealthCheckId, Record<string, string | number>> = {
      'heart-rate': { heartRate: '', spo2: '', hrv: '' },
      'blood-pressure': { systolic: '', diastolic: '' },
      'body-temperature': { temperature: '' },
      'sleep-fatigue': { sleepHours: '', sleepQuality: '' },
      'mood-stress': { stressLevel: '' },
    };

    initialResults.forEach((res) => {
      if (res.recordedValues) {
        map[res.checkId] = { ...map[res.checkId], ...res.recordedValues };
      }
    });

    return map;
  });

  // Track field provenance: checkId -> fieldName -> FieldProvenance
  const [provenanceMap, setProvenanceMap] = useState<
    Record<HealthCheckId, Record<string, FieldProvenance>>
  >(() => {
    const initial: Record<HealthCheckId, Record<string, FieldProvenance>> = {
      'heart-rate': {},
      'blood-pressure': {},
      'body-temperature': {},
      'sleep-fatigue': {},
      'mood-stress': {},
    };

    initialResults.forEach((res) => {
      if (res.provenance) {
        initial[res.checkId] = { ...res.provenance };
      }
    });

    return initial;
  });

  // Track manually edited fields so refresh doesn't overwrite them
  const [manuallyEditedFields, setManuallyEditedFields] = useState<Set<string>>(() => {
    const set = new Set<string>();
    initialResults.forEach((res) => {
      if (res.provenance) {
        Object.entries(res.provenance).forEach(([fName, prov]) => {
          if (prov.isManuallyEdited) {
            set.add(`${res.checkId}.${fName}`);
          }
        });
      }
    });
    return set;
  });

  // Track skipped / unavailable state per check
  const [unavailableMap, setUnavailableMap] = useState<Record<HealthCheckId, boolean>>(() => {
    const map: Record<HealthCheckId, boolean> = {
      'heart-rate': false,
      'blood-pressure': false,
      'body-temperature': false,
      'sleep-fatigue': false,
      'mood-stress': false,
    };
    initialResults.forEach((res) => {
      if (res.isUnavailable || res.status === 'skipped') {
        map[res.checkId] = true;
      }
    });
    return map;
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-fill available wearable readings into form on initial load
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && !isOffline) {
      hasInitialized.current = true;
      applyWearableReadingsToForm(wearableReadings, false);
    }
  }, []);

  /**
   * Helper that maps available wearable readings to corresponding form fields
   */
  const applyWearableReadingsToForm = (
    readings: WearableReading[],
    forceOverwriteManual: boolean = false
  ) => {
    const hrReading = readings.find((r) => r.type === 'heart-rate');
    const spo2Reading = readings.find((r) => r.type === 'blood-oxygen');
    const hrvReading = readings.find((r) => r.type === 'hrv');
    const skinTempReading = readings.find((r) => r.type === 'skin-temperature');
    const sleepReading = readings.find((r) => r.type === 'sleep-duration');

    const preservedList: string[] = [];

    setFormData((prev) => {
      const next = { ...prev };

      // Helper to set field if not manually edited
      const setField = (
        checkId: HealthCheckId,
        fieldName: string,
        val: number | string | undefined,
        reading?: WearableReading
      ) => {
        if (val === undefined || !reading) return;
        const key = `${checkId}.${fieldName}`;
        const isManuallyEdited = manuallyEditedFields.has(key);

        if (isManuallyEdited && !forceOverwriteManual) {
          preservedList.push(`${fieldName} (Current: ${prev[checkId][fieldName]}, Wearable: ${val})`);
          return;
        }

        next[checkId] = {
          ...next[checkId],
          [fieldName]: val,
        };

        // Update provenance
        setProvenanceMap((pPrev) => ({
          ...pPrev,
          [checkId]: {
            ...pPrev[checkId],
            [fieldName]: {
              fieldName,
              source: 'wearable-simulated',
              sourceDevice: reading.sourceDevice,
              timestamp: reading.timestamp,
              isEstimated: reading.isEstimated,
              isManuallyEdited: false,
              originalWearableValue: val,
              measurementType: reading.sensorType,
            },
          },
        }));
      };

      setField('heart-rate', 'heartRate', hrReading?.value, hrReading);
      setField('heart-rate', 'spo2', spo2Reading?.value, spo2Reading);
      setField('heart-rate', 'hrv', hrvReading?.value, hrvReading);
      setField('body-temperature', 'temperature', skinTempReading?.value, skinTempReading);
      setField('sleep-fatigue', 'sleepHours', sleepReading?.value, sleepReading);

      return next;
    });

    if (forceOverwriteManual) {
      setManuallyEditedFields(new Set());
      setPreservedEditsNotice(null);
    } else if (preservedList.length > 0) {
      setPreservedEditsNotice(
        `Wearable refreshed: preserved ${preservedList.length} manual edit(s): ${preservedList.join(', ')}.`
      );
    }
  };

  /**
   * Refreshes simulated wearable telemetry
   */
  const handleRefreshWearable = () => {
    setIsRefreshing(true);
    setValidationErrors({});

    setTimeout(() => {
      const nextIteration = syncCount + 1;
      setSyncCount(nextIteration);
      const { device: nextDevice, readings: nextReadings } = refreshWearableTelemetry(
        nextIteration,
        false
      );

      setDevice(nextDevice);
      setWearableReadings(nextReadings);
      setIsOutdated(false);
      setIsRefreshing(false);

      // Auto-populate fresh readings without overwriting manually edited fields
      applyWearableReadingsToForm(nextReadings, false);
    }, 450);
  };

  /**
   * Toggles simulated device connection status
   */
  const handleToggleConnection = () => {
    if (!isOffline) {
      // Disconnect
      setIsOffline(true);
      setDevice((prev) => ({
        ...prev,
        status: 'offline',
        lastSyncTimestamp: 'Disconnected (Offline)',
      }));
    } else {
      // Reconnect
      setIsOffline(false);
      setDevice((prev) => ({
        ...prev,
        status: 'connected',
        lastSyncTimestamp: 'Just now (Simulated)',
      }));
      const freshReadings = createInitialWearableReadings(syncCount, false);
      setWearableReadings(freshReadings);
      applyWearableReadingsToForm(freshReadings, false);
    }
  };

  /**
   * Toggles outdated telemetry mode to demonstrate outdated warning
   */
  const handleToggleOutdated = () => {
    const nextOutdated = !isOutdated;
    setIsOutdated(nextOutdated);
    const updated = createInitialWearableReadings(syncCount, nextOutdated);
    setWearableReadings(updated);
    setDevice((prev) => ({
      ...prev,
      lastSyncTimestamp: nextOutdated ? '42 minutes ago (Outdated)' : 'Just now (Simulated)',
    }));
  };

  /**
   * Handles user input change, recording manual edit provenance
   */
  const handleInputChange = (checkId: HealthCheckId, fieldName: string, val: string) => {
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[checkId];
      return copy;
    });

    const fieldKey = `${checkId}.${fieldName}`;
    setManuallyEditedFields((prev) => new Set(prev).add(fieldKey));

    setFormData((prev) => ({
      ...prev,
      [checkId]: {
        ...prev[checkId],
        [fieldName]: val,
      },
    }));

    // Update provenance to flag manual edit
    setProvenanceMap((prev) => {
      const existing = prev[checkId]?.[fieldName];
      return {
        ...prev,
        [checkId]: {
          ...prev[checkId],
          [fieldName]: {
            fieldName,
            source: 'manual',
            sourceDevice: 'Commander Manual Input',
            timestamp: new Date().toISOString(),
            isEstimated: existing?.isEstimated || false,
            isManuallyEdited: true,
            originalWearableValue: existing?.originalWearableValue,
            measurementType: 'Manual Astronaut Override',
          },
        },
      };
    });
  };

  /**
   * Reverts a manually edited field back to the wearable's reading
   */
  const revertFieldToWearable = (checkId: HealthCheckId, fieldName: string) => {
    const fieldKey = `${checkId}.${fieldName}`;
    const prov = provenanceMap[checkId]?.[fieldName];
    if (prov && prov.originalWearableValue !== undefined) {
      setFormData((prev) => ({
        ...prev,
        [checkId]: {
          ...prev[checkId],
          [fieldName]: prov.originalWearableValue as string | number,
        },
      }));

      setManuallyEditedFields((prev) => {
        const copy = new Set(prev);
        copy.delete(fieldKey);
        return copy;
      });

      setProvenanceMap((prev) => ({
        ...prev,
        [checkId]: {
          ...prev[checkId],
          [fieldName]: {
            ...prov,
            source: 'wearable-simulated',
            sourceDevice: prov.sourceDevice || 'ASTRA BioBand [Simulated]',
            isManuallyEdited: false,
          },
        },
      }));
    }
  };

  const toggleUnavailable = (checkId: HealthCheckId) => {
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[checkId];
      return copy;
    });

    setUnavailableMap((prev) => ({
      ...prev,
      [checkId]: !prev[checkId],
    }));
  };

  // Check if serious symptoms or question red flags are present for emergency priority warning
  const hasSevereSymptom = symptomReport.severity === 'severe';
  const hasRedFlagAnswer = answers.some((a) => {
    const val = Array.isArray(a.value) ? a.value : [a.value];
    return (
      val.includes('thunderclap') ||
      val.includes('tunnel-vision') ||
      val.includes('diplopia') ||
      val.includes('asymmetric-weakness') ||
      val.includes('severe-vomiting') ||
      val.includes('intolerant') ||
      val.includes('chest-constriction')
    );
  });

  const handleProceed = () => {
    const errors: Record<string, string> = {};
    const results: HealthCheckResult[] = [];

    for (const checkId of recommendedCheckIds) {
      const isUnavailable = unavailableMap[checkId];
      const values = formData[checkId];
      const config = HEALTH_CHECKS_CONFIG[checkId];

      if (isUnavailable) {
        results.push({
          checkId,
          title: config.title,
          recordedValues: {},
          displaySummary: 'Measurement Unavailable / Skipped',
          status: 'unavailable',
          isUnavailable: true,
          unavailableReason: 'Sensor unavailable or postponed by astronaut',
          recordedAt: new Date().toISOString(),
          provenance: provenanceMap[checkId],
        });
        continue;
      }

      // Check if primary field is filled
      const hasAnyValue = Object.values(values).some((v) => v !== '' && v !== undefined);
      if (!hasAnyValue) {
        errors[checkId] = 'Please enter measurement or toggle "Sensor Unavailable / Skip" if offline.';
        continue;
      }

      // Validate inputs
      const validation = validateCheckInput(checkId, values);
      if (!validation.isValid) {
        errors[checkId] = validation.error || 'Invalid value entered.';
        continue;
      }

      // Formulate display summary and status
      let displaySummary = '';
      let status: HealthCheckResult['status'] = 'nominal';
      let comparedToBaseline = '';

      if (checkId === 'heart-rate') {
        const hr = Number(values.heartRate);
        const spo2 = values.spo2 ? ` • SpO2 ${values.spo2}%` : '';
        const hrv = values.hrv ? ` • HRV ${values.hrv}ms` : '';
        displaySummary = `${hr} BPM${spo2}${hrv}`;
        if (hr > 100 || hr < 50 || (values.spo2 && Number(values.spo2) < 95)) status = 'abnormal';
        comparedToBaseline = `Baseline: ${astronaut.baselineHeartRate}`;
      } else if (checkId === 'blood-pressure') {
        const sys = Number(values.systolic);
        const dia = Number(values.diastolic);
        displaySummary = `${sys}/${dia} mmHg`;
        if (sys > 135 || sys < 95 || dia > 88 || dia < 60) status = 'abnormal';
        comparedToBaseline = `Baseline: ${astronaut.baselineBloodPressure}`;
      } else if (checkId === 'body-temperature') {
        const temp = Number(values.temperature);
        const isSkin = provenanceMap['body-temperature']?.temperature?.source === 'wearable-simulated';
        displaySummary = `${temp}°C ${isSkin ? '(Skin Temp)' : '(Core Temp)'}`;
        if (temp > 37.5 || temp < 36.2) status = 'abnormal';
        comparedToBaseline = `Baseline: ${astronaut.baselineBodyTemp}`;
      } else if (checkId === 'sleep-fatigue') {
        const h = Number(values.sleepHours);
        const q = values.sleepQuality ? ` (Quality ${values.sleepQuality}/10)` : '';
        const isEst = provenanceMap['sleep-fatigue']?.sleepHours?.isEstimated ? ' [Est]' : '';
        displaySummary = `${h}h${isEst}${q}`;
        if (h < 6.0) status = 'abnormal';
        comparedToBaseline = `Target Baseline: ${astronaut.baselineSleep}`;
      } else if (checkId === 'mood-stress') {
        const s = Number(values.stressLevel);
        displaySummary = `Strain Level ${s}/5`;
        if (s >= 4) status = 'abnormal';
        comparedToBaseline = `Baseline: ${astronaut.baselineMood}`;
      }

      results.push({
        checkId,
        title: config.title,
        recordedValues: values,
        displaySummary,
        status,
        comparedToBaseline,
        recordedAt: new Date().toISOString(),
        provenance: provenanceMap[checkId],
      });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onProceed(results, { device, readings: wearableReadings });
  };

  return (
    <div className="space-y-6">
      {/* 1. CRITICAL ESCALATION / RED-FLAG BANNER IF DETECTED */}
      {(hasSevereSymptom || hasRedFlagAnswer) && (
        <div className="p-4 sm:p-5 rounded-xl border border-rose-300 bg-rose-50/70 shadow-xs text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Operational Safety Escalation
                </span>
                <Badge variant="rose" size="sm">Urgent Medical Warning</Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Concerning Symptoms Reported: Ground Flight Surgeon Notice
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You reported severe or red-flag symptoms. Routine operational tasks should be paused immediately. Wearable telemetry has auto-populated applicable fields below. You may verify them or proceed directly to generate the clinical summary.
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-xs">
              Alert Console Notified
            </span>
          </div>
        </div>
      )}

      {/* 2. SECTION HEADER CARD */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
              Step 3 of 4 • Guided Biometrics & Telemetry
            </div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
              Guided Health Measurements & Wearable Integration
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Available wearable streams automatically populate matching fields. Baseline targets are retrieved from Commander {astronaut.name}'s flight profile.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="neutral" size="sm">
              {recommendedCheckIds.length} Checks Recommended
            </Badge>
          </div>
        </div>
      </div>

      {/* 3. WEARABLE DEVICE MONITORING SECTION */}
      <WearableMonitoringCard
        device={device}
        readings={wearableReadings}
        isOffline={isOffline}
        isRefreshing={isRefreshing}
        isOutdated={isOutdated}
        onRefresh={handleRefreshWearable}
        onToggleConnection={handleToggleConnection}
        onToggleOutdated={handleToggleOutdated}
      />

      {/* Preserved manual edits alert banner */}
      {preservedEditsNotice && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{preservedEditsNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => applyWearableReadingsToForm(wearableReadings, true)}
            className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline shrink-0 ml-3"
          >
            Apply All Wearable Values
          </button>
        </div>
      )}

      {/* 4. HEALTH CHECK CARDS */}
      <div className="space-y-5">
        {recommendedCheckIds.map((checkId, idx) => {
          const config = HEALTH_CHECKS_CONFIG[checkId];
          const Icon = CHECK_ICONS[checkId] || Activity;
          const isUnavailable = unavailableMap[checkId];
          const values = formData[checkId];
          const error = validationErrors[checkId];
          const baselineVal = astronaut[config.baselineKey];
          const checkProvenance = provenanceMap[checkId] || {};

          return (
            <Card
              key={checkId}
              className={`transition-all ${
                isUnavailable ? 'opacity-70 bg-slate-50/50' : 'bg-white'
              }`}
              title={`${idx + 1}. ${config.title}`}
              subtitle={config.purpose}
              action={
                <button
                  type="button"
                  onClick={() => toggleUnavailable(checkId)}
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    isUnavailable
                      ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Toggle if sensor hardware is offline or unavailable"
                >
                  <PowerOff className="w-3 h-3" />
                  <span>{isUnavailable ? 'Sensor Offline (Skipped)' : 'Skip / Sensor Offline'}</span>
                </button>
              }
            >
              <div className="mt-2 space-y-4">
                {/* Baseline reference bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-sky-50/60 border border-sky-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="text-slate-600">
                      Commander's Baseline: <strong className="text-sky-800">{baselineVal}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Nominal Range: {config.nominalRangeText}
                  </span>
                </div>

                {/* Instructions */}
                <div>
                  <div className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-sky-600" />
                    <span>Instructions ({config.equipment}):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 pl-1 leading-relaxed">
                    {config.instructions.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Measurement Input Fields */}
                {!isUnavailable ? (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {config.inputConfig.fields.map((field) => {
                        const prov = checkProvenance[field.name];
                        const isAutoFilled =
                          prov &&
                          prov.source === 'wearable-simulated' &&
                          !prov.isManuallyEdited;
                        const isManuallyEdited = prov && prov.isManuallyEdited;

                        return (
                          <div key={field.name} className="flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                  {field.label}
                                </label>
                              </div>

                              <div className="relative rounded-lg shadow-2xs">
                                <input
                                  type="number"
                                  step={field.step || 1}
                                  min={field.min}
                                  max={field.max}
                                  value={values[field.name] ?? ''}
                                  onChange={(e) =>
                                    handleInputChange(checkId, field.name, e.target.value)
                                  }
                                  placeholder={field.placeholder || ''}
                                  className={`w-full text-sm text-slate-900 rounded-lg border px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono ${
                                    isAutoFilled
                                      ? 'bg-sky-50/40 border-sky-300'
                                      : isManuallyEdited
                                      ? 'bg-amber-50/40 border-amber-300'
                                      : 'bg-slate-50/60 border-slate-200'
                                  }`}
                                />
                                {field.unit && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400 font-medium">
                                    {field.unit}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Provenance Badge & Actions */}
                            <div className="mt-1.5">
                              {isAutoFilled ? (
                                <div className="text-[11px] font-medium text-sky-800 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded flex items-center justify-between">
                                  <span className="flex items-center space-x-1 truncate">
                                    <Zap className="w-3 h-3 text-sky-600 shrink-0" />
                                    <span className="truncate">Auto-filled from ASTRA BioBand</span>
                                  </span>
                                  {prov.isEstimated && (
                                    <span className="text-amber-700 font-semibold shrink-0 ml-1">
                                      [Estimated]
                                    </span>
                                  )}
                                  {field.name === 'temperature' && (
                                    <span className="text-sky-700 font-semibold shrink-0 ml-1">
                                      [Skin Temp]
                                    </span>
                                  )}
                                </div>
                              ) : isManuallyEdited ? (
                                <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center justify-between">
                                  <span className="truncate">
                                    ✏️ Manually edited
                                    {prov.originalWearableValue !== undefined && (
                                      <span className="text-amber-900 font-semibold ml-1">
                                        (was: {prov.originalWearableValue})
                                      </span>
                                    )}
                                  </span>
                                  {prov.originalWearableValue !== undefined && (
                                    <button
                                      type="button"
                                      onClick={() => revertFieldToWearable(checkId, field.name)}
                                      className="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline shrink-0 ml-1.5"
                                    >
                                      Revert
                                    </button>
                                  )}
                                </div>
                              ) : checkId === 'blood-pressure' ? (
                                <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded">
                                  Manual cuff measurement required
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {error && (
                      <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-amber-800 text-xs flex items-center space-x-2">
                    <PowerOff className="w-4 h-4 shrink-0" />
                    <span>
                      This check is marked as unavailable/skipped. It will be recorded as omitted in the final telemetry log.
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 5. NAVIGATION BAR */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
        <button
          onClick={onBackToQuestions}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Adaptive Questions</span>
        </button>

        <button
          onClick={handleProceed}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Generate Assessment Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
