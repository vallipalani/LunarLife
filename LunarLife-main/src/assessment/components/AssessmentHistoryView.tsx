import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
  Eye,
  PlusCircle,
  X,
  RotateCcw,
  Activity,
  Heart,
  ClipboardCheck,
} from 'lucide-react';
import { Card, Badge, PageHeader } from '../../components';
import { SEVERITY_CONFIG } from '../symptomsData';
import { AssessmentStatus, HealthAssessmentRecord, SymptomSeverity } from '../types';

interface AssessmentHistoryViewProps {
  history: HealthAssessmentRecord[];
  onStartNewAssessment: () => void;
  onResetHistory?: () => void;
}

export function AssessmentHistoryView({
  history,
  onStartNewAssessment,
  onResetHistory,
}: AssessmentHistoryViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<HealthAssessmentRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredHistory = history.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (severityFilter !== 'all' && item.symptomReport.severity !== severityFilter) return false;
    return true;
  });

  const getStatusBadgeVariant = (status: AssessmentStatus): 'success' | 'amber' | 'rose' => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Requires Medical Review':
        return 'amber';
      case 'Urgent Escalation':
        return 'rose';
      default:
        return 'neutral' as any;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CONTROLS BAR: FILTERS & NEW ASSESSMENT BUTTON */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Requires Medical Review">Requires Medical Review</option>
                <option value="Urgent Escalation">Urgent Escalation</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500">
              <span>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="all">All Severities</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onResetHistory && (
              <button
                onClick={onResetHistory}
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                title="Reset to mission default historical records"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            )}

            <button
              onClick={onStartNewAssessment}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ASSESSMENTS LIST */}
      {filteredHistory.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No Assessment Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No previous assessments match the current filters. Clear the filters or start a new health assessment.
            </p>
            <button
              onClick={onStartNewAssessment}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Assessment</span>
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredHistory.map((rec) => {
            const severityCfg = SEVERITY_CONFIG[rec.symptomReport.severity];
            const isEscalated = rec.escalation.isEscalated;

            return (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="cursor-pointer bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 hover:border-slate-300 hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {rec.id}
                    </span>
                    <Badge variant="blue" size="sm">
                      {rec.missionDay}
                    </Badge>
                    <Badge variant={severityCfg.badgeVariant} size="sm">
                      Severity: {rec.symptomReport.severity.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(rec.status)} size="sm">
                      {rec.status}
                    </Badge>
                  </div>

                  {/* Symptoms line */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-medium text-slate-500">Symptoms:</span>
                    {rec.symptomReport.selectedSymptoms.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                      >
                        {s.replace('-', ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Key findings summary */}
                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rec.observations.length > 0
                      ? rec.observations.map((o) => o.title).join(' • ')
                      : 'Clinical health assessment recorded with standard biometric monitoring.'}
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-4">
                  <div className="text-right sm:text-left">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rec.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {rec.healthChecks.length} Guided Checks
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    aria-label="View full details"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FULL DETAILS MODAL */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 relative text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-sky-700 mb-1">
                  <span>{selectedRecord.id}</span>
                  <span>•</span>
                  <span>{selectedRecord.missionDay}</span>
                  <span>•</span>
                  <span>{selectedRecord.timestamp}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Full Assessment Report Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Astronaut: {selectedRecord.astronautName} ({selectedRecord.astronautId})
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 mt-5">
              {/* Status and Severity Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(selectedRecord.status)} size="md">
                  Status: {selectedRecord.status}
                </Badge>
                <Badge
                  variant={SEVERITY_CONFIG[selectedRecord.symptomReport.severity].badgeVariant}
                  size="md"
                >
                  Severity: {selectedRecord.symptomReport.severity.toUpperCase()}
                </Badge>
                <Badge variant="neutral" size="md">
                  Duration: {selectedRecord.symptomReport.duration.replace(/-/g, ' ')}
                </Badge>
              </div>

              {/* Escalation notice if any */}
              {selectedRecord.escalation.isEscalated && (
                <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-xs">
                  <div className="font-bold flex items-center space-x-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>{selectedRecord.escalation.headline}</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                    {selectedRecord.escalation.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reported Symptoms */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Reported Symptoms
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedRecord.symptomReport.selectedSymptoms.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800"
                    >
                      {s.replace('-', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
                {selectedRecord.symptomReport.description && (
                  <p className="text-xs text-slate-600 italic mt-2 pt-2 border-t border-slate-200/50">
                    "{selectedRecord.symptomReport.description}"
                  </p>
                )}
              </div>

              {/* Follow-up Questions and Answers */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Follow-up Question Responses
                </div>
                <div className="space-y-2">
                  {selectedRecord.answers.map((ans, idx) => (
                    <div
                      key={ans.questionId}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                    >
                      <div className="text-slate-600">
                        <span className="font-semibold text-sky-700 mr-1.5">Q{idx + 1}:</span>
                        {ans.questionText}
                      </div>
                      <div className="mt-1 font-semibold text-slate-900 pl-3 border-l-2 border-sky-400">
                        {Array.isArray(ans.value) ? ans.value.join(', ') : ans.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guided Checks */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Guided Health Checks & Biometrics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedRecord.healthChecks.map((chk) => {
                    const provList = Object.entries(chk.provenance || {});

                    return (
                      <div
                        key={chk.checkId}
                        className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs font-medium text-slate-500">{chk.title}</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">
                              {chk.displaySummary}
                            </div>
                            {chk.comparedToBaseline && (
                              <div className="text-[10px] text-slate-400">{chk.comparedToBaseline}</div>
                            )}
                          </div>
                          <Badge
                            variant={chk.status === 'nominal' ? 'success' : 'amber'}
                            size="sm"
                          >
                            {chk.status.toUpperCase()}
                          </Badge>
                        </div>

                        {provList.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                            {provList.map(([fName, p]) => (
                              <span
                                key={fName}
                                className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${
                                  p.isManuallyEdited
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : p.source === 'wearable-simulated'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {fName}: {p.isManuallyEdited ? 'Manual Edit' : 'Auto-filled BioBand'}
                                {p.isEstimated && ' (Est)'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automated Observations */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Automated Observations
                </div>
                <div className="space-y-2">
                  {selectedRecord.observations.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-3 rounded-lg border border-slate-200/80 bg-slate-50 text-xs"
                    >
                      <div className="font-semibold text-slate-900">{obs.title}</div>
                      <div className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                        {obs.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Suggested Next Steps
                </div>
                <div className="space-y-2">
                  {selectedRecord.nextSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white text-xs flex items-start space-x-2.5"
                    >
                      <span className="font-bold text-sky-600">{idx + 1}.</span>
                      <div>
                        <div className="font-semibold text-slate-900">{step.action}</div>
                        <div className="text-slate-500 mt-0.5 text-[11px]">{step.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
