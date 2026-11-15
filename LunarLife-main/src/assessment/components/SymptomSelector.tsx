import React, { useState } from 'react';
import {
  Compass,
  BatteryLow,
  Brain,
  AlertCircle,
  Dumbbell,
  Moon,
  HeartHandshake,
  Eye,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  ArrowRight,
  Shield,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { Card, Badge } from '../../components';
import { AstronautProfile } from '../../types';
import { DURATION_OPTIONS, SEVERITY_CONFIG, SYMPTOM_DEFINITIONS } from '../symptomsData';
import { SymptomCategory, SymptomDuration, SymptomReport, SymptomSeverity } from '../types';

interface SymptomSelectorProps {
  astronaut: AstronautProfile;
  initialReport?: SymptomReport | null;
  onProceed: (report: SymptomReport) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  BatteryLow,
  Brain,
  AlertCircle,
  Dumbbell,
  Moon,
  HeartHandshake,
  Eye,
  Activity,
};

export function SymptomSelector({ astronaut, initialReport, onProceed }: SymptomSelectorProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomCategory[]>(
    initialReport?.selectedSymptoms || []
  );
  const [severity, setSeverity] = useState<SymptomSeverity>(initialReport?.severity || 'mild');
  const [duration, setDuration] = useState<SymptomDuration>(
    initialReport?.duration || 'less-than-2-hours'
  );
  const [description, setDescription] = useState<string>(initialReport?.description || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleSymptom = (id: SymptomCategory) => {
    setValidationError(null);
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProceed = () => {
    if (selectedSymptoms.length === 0) {
      setValidationError('Please select at least one symptom category to proceed with the assessment.');
      return;
    }

    const now = new Date();
    const reportedAt = `${now.toISOString().split('T')[0]} ${now
      .getUTCHours()
      .toString()
      .padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`;

    onProceed({
      selectedSymptoms,
      severity,
      duration,
      description: description.trim(),
      reportedAt,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. ASTRONAUT CONTEXT STRIP */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 font-bold text-sm">
              <img
                src={astronaut.avatarUrl}
                alt={astronaut.name}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="hidden">AM</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-900">{astronaut.name}</span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {astronaut.astronautId}
                </span>
                <Badge variant="blue" size="sm">
                  {astronaut.mission} • {astronaut.missionDay}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Medical Baseline: HR {astronaut.baselineHeartRate} | BP {astronaut.baselineBloodPressure} | Temp {astronaut.baselineBodyTemp}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 self-start sm:self-center">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs text-slate-600 font-medium">Flight Surgeon Telemetry Linked</span>
          </div>
        </div>
      </div>

      {/* 2. SYMPTOM CATEGORY SELECTION */}
      <Card
        title="Select Reported Symptoms"
        subtitle="Choose all symptoms experienced during this operational period. Multiple selections are supported."
        action={
          <span className="text-xs font-medium text-slate-500">
            Selected: <strong className="text-sky-600">{selectedSymptoms.length}</strong>
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
          {SYMPTOM_DEFINITIONS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.id);
            const Icon = ICON_MAP[symptom.iconName] || Activity;

            return (
              <div
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/40 shadow-xs ring-1 ring-sky-500/30'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="text-xs font-medium text-sky-700 mb-0.5">{symptom.categoryTag}</div>
                  <h4 className="text-sm font-semibold text-slate-900">{symptom.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{symptom.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100/80 text-[11px] text-slate-400 italic">
                  {symptom.flightContext}
                </div>
              </div>
            );
          })}
        </div>

        {validationError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </Card>

      {/* 3. SEVERITY & DURATION SELECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity */}
        <Card
          title="Symptom Severity"
          subtitle="Rate the highest level of functional impairment or physical discomfort."
        >
          <div className="space-y-3 mt-1">
            {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map((level) => {
              const config = SEVERITY_CONFIG[level];
              const isSelected = severity === level;

              return (
                <div
                  key={level}
                  onClick={() => setSeverity(level)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start space-x-3 ${
                    isSelected
                      ? level === 'severe'
                        ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400'
                        : level === 'moderate'
                        ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400'
                        : 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? level === 'severe'
                            ? 'border-rose-600 bg-rose-600'
                            : level === 'moderate'
                            ? 'border-amber-600 bg-amber-600'
                            : 'border-sky-600 bg-sky-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-900">{config.label}</span>
                      <Badge variant={config.badgeVariant} size="sm">
                        {level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">{config.impactText}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {severity === 'severe' && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong>Clinical Safety Warning:</strong> Severe ratings trigger automated safety evaluation and priority medical escalation alerts for Ground Flight Surgeons.
              </div>
            </div>
          )}
        </Card>

        {/* Duration */}
        <Card
          title="Symptom Duration / Onset"
          subtitle="Specify approximately how long you have experienced these symptoms."
        >
          <div className="space-y-2 mt-1">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = duration === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setDuration(opt.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock
                      className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{opt.label}</div>
                      <div className="text-[11px] text-slate-500">{opt.subtext}</div>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 4. ADDITIONAL DESCRIPTION TEXTAREA */}
      <Card
        title="Additional Clinical Observations / Context"
        subtitle="Describe any specific activities, food intake, module locations, or circumstances during onset (optional)."
      >
        <div className="mt-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Sensation started approximately 40 minutes after completing the ARED resistive workout in Columbus module. Hydrated with 1 pack, but nausea remained upon translating back to Node 2..."
            className="w-full text-xs text-slate-800 bg-slate-50/50 rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Non-diagnostic intake log for telemetry correlation.</span>
            <span>{description.length} characters</span>
          </div>
        </div>
      </Card>

      {/* 5. PROCEED BUTTON */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
        <div className="text-xs text-slate-500">
          Step 1 of 4 • Symptom Reporting
        </div>

        <button
          onClick={handleProceed}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Adaptive Questions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
