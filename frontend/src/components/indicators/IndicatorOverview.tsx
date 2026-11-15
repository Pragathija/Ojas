import React from 'react';
import { Badge } from '../common/Badge';
import { Activity, ShieldAlert, Clock } from 'lucide-react';
import { VitalSign } from '../../types/health';

export interface IndicatorOverviewProps {
  vitals: VitalSign[];
}

export const IndicatorOverview: React.FC<IndicatorOverviewProps> = ({ vitals }) => {
  const totalCount = vitals.length;
  const usableCount = vitals.filter((v) => v.observationAvailability === 'Available').length;
  const syntheticCount = vitals.filter((v) => v.isSynthetic).length;

  return (
    <div className="rounded border border-cosmos-border bg-cosmos-bg-secondary p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 border-b border-cosmos-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cosmos-accent tracking-widest uppercase">
              BIOMEDICAL SENSOR LIBRARY
            </span>
            <span className="text-cosmos-muted">•</span>
            <span className="font-mono text-xs text-cosmos-muted">MISSION CORRIDORS</span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-bold tracking-tight text-cosmos-text">
            Physiological Health Indicators
          </h1>
          <p className="text-sm text-cosmos-text-secondary max-w-3xl leading-relaxed">
            Detailed inspection of continuous vital telemetry, sensor operational contexts, and data classification boundaries.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <Activity className="h-3.5 w-3.5" />
            <span>{totalCount} INDICATORS INDEXED</span>
          </Badge>
          <Badge variant="caution" className="gap-1.5 py-1 px-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{syntheticCount} SYNTHETIC STREAMS</span>
          </Badge>
        </div>
      </div>

      {/* Metric Availability Matrix */}
      <div className="grid grid-cols-1 tablet:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">INDEXED PARAMETERS</span>
          <div className="font-heading text-2xl font-bold text-cosmos-text">{totalCount}</div>
          <span className="text-[11px] text-cosmos-text-secondary">Multi-system biometrics</span>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">DEMO SERIES AVAILABILITY</span>
          <div className="font-heading text-2xl font-bold text-semantic-normal">{usableCount}/{totalCount} Demo Series</div>
          <span className="text-[11px] text-semantic-normal">Synthetic streams available</span>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">DATA CLASSIFICATION</span>
          <div className="font-heading text-2xl font-bold text-semantic-caution">100% DEMO</div>
          <span className="text-[11px] text-semantic-caution">Synthetic bio-harness stream</span>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">LATEST SIMULATED OBSERVATION</span>
          <div className="font-mono text-sm font-bold text-cosmos-text mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-cosmos-accent" />
            <span>14:32:08 UTC</span>
          </div>
          <span className="text-[11px] text-cosmos-text-secondary">Generated Habitat Stream</span>
        </div>
      </div>
    </div>
  );
};
