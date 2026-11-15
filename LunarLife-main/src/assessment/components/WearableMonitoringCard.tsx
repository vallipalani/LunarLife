import React from 'react';
import {
  Activity,
  BatteryCharging,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Zap,
  Eye,
  Thermometer,
  Moon,
  Footprints,
  Heart,
} from 'lucide-react';
import { Card, Badge } from '../../components';
import { WearableDevice, WearableReading } from '../wearableData';

interface WearableMonitoringCardProps {
  device: WearableDevice;
  readings: WearableReading[];
  isOffline: boolean;
  isRefreshing: boolean;
  isOutdated: boolean;
  onRefresh: () => void;
  onToggleConnection: () => void;
  onToggleOutdated: () => void;
}

export function WearableMonitoringCard({
  device,
  readings,
  isOffline,
  isRefreshing,
  isOutdated,
  onRefresh,
  onToggleConnection,
  onToggleOutdated,
}: WearableMonitoringCardProps) {
  return (
    <div className="bg-white rounded-xl border border-sky-200/80 shadow-subtle p-4 sm:p-5 transition-all">
      {/* 1. TOP HEADER STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isOffline
                ? 'bg-slate-100 text-slate-400'
                : 'bg-sky-50 text-sky-600 border border-sky-100'
            }`}
          >
            {isOffline ? (
              <WifiOff className="w-5 h-5" />
            ) : (
              <Radio className="w-5 h-5 animate-pulse text-sky-600" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900">{device.name}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                SIMULATED / DEMO PROTOTYPE
              </span>
              <Badge variant={isOffline ? 'neutral' : 'success'} size="sm">
                {isOffline ? 'Offline' : 'Connected (Simulated)'}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span>{device.model}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>Battery: {device.batteryLevel}%</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 inline" />
                <span>Last Sync: {device.lastSyncTimestamp}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isOffline || isRefreshing}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors ${
              isOffline
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
            title="Simulate polling a new telemetry packet from wearable"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Simulate New Sync'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleConnection}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Simulate disconnecting or reconnecting device"
          >
            {isOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Reconnect' : 'Disconnect'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleOutdated}
            className={`inline-flex items-center space-x-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
              isOutdated
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle between fresh and outdated telemetry states"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{isOutdated ? 'Outdated Mode (Active)' : 'Test Outdated'}</span>
          </button>
        </div>
      </div>

      {/* 2. OUTDATED WARNING BANNER */}
      {isOutdated && !isOffline && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Outdated Telemetry Warning:</strong> Last sync occurred &gt;30 minutes ago. Click <strong>Simulate New Sync</strong> to poll current readings, or override manually.
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 underline shrink-0 ml-3"
          >
            Refresh Now
          </button>
        </div>
      )}

      {/* 3. READINGS GRID OR OFFLINE MESSAGE */}
      {!isOffline ? (
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Available Wearable Telemetry Streams
            </span>
            <span className="text-[11px] text-sky-700 font-medium">
              ⚡ Automatically populating matching fields below
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {readings.map((reading) => {
              const isDirect = !reading.isEstimated;

              return (
                <div
                  key={reading.type}
                  className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between hover:border-sky-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="truncate font-medium">{reading.label}</span>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg font-bold text-slate-900 tracking-tight font-mono">
                        {reading.value}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {reading.unit.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/50">
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isDirect
                          ? 'bg-sky-50 text-sky-700 border border-sky-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isDirect ? 'Direct Sensor' : 'Algorithm Estimate'}
                    </span>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5" title={reading.sensorType}>
                      {reading.sensorType.split(' ')[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Direct measurement (PPG, IR Dermal, Oximetry)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Inferred estimate (Sleep architecture algorithm, Activity IMU)</span>
              </span>
            </div>
            <span className="text-slate-400 italic">
              Blood pressure requires manual cuff inflation (unsupported by optical wristband).
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <WifiOff className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <h4 className="text-xs font-bold text-slate-800">
            Wearable Telemetry Disconnected / Offline
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">
            Live wearable biometrics are currently unavailable. Health check form fields below are open for direct manual entry from clinical kit instruments.
          </p>
          <button
            type="button"
            onClick={onToggleConnection}
            className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Reconnect Simulated Wearable</span>
          </button>
        </div>
      )}
    </div>
  );
}
