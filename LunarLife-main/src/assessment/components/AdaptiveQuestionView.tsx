import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Check,
  RotateCcw,
  ListChecks,
} from 'lucide-react';
import { Card, Badge } from '../../components';
import { AdaptiveQuestion, QuestionAnswer, QuestionOption, SymptomCategory } from '../types';

interface AdaptiveQuestionViewProps {
  questions: AdaptiveQuestion[];
  initialAnswers?: QuestionAnswer[];
  selectedSymptoms: SymptomCategory[];
  onBackToSymptoms: () => void;
  onProceed: (answers: QuestionAnswer[]) => void;
}

export function AdaptiveQuestionView({
  questions,
  initialAnswers = [],
  selectedSymptoms,
  onBackToSymptoms,
  onProceed,
}: AdaptiveQuestionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map of questionId -> value (string | string[])
  const [answersMap, setAnswersMap] = useState<Record<string, string | string[]>>(() => {
    const map: Record<string, string | string[]> = {};
    initialAnswers.forEach((ans) => {
      map[ans.questionId] = ans.value;
    });
    return map;
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <Card title="No Questions Found">
        <p className="text-xs text-slate-500">
          No adaptive questions were generated for the selected symptoms. Please go back and select at least one symptom category.
        </p>
        <button
          onClick={onBackToSymptoms}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Symptoms
        </button>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentValue = answersMap[currentQuestion.id] ?? (currentQuestion.type === 'multi-choice' ? [] : '');

  const answeredCount = Object.keys(answersMap).filter((qid) => {
    const val = answersMap[qid];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== '';
  }).length;

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectSingle = (value: string) => {
    setValidationError(null);
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleToggleMulti = (value: string) => {
    setValidationError(null);
    const currArr = Array.isArray(currentValue) ? [...currentValue] : [];
    const nextArr = currArr.includes(value)
      ? currArr.filter((v) => v !== value)
      : [...currArr, value];
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: nextArr }));
  };

  const handleTextChange = (text: string) => {
    setValidationError(null);
    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: text }));
  };

  const handleNext = () => {
    // Validate current question if required
    if (currentQuestion.required) {
      if (
        currentValue === undefined ||
        currentValue === '' ||
        (Array.isArray(currentValue) && currentValue.length === 0)
      ) {
        setValidationError('Please select or enter an answer before continuing.');
        return;
      }
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setValidationError(null);
    } else {
      // Last question reached; open review or proceed
      compileAndProceed();
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBackToSymptoms();
    }
  };

  const compileAndProceed = () => {
    // Check if any required question is missing
    const missing = questions.find((q) => {
      if (!q.required) return false;
      const v = answersMap[q.id];
      if (v === undefined || v === '') return true;
      if (Array.isArray(v) && v.length === 0) return true;
      return false;
    });

    if (missing) {
      const missingIdx = questions.findIndex((q) => q.id === missing.id);
      setCurrentIndex(missingIdx);
      setValidationError(`Please provide an answer for this required question before continuing.`);
      setIsReviewOpen(false);
      return;
    }

    const answersList: QuestionAnswer[] = questions
      .filter((q) => answersMap[q.id] !== undefined && answersMap[q.id] !== '')
      .map((q) => ({
        questionId: q.id,
        symptomId: q.symptomId,
        questionText: q.text,
        value: answersMap[q.id],
      }));

    onProceed(answersList);
  };

  const renderOptionContent = (option: QuestionOption, isSelected: boolean, isMulti: boolean) => (
    <div
      key={option.value}
      onClick={() => (isMulti ? handleToggleMulti(option.value) : handleSelectSingle(option.value))}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex items-start justify-between ${
        isSelected
          ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-500/30'
          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-start space-x-3.5 pr-4">
        <div className="pt-0.5">
          <div
            className={`w-4 h-4 rounded-${isMulti ? 'md' : 'full'} border flex items-center justify-center transition-colors ${
              isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white'
            }`}
          >
            {isSelected && (
              isMulti ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )
            )}
          </div>
        </div>

        <div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
            {option.label}
          </div>
          {option.subtext && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.subtext}</p>
          )}
        </div>
      </div>

      {option.isRedFlag && (
        <span className="shrink-0 text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
          Priority Flag
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. PROGRESS BAR & CONTEXT BAR */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                Adaptive Question Engine
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Adapting to {selectedSymptoms.map((s) => s.replace('-', ' ')).join(', ')}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Question {currentIndex + 1} of {questions.length}
            </h3>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <button
              onClick={() => setIsReviewOpen(!isReviewOpen)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <ListChecks className="w-3.5 h-3.5 text-sky-600" />
              <span>Review Answers ({answeredCount}/{questions.length})</span>
            </button>
            <Badge variant="blue" size="sm">
              {progressPercent}% Complete
            </Badge>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-sky-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between mt-3 overflow-x-auto py-1">
          {questions.map((q, idx) => {
            const isAnswered =
              answersMap[q.id] !== undefined &&
              answersMap[q.id] !== '' &&
              (!Array.isArray(answersMap[q.id]) || (answersMap[q.id] as string[]).length > 0);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => {
                  setValidationError(null);
                  setCurrentIndex(idx);
                }}
                className={`flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-sky-100 text-sky-800 font-bold'
                    : isAnswered
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
                title={`Q${idx + 1}: ${q.text}`}
              >
                <span>Q{idx + 1}</span>
                {isAnswered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* REVIEW ANSWERS COLLAPSIBLE DRAWER */}
      {isReviewOpen && (
        <Card
          title="Review Recorded Answers"
          subtitle="Click on any question to jump to it and edit your response before proceeding."
          action={
            <button
              onClick={() => setIsReviewOpen(false)}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800"
            >
              Close Review
            </button>
          }
          className="border-sky-200 bg-sky-50/20"
        >
          <div className="space-y-2 mt-2 max-h-72 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const val = answersMap[q.id];
              const isAnswered =
                val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0);

              let displayVal = 'Not answered yet';
              if (isAnswered) {
                if (Array.isArray(val)) {
                  displayVal = val.join(', ');
                } else {
                  // Find label if option
                  const opt = q.options?.find((o) => o.value === val);
                  displayVal = opt ? opt.label : String(val);
                }
              }

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsReviewOpen(false);
                  }}
                  className={`cursor-pointer p-3 rounded-lg border text-xs transition-colors flex items-start justify-between ${
                    idx === currentIndex
                      ? 'bg-sky-100/70 border-sky-300'
                      : isAnswered
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="pr-4">
                    <span className="font-semibold text-slate-700">Q{idx + 1}: {q.text}</span>
                    <div className="text-[11px] text-sky-800 mt-1 font-medium">{displayVal}</div>
                  </div>
                  <Badge variant={isAnswered ? 'success' : 'amber'} size="sm">
                    {isAnswered ? 'Answered' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. CURRENT QUESTION CARD */}
      <Card
        title={`Question ${currentIndex + 1} of ${questions.length}`}
        subtitle={`Targeting symptom: ${currentQuestion.symptomId.replace('-', ' ').toUpperCase()}`}
        action={
          currentQuestion.required ? (
            <Badge variant="rose" size="sm">Required</Badge>
          ) : (
            <Badge variant="neutral" size="sm">Optional</Badge>
          )
        }
      >
        <div className="mt-2">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            {currentQuestion.text}
          </h2>

          {currentQuestion.contextHint && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{currentQuestion.contextHint}</span>
            </p>
          )}

          {/* Options / Input renderers */}
          <div className="mt-5">
            {/* Single Choice */}
            {currentQuestion.type === 'single-choice' && currentQuestion.options && (
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) =>
                  renderOptionContent(opt, currentValue === opt.value, false)
                )}
              </div>
            )}

            {/* Multi Choice */}
            {currentQuestion.type === 'multi-choice' && currentQuestion.options && (
              <div className="space-y-2.5">
                <div className="text-xs text-slate-500 mb-2 italic">Select all that apply:</div>
                {currentQuestion.options.map((opt) => {
                  const isSel = Array.isArray(currentValue) && currentValue.includes(opt.value);
                  return renderOptionContent(opt, isSel, true);
                })}
              </div>
            )}

            {/* Scale 1-10 */}
            {currentQuestion.type === 'scale' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{currentQuestion.minLabel || '1 (Mild)'}</span>
                  <span className="text-sky-700 font-bold text-base">
                    {currentValue ? `Current: ${currentValue}` : 'Select a value'}
                  </span>
                  <span>{currentQuestion.maxLabel || '10 (Severe)'}</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {Array.from(
                    { length: (currentQuestion.max || 10) - (currentQuestion.min || 1) + 1 },
                    (_, i) => (currentQuestion.min || 1) + i
                  ).map((num) => {
                    const isSelected = String(currentValue) === String(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSelectSingle(String(num))}
                        className={`h-11 rounded-lg border text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Text Answer */}
            {currentQuestion.type === 'text' && (
              <div>
                <textarea
                  value={typeof currentValue === 'string' ? currentValue : ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={3}
                  placeholder={currentQuestion.placeholder || 'Type your response here...'}
                  className="w-full text-xs text-slate-800 bg-slate-50/50 rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 leading-relaxed"
                />
              </div>
            )}
          </div>

          {validationError && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 3. NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle">
        <button
          onClick={handlePrev}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentIndex === 0 ? 'Back to Symptoms' : 'Previous Question'}</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={compileAndProceed}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Proceed to Guided Checks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
