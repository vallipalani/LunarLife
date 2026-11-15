import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Save,
  RotateCcw,
  FileText,
  Activity,
  Heart,
  Calendar,
  User,
  ArrowRight,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';
import { Card, Badge } from '../../components';
import { SEVERITY_CONFIG } from '../symptomsData';
import { HealthAssessmentRecord } from '../types';

interface AssessmentSummaryViewProps {
  assessment: HealthAssessmentRecord;
  onSaveToHistory: (record: HealthAssessmentRecord) => void;
  onStartNewAssessment: () => void;
  onViewHistory: () => void;
}

export function AssessmentSummaryView({
  assessment,
  onSaveToHistory,
  onStartNewAssessment,
  onViewHistory,
}: AssessmentSummaryViewProps) {
  const [isSaved, setIsSaved] = useState(false);

  const {
    symptomReport,
    answers,
    healthChecks,
    observations,
    nextSteps,
    escalation,
    status,
    timestamp,
    missionDay,
    astronautName,
    astronautId,
  } = assessment;

  const severityConfig = SEVERITY_CONFIG[symptomReport.severity];

  const handleSave = () => {
    onSaveToHistory(assessment);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. MEDICAL DISCLAIMER & ESCALATION NOTICE */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Operational Health Telemetry Disclaimer:</strong> LunarLife Adaptive Health Assessment is a guided clinical telemetry and symptom collection system. It is <strong>not a medical diagnosis system</strong>. All automated observations and suggested countermeasures are non-prescriptive and should be corroborated by the NASA/ESA Flight Surgeon console.
        </div>
      </div>

      {/* Escalation Alert Banner if Urgent */}
      {escalation.isEscalated ? (
        <div className="p-5 rounded-xl border-2 border-rose-400 bg-rose-50 shadow-sm text-rose-950 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Escalation Triggered
                </span>
                <Badge variant="rose" size="sm">Urgent Flight Surgeon Action</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {escalation.headline}
              </h3>
            </div>
          </div>

          <div className="pt-2 border-t border-rose-200/60">
            <div className="text-xs font-bold text-rose-900 mb-1">Escalation Reasons Detected:</div>
            <ul className="list-disc list-inside text-xs text-rose-800 space-y-0.5">
              {escalation.reasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-rose-200/60">
            <div className="text-xs font-bold text-rose-900 mb-1">Immediate Safety Directives:</div>
            <ul className="list-disc list-inside text-xs text-rose-800 space-y-0.5">
              {escalation.immediateDirectives.map((d, idx) => (
                <li key={idx} className="font-medium">{d}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Assessment Status: Nominal
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                No immediate red-flag thresholds breached. Follow routine countermeasures and scheduled rechecks.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            Status: {status}
          </Badge>
        </div>
      )}

      {/* 2. RECORD HEADER CARD */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
              <span>Assessment Summary</span>
              <span>•</span>
              <span>ID: {assessment.id}</span>
              <span>•</span>
              <span>{missionDay}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Clinical Assessment Record
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Commander {astronautName} ({astronautId}) • Recorded at {timestamp}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
            {!isSaved ? (
              <button
                onClick={handleSave}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save to Assessment History</span>
              </button>
            ) : (
              <div className="inline-flex items-center space-x-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved to Session History</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. STRUCTURED TWO-COLUMN REPORT:
          Column A: Recorded Astronaut Data (Symptoms, Answers, Measurements)
          Column B: Automated Observations & Suggested Next Steps
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= COLUMN A: RECORDED INFORMATION ================= */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
            <ClipboardList className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              A. Recorded Astronaut Information
            </h3>
          </div>

          {/* Reported Symptoms Card */}
          <Card
            title="Reported Symptoms & Impact"
            subtitle="Captured directly during initial symptom reporting"
          >
            <div className="space-y-3 mt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Symptoms Reported
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {symptomReport.selectedSymptoms.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200"
                    >
                      {sym.replace('-', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-medium text-slate-400 uppercase">Severity</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-bold text-slate-900">{severityConfig.label}</span>
                    <Badge variant={severityConfig.badgeVariant} size="sm">
                      {symptomReport.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-medium text-slate-400 uppercase">Duration</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {symptomReport.duration.replace(/-/g, ' ')}
                  </div>
                </div>
              </div>

              {symptomReport.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Astronaut Notes
                  </span>
                  <p className="text-xs text-slate-700 mt-1 italic bg-slate-50 p-2.5 rounded border border-slate-200/60 leading-relaxed">
                    "{symptomReport.description}"
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Follow-up Question Answers */}
          <Card
            title="Follow-Up Question Responses"
            subtitle="Adaptive questionnaire responses logged during assessment"
          >
            {answers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No questionnaire answers recorded.</p>
            ) : (
              <div className="space-y-3 mt-1">
                {answers.map((ans, idx) => (
                  <div
                    key={ans.questionId}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div className="font-medium text-slate-700 leading-snug">
                      <span className="text-sky-700 font-semibold mr-1.5">Q{idx + 1}:</span>
                      {ans.questionText}
                    </div>
                    <div className="mt-1.5 font-semibold text-slate-900 pl-4 border-l-2 border-sky-400">
                      {Array.isArray(ans.value) ? ans.value.join(', ') : ans.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Health Checks & Measurements */}
          <Card
            title="Recorded Biometrics & Health Checks"
            subtitle="Measurements recorded against pre-mission terrestrial baselines, with wearable provenance"
          >
            <div className="space-y-3.5 mt-1">
              {healthChecks.map((check) => {
                const provEntries = Object.entries(check.provenance || {});

                return (
                  <div
                    key={check.checkId}
                    className="p-3.5 rounded-lg border border-slate-200/80 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-800">{check.title}</div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {check.displaySummary}
                        </div>
                        {check.comparedToBaseline && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {check.comparedToBaseline}
                          </div>
                        )}
                      </div>

                      <Badge
                        variant={
                          check.status === 'nominal'
                            ? 'success'
                            : check.status === 'abnormal'
                            ? 'amber'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {check.isUnavailable ? 'Unavailable' : check.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Detailed field provenance strip */}
                    {provEntries.length > 0 && !check.isUnavailable && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Data Source & Provenance
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {provEntries.map(([fKey, prov]) => (
                            <span
                              key={fKey}
                              className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${
                                prov.isManuallyEdited
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : prov.source === 'wearable-simulated'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              <strong className="mr-1">{fKey}:</strong>
                              {prov.isManuallyEdited
                                ? `Manually Edited (Wearable was: ${prov.originalWearableValue})`
                                : prov.source === 'wearable-simulated'
                                ? `Auto-filled via ASTRA BioBand [Simulated]`
                                : 'Manual Entry'}
                              {prov.isEstimated && ' • Estimated'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {check.isUnavailable && (
                      <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Omitted: {check.unavailableReason || 'Measurement unavailable'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Wearable Device Telemetry Provenance Card */}
          {assessment.wearableSummary && (
            <Card
              title="Wearable Device Telemetry Streams"
              subtitle="Synchronized live streams from ASTRA Bio-Telemetry SmartBand [Simulated Prototype]"
              action={
                <Badge variant="blue" size="sm">
                  {assessment.wearableSummary.device.status === 'connected'
                    ? 'Device Synchronized'
                    : 'Device Offline'}
                </Badge>
              }
            >
              <div className="space-y-2 mt-1">
                <div className="text-xs text-slate-500 flex items-center justify-between pb-2 border-b border-slate-100">
                  <span>
                    Hardware: <strong>{assessment.wearableSummary.device.name}</strong> ({assessment.wearableSummary.device.model})
                  </span>
                  <span className="font-mono text-[11px]">
                    Sync: {assessment.wearableSummary.device.lastSyncTimestamp}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {assessment.wearableSummary.readings.map((r) => (
                    <div
                      key={r.type}
                      className="p-2 rounded bg-slate-50/70 border border-slate-200 text-xs"
                    >
                      <div className="text-[10px] text-slate-400 font-medium truncate">{r.label}</div>
                      <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                        {r.value} <span className="text-[10px] font-normal text-slate-500">{r.unit.split(' ')[0]}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 truncate">
                        {r.isEstimated ? '⚡ Inferred Estimate' : '● Direct Sensor'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 italic pt-1">
                  {assessment.wearableSummary.device.disclaimer}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ================= COLUMN B: AUTOMATED OBSERVATIONS & NEXT STEPS ================= */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-200">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              B. Automated Observations & Next Steps
            </h3>
          </div>

          {/* Automated Observations */}
          <Card
            title="Relevant Observations"
            subtitle="Automated telemetry synthesis comparing findings to physiological baselines"
          >
            <div className="space-y-3 mt-1">
              {observations.map((obs) => (
                <div
                  key={obs.id}
                  className={`p-3 rounded-lg border text-xs ${
                    obs.type === 'critical'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                      : obs.type === 'warning'
                      ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                      : obs.type === 'positive'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{obs.title}</span>
                    <Badge
                      variant={
                        obs.type === 'critical'
                          ? 'rose'
                          : obs.type === 'warning'
                          ? 'amber'
                          : obs.type === 'positive'
                          ? 'success'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {obs.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">{obs.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Suggested Next Steps */}
          <Card
            title="Suggested Next Steps & Countermeasures"
            subtitle="Actionable flight protocols prioritized by clinical urgency"
          >
            <div className="space-y-3 mt-1">
              {nextSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                    step.priority === 'urgent'
                      ? 'border-rose-300 bg-rose-50/50'
                      : step.priority === 'recommended'
                      ? 'border-sky-300 bg-sky-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                      step.priority === 'urgent'
                        ? 'bg-rose-600 text-white'
                        : step.priority === 'recommended'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{step.action}</h4>
                      <Badge
                        variant={
                          step.priority === 'urgent'
                            ? 'rose'
                            : step.priority === 'recommended'
                            ? 'blue'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {step.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. ACTIONS FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Completed: {timestamp}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onStartNewAssessment}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Assessment</span>
          </button>

          <button
            onClick={onViewHistory}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>View Assessment History</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
