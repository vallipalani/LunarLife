import React, { useState, useMemo } from 'react';
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
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  Moon,
  Smile,
  Thermometer,
  ShieldAlert,
  Users,
  Calendar,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, PageHeader } from '../components';
import {
  generatePredictiveAnalyticsReport,
  getAvailableCrewProfiles,
} from '../analytics/analyticsService';
import { TimeFilter, SeverityLevel } from '../analytics/types';

interface PredictiveAnalyticsProps {
  initialAstronautId?: string;
}

export function PredictiveAnalytics({
  initialAstronautId = 'AST003',
}: PredictiveAnalyticsProps) {
  const crewProfiles = useMemo(() => getAvailableCrewProfiles(), []);

  // Selected astronaut in the telemetry dataset
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(initialAstronautId);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [metricTab, setMetricTab] = useState<'cardio' | 'sleep' | 'neuro'>('sleep');

  // Generate predictive report dynamically from simulated datasets
  const report = useMemo(() => {
    return generatePredictiveAnalyticsReport(selectedAstronautId, timeFilter);
  }, [selectedAstronautId, timeFilter]);

  const statusVariantMap: Record<SeverityLevel, 'success' | 'amber' | 'rose'> = {
    Normal: 'success',
    Monitor: 'amber',
    Attention: 'rose',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Personalised Health Profile"
        title="Predictive Analytics"
        description="Empirical trend detection, pre-mission baseline comparisons, and microgravity physiological adaptation models (Section 4.2)."
        action={
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">Simulated Telemetry Engine Active</span>
          </div>
        }
      />

      {/* ASTRONAUT IDENTITY SELECTOR & TRANSPARENCY BANNER */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Telemetry Dataset Subject
                </span>
                <Badge variant="blue" size="sm">
                  {report.totalRecordsCount} Days Logged
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {report.astronautName} ({report.astronautId}) — {report.missionRole}
              </h3>
            </div>
          </div>

          {/* Crew Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200/80">
            {crewProfiles.map((crew) => {
              const isSelected = selectedAstronautId === crew.astronaut_id;
              const hasScenario =
                crew.astronaut_id === 'AST003'
                  ? 'Sleep Decline'
                  : crew.astronaut_id === 'AST001'
                  ? 'HR / Stress'
                  : 'Nominal';

              return (
                <button
                  key={crew.astronaut_id}
                  onClick={() => setSelectedAstronautId(crew.astronaut_id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-white text-sky-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`${crew.display_name} (${crew.mission_role})`}
                >
                  <span>{crew.astronaut_id}</span>
                  <span
                    className={`text-[10px] px-1 rounded ${
                      isSelected
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {hasScenario}
                  </span>
                </button>
              );
            })}

            {/* Unmapped App Profile Tester */}
            <button
              onClick={() => setSelectedAstronautId('AST-024')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedAstronautId === 'AST-024'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Test unmapped profile state (AST-024 demo profile)"
            >
              AST-024 (App Demo)
            </button>
          </div>
        </div>

        {/* Informational Guidance regarding AST-024 identity mapping */}
        {selectedAstronautId === 'AST-024' ? (
          <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Unmapped Application Profile ID (AST-024)</p>
              <p className="text-amber-800 leading-relaxed">
                The global application profile uses Commander Alex Morgan (AST-024). The primary flight research telemetry dataset contains monitoring logs for simulated Crew Alpha/Beta (AST001–AST004). In accordance with Section 5, identities are never silently cross-mapped.
              </p>
              <div className="pt-1 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedAstronautId('AST003')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors"
                >
                  Load AST003 (7-Day Sleep Decline Scenario)
                </button>
                <button
                  onClick={() => setSelectedAstronautId('AST001')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 rounded font-medium transition-colors"
                >
                  Load AST001 (Multi-Indicator Scenario)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Telemetry Log: 90 Study Days (Days 1–30 Pre-Mission Baseline; Days 31–90 In-Mission)
              </span>
            </span>
            <span className="text-[11px] text-slate-400">
              Personal Baseline Source: <span className="font-mono text-slate-600">astronaut_profiles.csv</span> + <span className="font-mono text-slate-600">PRE_MISSION records</span>
            </span>
          </div>
        )}
      </div>

      {/* INSUFFICIENT DATA STATE */}
      {report.isInsufficientData ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Insufficient Telemetry Data</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {report.insufficientDataReason}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedAstronautId('AST003')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Select Specialist C (AST003)
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* ================================================================= */}
          {/* SECTION 1: PREDICTIVE ANALYTICS OVERVIEW SUMMARY CARDS            */}
          {/* ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Heart Rate */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Resting Heart Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {report.overviewCards.heartRate.value}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {report.overviewCards.heartRate.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.overviewCards.heartRate.baseline}
                  </p>
                </div>
                <Badge
                  variant={statusVariantMap[report.overviewCards.heartRate.status]}
                  size="md"
                >
                  {report.overviewCards.heartRate.status}
                </Badge>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                {report.overviewCards.heartRate.subtext}
              </div>
            </div>

            {/* 2. Sleep Duration */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Sleep Duration
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {report.overviewCards.sleep.value}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {report.overviewCards.sleep.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.overviewCards.sleep.baseline}
                  </p>
                </div>
                <Badge
                  variant={statusVariantMap[report.overviewCards.sleep.status]}
                  size="md"
                >
                  {report.overviewCards.sleep.status}
                </Badge>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                {report.overviewCards.sleep.subtext}
              </div>
            </div>

            {/* 3. Blood Pressure */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Blood Pressure
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {report.overviewCards.bloodPressure.value}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {report.overviewCards.bloodPressure.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.overviewCards.bloodPressure.baseline}
                  </p>
                </div>
                <Badge
                  variant={statusVariantMap[report.overviewCards.bloodPressure.status]}
                  size="md"
                >
                  {report.overviewCards.bloodPressure.status}
                </Badge>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                {report.overviewCards.bloodPressure.subtext}
              </div>
            </div>

            {/* 4. Overall Detected Risks */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Active Risk Flags
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    report.overviewCards.overallRisk.status === 'Normal'
                      ? 'bg-emerald-50 text-emerald-600'
                      : report.overviewCards.overallRisk.status === 'Monitor'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {report.overviewCards.overallRisk.activeRisksCount}{' '}
                    <span className="text-xs font-normal text-slate-500">Flagged</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.overviewCards.overallRisk.status === 'Normal'
                      ? 'All nominal'
                      : `${report.overviewCards.overallRisk.status} required`}
                  </p>
                </div>
                <Badge
                  variant={statusVariantMap[report.overviewCards.overallRisk.status]}
                  size="md"
                >
                  {report.overviewCards.overallRisk.status}
                </Badge>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 truncate">
                {report.overviewCards.overallRisk.summary}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: HISTORICAL HEALTH TRENDS (FEATURE D)                   */}
          {/* ================================================================= */}
          <Card
            title="Long-Term Health Progress Telemetry"
            subtitle="Chronological multi-indicator progression, baseline reference boundaries, and moving-average trends"
            action={
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                  {(['7d', '30d', '90d'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        timeFilter === filter
                          ? 'bg-white text-sky-700 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter === '7d' ? 'Recent 7D' : filter === '30d' ? '30 Days' : 'Full 90D'}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            {/* Indicator Category Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <button
                onClick={() => setMetricTab('sleep')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  metricTab === 'sleep'
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sleep & Rest Hours
              </button>
              <button
                onClick={() => setMetricTab('cardio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  metricTab === 'cardio'
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cardiovascular (HR & BP)
              </button>
              <button
                onClick={() => setMetricTab('neuro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  metricTab === 'neuro'
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Stress, Mood & SpO2
              </button>
            </div>

            {/* TAB CONTENT: SLEEP DURATION */}
            {metricTab === 'sleep' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1">
                  <span>
                    Displaying daily sleep hours with target baseline and 3-day rolling moving average.
                  </span>
                  <span className="font-mono text-slate-700">
                    Observation Window: {report.timeSeries.length} Days
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.timeSeries}
                      margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="displayTime"
                        stroke="#94A3B8"
                        fontSize={10}
                        tickLine={false}
                        interval={timeFilter === '90d' ? 9 : timeFilter === '30d' ? 3 : 0}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        fontSize={10}
                        domain={[0, 10]}
                        tickLine={false}
                        unit="h"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '8px',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(val: number, name: string) => [
                          `${Number(val).toFixed(1)} hrs`,
                          name === 'sleepHours' ? 'Sleep Duration' : '3-Day Rolling Avg',
                        ]}
                        labelFormatter={(label) => String(label)}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <ReferenceLine
                        y={Number(report.overviewCards.sleep.baseline.split(' ')[0]) || 7.5}
                        stroke="#E11D48"
                        strokeDasharray="4 4"
                        label={{
                          value: 'Target Baseline',
                          fill: '#E11D48',
                          fontSize: 10,
                          position: 'top',
                        }}
                      />
                      <Bar
                        dataKey="sleepHours"
                        name="Daily Sleep"
                        fill="#38BDF8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="movingAvgSleepHours"
                        name="3-Day Rolling Trend"
                        stroke="#0284C7"
                        strokeWidth={2}
                        dot={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CARDIOVASCULAR */}
            {metricTab === 'cardio' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heart Rate Chart */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-800">
                      Resting Heart Rate (BPM)
                    </h4>
                    <Badge variant="blue" size="sm">
                      Line Chart
                    </Badge>
                  </div>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={report.timeSeries}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="displayTime"
                          stroke="#94A3B8"
                          fontSize={9}
                          tickLine={false}
                          interval={timeFilter === '90d' ? 12 : timeFilter === '30d' ? 4 : 0}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={10}
                          domain={['auto', 'auto']}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                          formatter={(val: number) => [`${val} BPM`, 'Heart Rate']}
                        />
                        <ReferenceLine
                          y={Number(report.overviewCards.heartRate.baseline.split(' ')[0]) || 68}
                          stroke="#94A3B8"
                          strokeDasharray="3 3"
                        />
                        <Line
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#0284C7"
                          strokeWidth={2}
                          dot={{ r: 1.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Blood Pressure Chart */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-800">
                      Arterial Blood Pressure (Sys / Dia)
                    </h4>
                    <Badge variant="neutral" size="sm">
                      Dual Trace
                    </Badge>
                  </div>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={report.timeSeries}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="displayTime"
                          stroke="#94A3B8"
                          fontSize={9}
                          tickLine={false}
                          interval={timeFilter === '90d' ? 12 : timeFilter === '30d' ? 4 : 0}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={10}
                          domain={[60, 140]}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          name="Systolic"
                          stroke="#0EA5E9"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          name="Diastolic"
                          stroke="#64748B"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NEURO / STRESS / SPO2 */}
            {metricTab === 'neuro' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stress & Mood Chart */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-800">
                      Stress & Mood Scores (1 to 5 Scale)
                    </h4>
                    <Badge variant="amber" size="sm">
                      Psychological Tone
                    </Badge>
                  </div>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={report.timeSeries}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="displayTime"
                          stroke="#94A3B8"
                          fontSize={9}
                          tickLine={false}
                          interval={timeFilter === '90d' ? 12 : timeFilter === '30d' ? 4 : 0}
                        />
                        <YAxis stroke="#94A3B8" fontSize={10} domain={[1, 5]} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line
                          type="monotone"
                          dataKey="stress"
                          name="Stress Level"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ r: 1.5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          name="Readiness / Mood"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ r: 1.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SpO2 Capillary Oxygenation Chart */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-800">
                      Capillary Oxygen Saturation (SpO2 %)
                    </h4>
                    <Badge variant="blue" size="sm">
                      Pulse Oximetry
                    </Badge>
                  </div>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={report.timeSeries}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="displayTime"
                          stroke="#94A3B8"
                          fontSize={9}
                          tickLine={false}
                          interval={timeFilter === '90d' ? 12 : timeFilter === '30d' ? 4 : 0}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={10}
                          domain={[94, 100]}
                          tickLine={false}
                          unit="%"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                          formatter={(val: number) => [`${val}%`, 'SpO2']}
                        />
                        <ReferenceLine
                          y={96.0}
                          stroke="#E11D48"
                          strokeDasharray="3 3"
                          label={{ value: 'Nominal Min', fill: '#E11D48', fontSize: 9 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="spo2"
                          stroke="#0284C7"
                          strokeWidth={2}
                          dot={{ r: 1.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* ================================================================= */}
          {/* SECTION 3: HISTORICAL BASELINE COMPARISON (FEATURE B)             */}
          {/* ================================================================= */}
          <Card
            title={`Personal Historical Comparison (${report.recentWindowDays}-Day Window)`}
            subtitle={`Recent observations compared against the astronaut's historical measurements strictly preceding the active ${report.recentWindowDays}-day window (No future data leakage)`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3">Health Indicator</th>
                    <th className="pb-3">Historical Average</th>
                    <th className="pb-3">Recent Window Mean</th>
                    <th className="pb-3">Absolute Delta</th>
                    <th className="pb-3">Percentage Delta</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 hidden lg:table-cell">Analytical Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.historicalComparisons.map((item) => {
                    const isPositive = item.absoluteDiff > 0;
                    const isNegative = item.absoluteDiff < 0;

                    return (
                      <tr key={item.metricKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900">
                          {item.metricLabel}
                        </td>
                        <td className="py-3 text-slate-600 font-mono text-xs">
                          {item.historicalMean} {item.unit}
                          <span className="text-[10px] text-slate-400 block">
                            n = {item.sampleCount.historical} days
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900 font-mono text-xs">
                          {item.recentMean} {item.unit}
                          <span className="text-[10px] text-slate-400 block">
                            n = {item.sampleCount.recent} days
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs font-medium">
                          <span
                            className={`inline-flex items-center space-x-0.5 ${
                              item.status === 'Attention'
                                ? 'text-rose-600 font-bold'
                                : item.status === 'Monitor'
                                ? 'text-amber-600'
                                : 'text-slate-700'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : isNegative ? (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isPositive ? '+' : ''}
                              {item.absoluteDiff} {item.unit}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs text-slate-600">
                          {isPositive ? '+' : ''}
                          {item.percentageDiff}%
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariantMap[item.status]} size="sm">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-xs text-slate-600 hidden lg:table-cell max-w-xs">
                          {item.interpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ================================================================= */}
          {/* SECTION 4: PRE-MISSION VS CURRENT HEALTH COMPARISON (FEATURE C)  */}
          {/* ================================================================= */}
          <Card
            title="Pre-Mission Baseline vs In-Mission Current Health"
            subtitle="Direct evaluation comparing terrestrial qualification records (PRE_MISSION Phase & Profile Baselines) against active flight telemetry"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3">Biometric Indicator</th>
                    <th className="pb-3">Pre-Mission Observed</th>
                    <th className="pb-3">Profile Baseline</th>
                    <th className="pb-3">Current / In-Mission</th>
                    <th className="pb-3">Mission Delta</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 hidden md:table-cell">Physiological Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.preMissionComparisons.map((item) => {
                    const isPositive = item.absoluteChange > 0;
                    return (
                      <tr key={item.metricKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900">{item.metricLabel}</td>
                        <td className="py-3 text-slate-700 font-mono text-xs">
                          {item.preMissionObservedMean} {item.unit}
                          {item.preMissionStdDev > 0 && (
                            <span className="text-[10px] text-slate-400 block font-sans">
                              (σ = {item.preMissionStdDev})
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500 font-mono text-xs">
                          {item.profileBaseline ? `${item.profileBaseline} ${item.unit}` : 'N/A'}
                        </td>
                        <td className="py-3 font-bold text-slate-900 font-mono text-xs">
                          {item.currentValue} {item.unit}
                        </td>
                        <td className="py-3 font-mono text-xs font-medium text-slate-800">
                          {isPositive ? '+' : ''}
                          {item.absoluteChange} {item.unit} ({isPositive ? '+' : ''}
                          {item.percentageChange}%)
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariantMap[item.status]} size="sm">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-xs text-slate-500 hidden md:table-cell max-w-sm leading-relaxed">
                          {item.interpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ================================================================= */}
          {/* SECTION 5: UNUSUAL PATTERNS & POTENTIAL RISKS (FEATURES A & E)    */}
          {/* ================================================================= */}
          <Card
            title="Potential Health Risk Identification & Statistical Alerts"
            subtitle="Multi-day pattern detection, consecutive deviation runs, and clinical monitoring recommendations (Non-diagnostic)"
            action={
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">
                  {report.potentialRisks.length} Pattern{report.potentialRisks.length > 1 ? 's' : ''} Analyzed
                </span>
              </div>
            }
          >
            <div className="space-y-4">
              {report.potentialRisks.map((risk) => {
                const isNormal = risk.severity === 'Normal';
                const isMonitor = risk.severity === 'Monitor';
                const Icon = isNormal ? CheckCircle2 : isMonitor ? AlertCircle : AlertTriangle;

                return (
                  <div
                    key={risk.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isNormal
                        ? 'border-emerald-200/80 bg-emerald-50/20'
                        : isMonitor
                        ? 'border-amber-200/80 bg-amber-50/20'
                        : 'border-rose-200/80 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                            isNormal
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : isMonitor
                              ? 'bg-amber-50 border-amber-200 text-amber-600'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900">{risk.title}</h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              • {risk.timing}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                            {risk.description}
                          </p>

                          {/* Supporting Observations List */}
                          {risk.supportingObservations.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/50">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                                Supporting Observations:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {risk.supportingObservations.map((obs, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-white/90 border border-slate-200 rounded px-2 py-0.5 text-[11px] font-mono text-slate-700 shadow-2xs"
                                  >
                                    {obs}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Baseline Comparison & Rationale */}
                          <div className="mt-2 text-xs text-slate-600 space-y-1">
                            <div>
                              <strong className="text-slate-700">Baseline Context:</strong>{' '}
                              {risk.baselineComparison}
                            </div>
                            <div>
                              <strong className="text-slate-700">Physiological Rationale:</strong>{' '}
                              {risk.rationale}
                            </div>
                            <div className="pt-1 text-sky-800 bg-sky-50/70 p-2 rounded-md border border-sky-100">
                              <strong className="text-sky-900">Recommended Action:</strong>{' '}
                              {risk.recommendationNextStep}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="self-start shrink-0 ml-10 sm:ml-0">
                        <Badge variant={statusVariantMap[risk.severity]} size="md">
                          {risk.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ================================================================= */}
          {/* SECTION 6: LONG-TERM HEALTH PROGRESS SUMMARY                     */}
          {/* ================================================================= */}
          <Card
            title="Long-Term Health Progress Summary"
            subtitle="Integrated flight surgeon longitudinal synthesis across the complete 90-day mission observation profile"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overall Adaptation Trajectory
                    </h4>
                    <div className="text-sm font-bold text-slate-900 capitalize">
                      {report.longTermProgressSummary.trajectory} Physiological Adaptation
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 sm:text-right">
                  <div>
                    Coverage:{' '}
                    <span className="font-semibold text-slate-900">
                      {report.longTermProgressSummary.observationDaysCount} Total Days
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {report.longTermProgressSummary.preMissionDaysCount} Pre-Mission ·{' '}
                    {report.longTermProgressSummary.inMissionDaysCount} In-Mission
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {report.longTermProgressSummary.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700 leading-relaxed"
                  >
                    <span className="text-sky-500 font-bold shrink-0">•</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-100/60 rounded-lg border border-slate-200/60 text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Notice:</span> ASTRA Predictive Analytics operates on statistical deviation models and empirical spaceflight physiological norms. Flagged patterns represent monitoring-level guidance rather than definitive clinical diagnoses. All telemetry should be reviewed alongside ground flight surgeon consultations.
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
export default PredictiveAnalytics;
