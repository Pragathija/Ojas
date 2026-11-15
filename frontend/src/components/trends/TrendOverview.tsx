import React from 'react';
import { Badge } from '../common/Badge';
import { TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

export const TrendOverview: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#EAE6F2] bg-white p-6 shadow-soft space-y-4">
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              PHYSIOLOGICAL TREND WORKSPACE
            </span>
            <span className="text-[#EAE6F2]">•</span>
            <span className="font-mono text-xs text-content-secondary font-medium">
              LONGITUDINAL ADAPTATION
            </span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-3xl font-black tracking-tight text-content-main">
            Longitudinal Health Trends
          </h1>
          <p className="text-xs tablet:text-sm text-content-secondary max-w-3xl leading-relaxed">
            Multi-timeframe statistical analysis, baseline drift detection, and comparative telemetry workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="purple" size="sm" className="gap-1.5 py-1 px-3">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>STATISTICAL DRIFT ENGINE</span>
          </Badge>
          <Badge variant="normal" size="sm" className="gap-1.5 py-1 px-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>TELEMETRY VERIFIED</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};
