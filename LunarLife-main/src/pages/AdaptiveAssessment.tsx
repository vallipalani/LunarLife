import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  History,
  Activity,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Card, Badge, PageHeader } from '../components';
import { AstronautProfile } from '../types';
import {
  AdaptiveQuestion,
  HealthAssessmentRecord,
  HealthCheckId,
  HealthCheckResult,
  QuestionAnswer,
  SymptomReport,
} from '../assessment/types';
import { WearableDevice, WearableReading } from '../assessment/wearableData';
import { getAdaptiveQuestionsForSymptoms } from '../assessment/questionsData';
import { getRecommendedHealthChecks } from '../assessment/healthChecksData';
import { compileAssessmentRecord } from '../assessment/assessmentLogic';
import {
  getAssessmentHistory,
  resetAssessmentHistory,
  saveAssessmentToHistory,
} from '../assessment/historyStorage';
import { SymptomSelector } from '../assessment/components/SymptomSelector';
import { AdaptiveQuestionView } from '../assessment/components/AdaptiveQuestionView';
import { GuidedChecksView } from '../assessment/components/GuidedChecksView';
import { AssessmentSummaryView } from '../assessment/components/AssessmentSummaryView';
import { AssessmentHistoryView } from '../assessment/components/AssessmentHistoryView';

interface AdaptiveAssessmentProps {
  astronaut: AstronautProfile;
}

type MainTab = 'new-assessment' | 'history';
type AssessmentStep = 1 | 2 | 3 | 4;

export function AdaptiveAssessment({ astronaut }: AdaptiveAssessmentProps) {
  const [activeTab, setActiveTab] = useState<MainTab>('new-assessment');
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);

  // Workflow Data
  const [symptomReport, setSymptomReport] = useState<SymptomReport | null>(null);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [recommendedChecks, setRecommendedChecks] = useState<HealthCheckId[]>([]);
  const [checkResults, setCheckResults] = useState<HealthCheckResult[]>([]);
  const [completedRecord, setCompletedRecord] = useState<HealthAssessmentRecord | null>(null);

  // History State
  const [history, setHistory] = useState<HealthAssessmentRecord[]>(() => getAssessmentHistory());

  useEffect(() => {
    setHistory(getAssessmentHistory());
  }, []);

  // Step 1: Handle Symptom Submission
  const handleProceedFromSymptoms = (report: SymptomReport) => {
    setSymptomReport(report);

    // Adapt follow-up questions to selected symptoms
    const questions = getAdaptiveQuestionsForSymptoms(report.selectedSymptoms);
    setAdaptiveQuestions(questions);

    // Adapt recommended health checks
    const checks = getRecommendedHealthChecks(report.selectedSymptoms);
    setRecommendedChecks(checks);

    setCurrentStep(2);
  };

  // Step 2: Handle Question Answers Submission
  const handleProceedFromQuestions = (answers: QuestionAnswer[]) => {
    setQuestionAnswers(answers);
    setCurrentStep(3);
  };

  // Step 3: Handle Guided Checks Submission -> Compile Summary
  const handleProceedFromChecks = (
    results: HealthCheckResult[],
    wearableSummary?: { device: WearableDevice; readings: WearableReading[] }
  ) => {
    setCheckResults(results);

    if (symptomReport) {
      const record = compileAssessmentRecord(
        astronaut,
        symptomReport,
        questionAnswers,
        results,
        wearableSummary
      );
      setCompletedRecord(record);
      setCurrentStep(4);
    }
  };

  // Save to History handler
  const handleSaveToHistory = (record: HealthAssessmentRecord) => {
    const updated = saveAssessmentToHistory(record);
    setHistory(updated);
  };

  // Start fresh assessment
  const handleStartNewAssessment = () => {
    setSymptomReport(null);
    setAdaptiveQuestions([]);
    setQuestionAnswers([]);
    setRecommendedChecks([]);
    setCheckResults([]);
    setCompletedRecord(null);
    setCurrentStep(1);
    setActiveTab('new-assessment');
  };

  // Reset history
  const handleResetHistory = () => {
    const resetRecords = resetAssessmentHistory();
    setHistory(resetRecords);
  };

  const stepsMetadata = [
    { number: 1, title: 'Symptom Reporting' },
    { number: 2, title: 'Adaptive Questions' },
    { number: 3, title: 'Guided Health Checks' },
    { number: 4, title: 'Assessment Summary' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        category="Crew Health Monitoring & Diagnostics"
        title="Adaptive Health Assessment"
        description="Dynamic, symptom-adaptive astronaut evaluations tailoring follow-up queries and guided biometric examinations to mission physiological state."
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('new-assessment')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'new-assessment'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>New Assessment</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Assessment History</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold">
                {history.length}
              </span>
            </button>
          </div>
        }
      />

      {/* 2. TAB CONTENT: NEW ASSESSMENT WORKFLOW */}
      {activeTab === 'new-assessment' && (
        <div className="space-y-6">
          {/* Workflow Stepper Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-3.5 sm:p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {stepsMetadata.map((st) => {
                const isActive = currentStep === st.number;
                const isCompleted = currentStep > st.number;

                return (
                  <div
                    key={st.number}
                    className={`flex items-center space-x-2.5 p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sky-50/70 border border-sky-100'
                        : isCompleted
                        ? 'bg-emerald-50/40'
                        : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : st.number}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Step {st.number}
                      </div>
                      <div
                        className={`text-xs font-semibold truncate ${
                          isActive
                            ? 'text-sky-900 font-bold'
                            : isCompleted
                            ? 'text-emerald-900'
                            : 'text-slate-600'
                        }`}
                      >
                        {st.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Symptom Reporting */}
          {currentStep === 1 && (
            <SymptomSelector
              astronaut={astronaut}
              initialReport={symptomReport}
              onProceed={handleProceedFromSymptoms}
            />
          )}

          {/* STEP 2: Adaptive Follow-up Questions */}
          {currentStep === 2 && (
            <AdaptiveQuestionView
              questions={adaptiveQuestions}
              initialAnswers={questionAnswers}
              selectedSymptoms={symptomReport?.selectedSymptoms || []}
              onBackToSymptoms={() => setCurrentStep(1)}
              onProceed={handleProceedFromQuestions}
            />
          )}

          {/* STEP 3: Guided Health Checks */}
          {currentStep === 3 && symptomReport && (
            <GuidedChecksView
              recommendedCheckIds={recommendedChecks}
              symptomReport={symptomReport}
              answers={questionAnswers}
              astronaut={astronaut}
              initialResults={checkResults}
              onBackToQuestions={() => setCurrentStep(2)}
              onProceed={handleProceedFromChecks}
            />
          )}

          {/* STEP 4: Assessment Summary */}
          {currentStep === 4 && completedRecord && (
            <AssessmentSummaryView
              assessment={completedRecord}
              onSaveToHistory={handleSaveToHistory}
              onStartNewAssessment={handleStartNewAssessment}
              onViewHistory={() => setActiveTab('history')}
            />
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: ASSESSMENT HISTORY */}
      {activeTab === 'history' && (
        <AssessmentHistoryView
          history={history}
          onStartNewAssessment={handleStartNewAssessment}
          onResetHistory={handleResetHistory}
        />
      )}
    </div>
  );
}
