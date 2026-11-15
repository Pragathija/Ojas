import React from 'react';
import { Badge } from '../common/Badge';
import { TrendingUp, ShieldAlert } from 'lucide-react';

export const TrendOverview: React.FC = () => {
  return (
    <div className="rounded border border-cosmos-border bg-cosmos-bg-secondary p-6 space-y-4">
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cosmos-accent tracking-widest uppercase">
              PHYSIOLOGICAL TREND WORKSPACE
            </span>
            <span className="text-cosmos-muted">•</span>
            <span className="font-mono text-xs text-cosmos-muted">LONGITUDINAL ADAPTATION</span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-bold tracking-tight text-cosmos-text">
            Longitudinal Health Trends
          </h1>
          <p className="text-sm text-cosmos-text-secondary max-w-3xl leading-relaxed">
            Multi-timeframe statistical analysis, baseline drift detection, and comparative telemetry workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>STATISTICAL DRIFT ENGINE</span>
          </Badge>
          <Badge variant="caution" className="gap-1.5 py-1 px-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>SYNTHETIC DEMO MODEL</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};
