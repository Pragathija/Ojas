import React from 'react';
import { Badge } from '../common/Badge';
import { Lightbulb, ShieldAlert, Clock } from 'lucide-react';

export interface InsightOverviewProps {
  totalCount: number;
  syntheticCount: number;
  evidenceLinkedCount: number;
  lastSimulatedTimestamp: string;
}

export const InsightOverview: React.FC<InsightOverviewProps> = ({
  totalCount,
  syntheticCount,
  evidenceLinkedCount,
  lastSimulatedTimestamp,
}) => {
  return (
    <div className="rounded border border-cosmos-border bg-cosmos-bg-secondary p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 border-b border-cosmos-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cosmos-accent tracking-widest uppercase">
              EXPLAINABLE MISSION INTELLIGENCE
            </span>
            <span className="text-cosmos-muted">•</span>
            <span className="font-mono text-xs text-cosmos-muted">COUNTERMEASURE RESEARCH</span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-bold tracking-tight text-cosmos-text">
            Mission Insights & Countermeasure Intelligence
          </h1>
          <p className="text-sm text-cosmos-text-secondary max-w-3xl leading-relaxed">
            Explainable research surveillance connecting observed telemetry patterns, statistical anomaly detections, and verified spaceflight countermeasure literature.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>{totalCount} RESEARCH INSIGHTS</span>
          </Badge>
          <Badge variant="caution" className="gap-1.5 py-1 px-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>100% SYNTHETIC TELEMETRY</span>
          </Badge>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 tablet:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">SIMULATED INSIGHTS</span>
          <div className="font-heading text-2xl font-bold text-cosmos-text">{totalCount} Generated</div>
          <span className="text-[11px] text-cosmos-text-secondary">Across 6 research domains</span>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">EVIDENCE-LINKED COUNT</span>
          <div className="font-heading text-2xl font-bold text-cosmos-accent">{evidenceLinkedCount}/{totalCount}</div>
          <span className="text-[11px] text-cosmos-accent">Supported by NASA/peer literature</span>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">DATA PROVENANCE MODE</span>
          <div className="font-heading text-2xl font-bold text-semantic-caution">Synthetic Matrix</div>
          <span className="text-[11px] text-semantic-caution">{syntheticCount} demonstration streams</span>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">LATEST SIMULATED RUN</span>
          <div className="font-mono text-sm font-bold text-cosmos-text mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-cosmos-accent" />
            <span>{new Date(lastSimulatedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
          <span className="text-[11px] text-cosmos-text-secondary">Simulated Mission Day 142</span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 rounded bg-cosmos-card border border-cosmos-border flex items-start gap-3 text-xs">
        <ShieldAlert className="h-4 w-4 text-semantic-caution shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono font-semibold text-cosmos-text uppercase block">
            Research & Educational Platform Notice
          </span>
          <p className="text-cosmos-text-secondary leading-relaxed font-sans">
            OJAS generates explainable pattern observations for aerospace medical researchers and students. It does <strong>not</strong> produce autonomous medical diagnoses, clinical alert triage, or personalized therapeutic prescriptions. Observed patterns evaluate synthetic streams; they do not establish health conditions in actual astronauts.
          </p>
        </div>
      </div>
    </div>
  );
};
