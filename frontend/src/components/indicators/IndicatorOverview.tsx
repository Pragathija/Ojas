import React from 'react';
import { Badge } from '../common/Badge';
import { Activity, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { VitalSign } from '../../types/health';

export interface IndicatorOverviewProps {
  vitals: VitalSign[];
}

export const IndicatorOverview: React.FC<IndicatorOverviewProps> = ({ vitals }) => {
  const totalCount = vitals.length;
  const usableCount = vitals.filter((v) => v.observationAvailability === 'Available').length;
  const syntheticCount = vitals.filter((v) => v.isSynthetic).length;

  return (
    <div className="rounded-2xl border border-[#EAE6F2] bg-white p-6 tablet:p-8 space-y-6 shadow-soft">
      {/* Header */}
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 border-b border-[#EAE6F2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">
              BIOMEDICAL SENSOR ARRAY • 100 HZ DOWNLINK
            </span>
            <span className="text-[#EAE6F2]">•</span>
            <span className="font-mono text-xs text-content-secondary">AUTONOMOUS MONITORING</span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-extrabold tracking-tight text-content-main">
            Physiological Health Indicators
          </h1>
          <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
            Detailed telemetry inspection across cardiovascular, respiratory, circadian, and environmental sensor streams with personal baseline corridors.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="purple" className="gap-1.5 py-1 px-3">
            <Activity className="h-3.5 w-3.5" />
            <span>{totalCount} SENSORS INDEXED</span>
          </Badge>
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>CORRIDORS NOMINAL</span>
          </Badge>
        </div>
      </div>

      {/* Metric Availability Matrix */}
      <div className="grid grid-cols-1 tablet:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">INDEXED PARAMETERS</span>
          <div className="font-heading text-2xl font-black text-content-main">{totalCount} Streams</div>
          <span className="text-[11px] text-content-secondary">Multi-system biometrics</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">STREAM FIDELITY</span>
          <div className="font-heading text-2xl font-black text-emerald-600">{usableCount}/{totalCount} Available</div>
          <span className="text-[11px] text-emerald-600 font-sans">100 Hz continuous link</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">DATA CLASSIFICATION</span>
          <div className="font-heading text-2xl font-black text-primary">HABITAT SIM</div>
          <span className="text-[11px] text-primary font-sans">Continuous bio-harness</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">TELEMETRY TIMECODE</span>
          <div className="font-mono text-base font-bold text-content-main mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>14:32:08 UTC</span>
          </div>
          <span className="text-[11px] text-content-secondary">Gateway Habitat Stream</span>
        </div>
      </div>
    </div>
  );
};