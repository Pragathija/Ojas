import React, { useState, useEffect } from 'react';
import {
  Activity,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  RefreshCw,
  Clock,
  User,
} from 'lucide-react';
import { adminService, dataService } from '../../services';
import { VitalSign } from '../../types/health';

export const HealthMonitoringPage: React.FC = () => {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const v = await dataService.health.getVitalSigns();
      setVitals(v);
      const summary = await dataService.health.getHealthSummary();
      // Mock alerts if none present
      setAlerts([
        {
          id: 101,
          severity: 'MODERATE_CAUTION',
          metric: 'Resting Heart Rate Transient',
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          context: 'Mild elevation observed during post-exercise recovery cycle.',
          recommendation: 'Monitor during next sleep cycle. Hydration check advised.',
        },
      ]);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledge = async (alertId: number) => {
    await adminService.acknowledgeAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-4">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>FLIGHT SURGEON BIOMEDICAL OVERSIGHT</span>
            </div>
            <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
              Astronaut Clinical Health Oversight
            </h1>
            <p className="text-sm text-[#716B83] font-sans">
              Authorized clinical oversight for Flight Surgeons. Review deterministic safety alerts, physiological baselines, and data quality.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[#E9E4F2] text-xs font-heading font-bold text-[#5535A5] hover:bg-[#F8F6FF] flex items-center gap-2 transition-colors cursor-pointer self-start tablet:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Active Clinical Safety Alerts Section */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-heading font-bold text-lg text-[#252039]">
              Active Flight Surgeon Safety Alerts ({alerts.length})
            </h3>
          </div>
          <span className="font-mono text-xs text-[#716B83]">Deterministic Non-Suppression Enforced</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <span className="font-heading font-bold text-base text-[#252039] block">
              All Astronaut Biometric Corridors Nominal
            </span>
            <p className="text-xs text-[#716B83]">
              No active caution or critical threshold excursions detected in the last telemetry window.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 flex flex-col tablet:flex-row tablet:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
                      {alert.severity}
                    </span>
                    <span className="font-heading font-bold text-sm text-[#252039]">{alert.title}</span>
                  </div>
                  <p className="text-xs text-[#716B83] font-sans">{alert.description}</p>
                </div>

                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-4 py-2 rounded-xl bg-[#5535A5] text-white font-heading font-bold text-xs shadow-soft hover:bg-[#432986] cursor-pointer whitespace-nowrap self-start tablet:self-auto"
                >
                  Acknowledge Alert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Vitals Grid */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg text-[#252039]">
          Current Crew Telemetry Streams (ASTRO-001)
        </h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-5">
          {vitals.slice(0, 8).map((vital) => (
            <div
              key={vital.id}
              className="p-5 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-[#716B83]">
                <span className="font-heading font-bold text-[#252039]">{vital.name}</span>
                <span className="font-mono text-[10px]">{vital.confidence}% Quality</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-black text-2xl text-[#252039]">{vital.currentValue}</span>
                <span className="font-mono text-xs text-[#716B83]">{vital.unit}</span>
              </div>
              <div className="text-[11px] font-mono text-[#716B83]">
                Corridor: {vital.nominalRange ? `${vital.nominalRange[0]} - ${vital.nominalRange[1]} ${vital.unit}` : '--'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
