import React from 'react';
import { Badge } from '../common/Badge';
import { BookOpen, Database, ShieldAlert, Sparkles } from 'lucide-react';
import { ResearchDatasetMeta } from '../../types/research';

export interface ResearchOverviewProps {
  datasets: ResearchDatasetMeta[];
  citationCount: number;
}

export const ResearchOverview: React.FC<ResearchOverviewProps> = ({
  datasets,
  citationCount,
}) => {
  return (
    <div className="rounded border border-cosmos-border bg-cosmos-bg-secondary p-6 space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 border-b border-cosmos-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cosmos-accent tracking-widest uppercase">
              SCIENTIFIC INTELLIGENCE & LITERATURE
            </span>
            <span className="text-cosmos-muted">•</span>
            <span className="font-mono text-xs text-cosmos-muted">NASA HRP EVIDENCE BASE</span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-bold tracking-tight text-cosmos-text">
            Explore the science behind the mission.
          </h1>
          <p className="text-sm text-cosmos-text-secondary max-w-3xl leading-relaxed">
            Investigate research observations, explore physiological patterns and understand the scientific foundations of human spaceflight health monitoring.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="accent" className="gap-1.5 py-1 px-3">
            <Database className="h-3.5 w-3.5" />
            <span>{datasets.length} REPOSITORIES INDEXED</span>
          </Badge>
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{citationCount} VERIFIED CITATIONS</span>
          </Badge>
        </div>
      </div>

      {/* Visible Provenance Distinction Banner */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <div className="flex items-center gap-1.5 text-semantic-normal font-semibold">
            <span className="h-2 w-2 rounded-full bg-semantic-normal"></span>
            <span>ORIGINAL SCIENTIFIC ARCHIVES</span>
          </div>
          <p className="text-[11px] text-cosmos-text-secondary leading-tight">
            NASA Technical Reports Server (NTRS) & published peer-reviewed human spaceflight literature.
          </p>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <div className="flex items-center gap-1.5 text-semantic-caution font-semibold">
            <ShieldAlert className="h-3.5 w-3.5 text-semantic-caution" />
            <span>SYNTHETIC DEMO SIMULATION</span>
          </div>
          <p className="text-[11px] text-cosmos-text-secondary leading-tight">
            Algorithmic telemetry matrices generated explicitly for offline platform validation.
          </p>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <div className="flex items-center gap-1.5 text-semantic-info font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-semantic-info" />
            <span>DERIVED VISUALIZATIONS</span>
          </div>
          <p className="text-[11px] text-cosmos-text-secondary leading-tight">
            Interactive distribution models & corridor benchmarks mapped to published mission parameters.
          </p>
        </div>
      </div>
    </div>
  );
};
