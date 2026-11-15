import React, { useState } from 'react';
import {
  User,
  Shield,
  Heart,
  Thermometer,
  Moon,
  Smile,
  Activity,
  FileCheck2,
  Edit3,
  X,
  Check,
  Award,
  AlertCircle,
  Pill,
} from 'lucide-react';
import { Card, Badge, PageHeader } from '../components';
import { AstronautProfile } from '../types';

interface PersonalHealthProps {
  astronaut: AstronautProfile;
  onUpdateProfile: (updated: Partial<AstronautProfile>) => void;
}

export function PersonalHealth({ astronaut, onUpdateProfile }: PersonalHealthProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Local form state for editing
  const [formData, setFormData] = useState({
    name: astronaut.name,
    astronautId: astronaut.astronautId,
    role: astronaut.role,
    age: astronaut.age,
    bloodGroup: astronaut.bloodGroup,
    height: astronaut.height,
    weight: astronaut.weight,
    allergies: astronaut.allergies.join(', '),
    medications: astronaut.medications.join('; '),
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: formData.name,
      astronautId: formData.astronautId,
      role: formData.role,
      age: Number(formData.age),
      bloodGroup: formData.bloodGroup,
      height: formData.height,
      weight: formData.weight,
      allergies: formData.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      medications: formData.medications.split(';').map((s) => s.trim()).filter(Boolean),
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        category="Personalised Health Profile"
        title="Personal Health Information"
        description="Comprehensive astronaut medical record, physiological terrestrial baselines, and certified flight clearance."
        action={
          <button
            onClick={() => {
              setFormData({
                name: astronaut.name,
                astronautId: astronaut.astronautId,
                role: astronaut.role,
                age: astronaut.age,
                bloodGroup: astronaut.bloodGroup,
                height: astronaut.height,
                weight: astronaut.weight,
                allergies: astronaut.allergies.join(', '),
                medications: astronaut.medications.join('; '),
              });
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        }
      />

      {/* 1. PERSONAL DETAILS CARD */}
      <Card title="Astronaut Identification & Flight Credentials">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar and Badges */}
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={astronaut.avatarUrl}
                alt={astronaut.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-slate-600">AM</span>
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900">{astronaut.name}</h3>
                <Badge variant="blue" size="sm">
                  Active Crew
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{astronaut.role}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs font-mono font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {astronaut.astronautId}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{astronaut.mission}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 md:border-l md:border-slate-100 md:pl-6">
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase">Age</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{astronaut.age} yrs</div>
            </div>
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase">Blood Group</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{astronaut.bloodGroup}</div>
            </div>
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase">Height</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{astronaut.height}</div>
            </div>
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              <div className="text-[11px] font-medium text-slate-400 uppercase">Weight</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{astronaut.weight}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. HEALTH BASELINES (5 Baseline Pillars) */}
      <Card
        title="Physiological Health Baselines"
        subtitle="Individual terrestrial baseline measurements established during pre-mission clinical screening"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Resting Heart Rate */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-sky-600 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-700">Resting Heart Rate</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{astronaut.baselineHeartRate}</div>
            <p className="text-[11px] text-slate-400 mt-1">Calibrated at rest (supine)</p>
          </div>

          {/* Blood Pressure */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-sky-600 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-700">Blood Pressure</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{astronaut.baselineBloodPressure}</div>
            <p className="text-[11px] text-slate-400 mt-1">Systolic / Diastolic target</p>
          </div>

          {/* Body Temperature */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-sky-600 mb-2">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-700">Body Temperature</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{astronaut.baselineBodyTemp}</div>
            <p className="text-[11px] text-slate-400 mt-1">Core normothermic band</p>
          </div>

          {/* Average Sleep */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-sky-600 mb-2">
              <Moon className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-700">Average Sleep</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{astronaut.baselineSleep}</div>
            <p className="text-[11px] text-slate-400 mt-1">8.0 hours / circadian cycle</p>
          </div>

          {/* Baseline Mood */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-sky-600 mb-2">
              <Smile className="w-4 h-4" />
              <span className="text-xs font-semibold text-slate-700">Baseline Mood</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{astronaut.baselineMood}</div>
            <p className="text-[11px] text-slate-400 mt-1">Psychological resilience nominal</p>
          </div>
        </div>
      </Card>

      {/* 3. MEDICAL HISTORY & CURRENT MEDICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Existing Conditions */}
        <Card title="Medical History" subtitle="Documented clinical history">
          <ul className="space-y-2.5">
            {astronaut.existingConditions.map((cond, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                <FileCheck2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{cond}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Allergies & Sensitivities */}
        <Card title="Allergies & Sensitivities" subtitle="Pharmaceutical & environmental">
          <ul className="space-y-2.5">
            {astronaut.allergies.map((allergy, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{allergy}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Current Medications & Supplements */}
        <Card title="Active Medications" subtitle="Daily countermeasures">
          <ul className="space-y-2.5">
            {astronaut.medications.map((med, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                <Pill className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{med}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 4. PRE-MISSION ASSESSMENT */}
      <Card
        title="Pre-Mission Health Assessment Summary"
        subtitle="Final medical flight readiness certification by Johnson Space Center Aerospace Medicine Division"
      >
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700 shrink-0">
            <Award className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-slate-900">
                Class-I Flight Certification (ORION-07 Flight Clearance)
              </h4>
              <Badge variant="success" size="sm">
                Certified
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {astronaut.preMissionSummary}
            </p>
          </div>
        </div>
      </Card>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-card border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-semibold text-slate-900">Edit Astronaut Information</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Astronaut ID</label>
                  <input
                    type="text"
                    value={formData.astronautId}
                    onChange={(e) => setFormData({ ...formData, astronautId: e.target.value })}
                    className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Flight Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Blood Group</label>
                  <input
                    type="text"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Current Medications (semicolon-separated)
                </label>
                <input
                  type="text"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  className="mt-1 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
