import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Radio,
  SlidersHorizontal,
  BellRing,
  Monitor,
  Check,
  RefreshCw,
  Shield,
  Smartphone,
} from 'lucide-react';
import { Card, Badge, PageHeader } from '../components';
import { AstronautProfile } from '../types';

interface SettingsProps {
  astronaut: AstronautProfile;
  onResetAllData: () => void;
}

export function Settings({ astronaut, onResetAllData }: SettingsProps) {
  const [sensors, setSensors] = useState({
    smartPatch: true,
    cardiacBand: true,
    sleepMat: true,
    tempPill: false,
  });

  const [alerts, setAlerts] = useState({
    vitalAlerts: true,
    circadianReminders: true,
    protocolPrompts: true,
    groundMedicalSync: true,
  });

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    onResetAllData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Configuration"
        title="Settings"
        description="Manage application telemetry connections, mission clock parameters, and biometric notification thresholds."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Mission Parameters */}
        <Card title="Mission Telemetry Parameters" subtitle="Flight designation and orbital synchronization">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800">Mission Designation</span>
                <p className="text-[11px] text-slate-400">Deep Space Gateway & Orbital Transit</p>
              </div>
              <Badge variant="neutral" size="md">
                {astronaut.mission}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800">Elapsed Flight Duration</span>
                <p className="text-[11px] text-slate-400">Orbital reference timestamp</p>
              </div>
              <Badge variant="blue" size="md">
                {astronaut.missionDay}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800">Telemetry Feed Status</span>
                <p className="text-[11px] text-slate-400">Direct-to-ground S-band radio</p>
              </div>
              <Badge variant="success" size="sm">
                Connected (Online)
              </Badge>
            </div>
          </div>
        </Card>

        {/* 2. Biometric Sensor Pairing */}
        <Card title="Biometric Sensor Sync" subtitle="Wearable telemetry sensors paired with local cabin node">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800">Dermal Biosensing Smart Patch</span>
                <p className="text-[11px] text-slate-400">Continuous non-invasive cardiac & SpO2</p>
              </div>
              <button
                onClick={() => setSensors({ ...sensors, smartPatch: !sensors.smartPatch })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sensors.smartPatch ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {sensors.smartPatch ? 'Connected' : 'Disconnected'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800">Chest Electrocardiogram Band</span>
                <p className="text-[11px] text-slate-400">High-fidelity 3-lead arrhythmia monitoring</p>
              </div>
              <button
                onClick={() => setSensors({ ...sensors, cardiacBand: !sensors.cardiacBand })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sensors.cardiacBand ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {sensors.cardiacBand ? 'Connected' : 'Disconnected'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-800">Sleep Pod Ballistocardiograph</span>
                <p className="text-[11px] text-slate-400">Under-mattress micro-movement sleep sensor</p>
              </div>
              <button
                onClick={() => setSensors({ ...sensors, sleepMat: !sensors.sleepMat })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sensors.sleepMat ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {sensors.sleepMat ? 'Connected' : 'Disconnected'}
              </button>
            </div>
          </div>
        </Card>

        {/* 3. Notification Preferences */}
        <Card title="Alert & Notification Preferences" subtitle="Audio/visual prompt configuration">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Vital Threshold Warnings</span>
              <input
                type="checkbox"
                checked={alerts.vitalAlerts}
                onChange={() => setAlerts({ ...alerts, vitalAlerts: !alerts.vitalAlerts })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Circadian Dimming Audio Chimes</span>
              <input
                type="checkbox"
                checked={alerts.circadianReminders}
                onChange={() => setAlerts({ ...alerts, circadianReminders: !alerts.circadianReminders })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">Countermeasure Task Prompts</span>
              <input
                type="checkbox"
                checked={alerts.protocolPrompts}
                onChange={() => setAlerts({ ...alerts, protocolPrompts: !alerts.protocolPrompts })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
            </label>
          </div>
        </Card>

        {/* 4. Display System & Reset */}
        <Card title="Interface & System Reset" subtitle="Visual aesthetic & demo data management">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-800">Active Design System</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Soft Blue & Warm White Minimalist Healthcare Dashboard.
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-[#FAFBFD] border border-slate-300" title="Warm White" />
                <span className="w-4 h-4 rounded-full bg-sky-600 border border-sky-700" title="Soft Blue" />
                <span className="text-[11px] text-slate-600 font-medium">Nominal Theme</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State to Initial Defaults</span>
              </button>
              {resetSuccess && (
                <div className="text-xs text-emerald-600 text-center mt-2 font-medium flex items-center justify-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>State successfully reset to mission day 124 baseline</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
