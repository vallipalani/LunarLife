import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CheckCircle2, Circle, AlertCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
import { Card, Badge, MetricCard, PageHeader } from '../components';
import { AstronautProfile, DailyTask, HealthMetric } from '../types';
import { dashboardMetrics, recentAlerts, dashboardTrendsData } from '../data';

interface DashboardProps {
  astronaut: AstronautProfile;
  dailyTasks: DailyTask[];
  onToggleTask: (taskId: string) => void;
  onNavigateToAssistant: () => void;
}

export function Dashboard({
  astronaut,
  dailyTasks,
  onToggleTask,
  onNavigateToAssistant,
}: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / dailyTasks.length) * 100);

  const currentTrends = dashboardTrendsData[timeRange];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
              <span>Health Overview</span>
              <span>•</span>
              <span>Mission {astronaut.mission}</span>
              <span>•</span>
              <span>{astronaut.missionDay}</span>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Welcome back, Commander
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              All non-invasive biometric telemetry streams are synchronised with orbital flight control.
            </p>
          </div>

          <button
            onClick={onNavigateToAssistant}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-center"
          >
            <Activity className="w-4 h-4" />
            <span>Consult AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. OVERALL HEALTH STATUS */}
      <Card className="bg-gradient-to-r from-sky-50/50 via-white to-white border-sky-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-600/10 border border-sky-200/60 flex items-center justify-center text-sky-600 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-semibold text-slate-900">Overall Health Status</h3>
                <Badge variant="success" size="sm">
                  Status: {astronaut.status}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                Current health indicators are within expected ranges for orbital day 124. Cardiovascular, neuro-vestibular, and metabolic telemetry show normal adaptation to long-duration microgravity.
              </p>
            </div>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs shrink-0 self-start md:self-center">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Composite Score</div>
              <div className="text-xl font-bold text-slate-900">
                {astronaut.healthScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-3 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50">
              92%
            </div>
          </div>
        </div>
      </Card>

      {/* 3. HEALTH METRICS (5 Key Metrics) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Real-Time Health Metrics</h3>
          <span className="text-xs text-slate-400">Autonomous Sensor Feed</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dashboardMetrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
              status={metric.status}
              subtext={metric.subtext}
              trend={metric.trend}
              iconName={metric.iconName}
            />
          ))}
        </div>
      </div>

      {/* 4. HEALTH TRENDS SECTION (Heart Rate Line & Sleep Duration Bar) */}
      <Card
        title="Health Trends"
        subtitle="Longitudinal analysis of cardiovascular output and circadian sleep"
        action={
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            {(['24h', '7d', '30d'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeRange(filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  timeRange === filter
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === '24h' ? '24 Hours' : filter === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Heart Rate Line Chart */}
          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">Heart Rate Telemetry</h4>
                <p className="text-[11px] text-slate-400">Baseline resting band: 65–75 BPM</p>
              </div>
              <Badge variant="blue" size="sm">
                Line Chart
              </Badge>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentTrends.heartRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[55, 95]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val} BPM`, 'Heart Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284C7' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Duration Bar Chart */}
          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">Sleep Duration</h4>
                <p className="text-[11px] text-slate-400">Flight target: 8.0 hours / cycle</p>
              </div>
              <Badge variant="neutral" size="sm">
                Bar Chart
              </Badge>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentTrends.sleep} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 10]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val} hrs`, 'Sleep Duration']}
                  />
                  <Bar dataKey="sleepHours" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. RECENT ALERTS & DAILY TASKS (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card
          title="Recent Alerts"
          subtitle="Autonomous notifications logged during the current flight period"
        >
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded-md bg-white border border-slate-200/80 text-sky-600 shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">{alert.title}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center ml-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Health Tasks */}
        <Card
          title="Daily Health Tasks"
          subtitle="Mandatory astronaut countermeasure and biometric check protocols"
          action={
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                {completedCount} / {dailyTasks.length} completed
              </span>
            </div>
          }
        >
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {dailyTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  task.completed
                    ? 'bg-sky-50/40 border-sky-200/60 text-slate-700'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/60 text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400 shrink-0" />
                  )}
                  <span
                    className={`text-xs sm:text-sm font-medium ${
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
    </div>
  );
}
