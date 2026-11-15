import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Coffee,
  HeartHandshake,
  Compass,
  CalendarCheck,
  CheckSquare,
  Filter,
} from 'lucide-react';
import { Card, Badge, PageHeader } from '../components';
import { RecommendationItem, DailyTask } from '../types';
import { initialRecommendations, initialFollowUpTasks } from '../data';

export function HealthRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(initialRecommendations);
  const [followUpTasks, setFollowUpTasks] = useState<DailyTask[]>(initialFollowUpTasks);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Physical Activity',
    'Sleep Management',
    'Stress Management',
    'Preventive Health',
  ] as const;

  const handleToggleRec = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, completed: !rec.completed } : rec))
    );
  };

  const handleToggleFollowUp = (id: string) => {
    setFollowUpTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const filteredRecs =
    activeCategory === 'All'
      ? recommendations
      : recommendations.filter((r) => r.category === activeCategory);

  const completedFollowUpCount = followUpTasks.filter((t) => t.completed).length;
  const followUpPercent = Math.round((completedFollowUpCount / followUpTasks.length) * 100);

  const totalCompletedRecs = recommendations.filter((r) => r.completed).length;

  const categoryIconMap: Record<string, React.ReactNode> = {
    'Physical Activity': <Flame className="w-4 h-4 text-orange-600" />,
    'Sleep Management': <Coffee className="w-4 h-4 text-sky-600" />,
    'Stress Management': <HeartHandshake className="w-4 h-4 text-purple-600" />,
    'Preventive Health': <Compass className="w-4 h-4 text-emerald-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Personalised Health Profile"
        title="Health Recommendations"
        description="Prescribed countermeasure protocols, circadian alignment schedules, and preventive aerospace health routines."
        action={
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
            {totalCompletedRecs} of {recommendations.length} Protocols Logged
          </span>
        }
      />

      {/* 1. CATEGORY FILTER BUTTONS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-sky-600 text-white shadow-xs font-semibold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            onClick={() => handleToggleRec(rec.id)}
            className={`cursor-pointer bg-white rounded-xl border p-5 transition-all shadow-subtle ${
              rec.completed
                ? 'border-sky-200 bg-sky-50/20'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-sky-600 focus:outline-none shrink-0"
                  aria-label="Toggle completion"
                >
                  {rec.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-sky-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-900">{rec.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.description}</p>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end space-y-1.5">
                <Badge variant={rec.completed ? 'blue' : 'neutral'} size="sm">
                  {rec.category.split(' ')[0]}
                </Badge>
                {rec.completed && (
                  <span className="text-[10px] text-sky-700 font-medium">Logged</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. FOLLOW-UP TASKS SECTION */}
      <Card
        title="Follow-Up Tasks & Action Items"
        subtitle="Mandatory astronaut physiological tracking tasks for orbital cycle handover"
        action={
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            {completedFollowUpCount} / {followUpTasks.length} Completed
          </span>
        }
      >
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-sky-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${followUpPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {followUpTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleToggleFollowUp(task.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                task.completed
                  ? 'bg-sky-50/50 border-sky-200 text-slate-700'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span
                  className={`text-xs font-medium truncate ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <Badge variant={task.completed ? 'blue' : 'neutral'} size="sm">
                {task.completed ? 'Done' : 'Pending'}
              </Badge>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
