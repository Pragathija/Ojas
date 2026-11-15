import React from 'react';
import { Badge } from '../common/Badge';
import { Lightbulb, ShieldAlert, Clock, Sparkles } from 'lucide-react';

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
    <div className="rounded-2xl border border-[#EAE6F2] bg-white p-6 tablet:p-8 space-y-6 shadow-soft">
      {/* Header */}
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 border-b border-[#EAE6F2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              EXPLAINABLE MISSION INTELLIGENCE
            </span>
            <span className="text-[#EAE6F2]">•</span>
            <span className="font-mono text-xs text-content-secondary">
              COUNTERMEASURE RESEARCH
            </span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-extrabold tracking-tight text-content-main">
            Mission Insights & Countermeasure Intelligence
          </h1>
          <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
            Explainable research surveillance connecting observed telemetry patterns, statistical anomaly detections, and verified spaceflight countermeasure literature.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="purple" className="gap-1.5 py-1 px-3">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <span>{totalCount} RESEARCH INSIGHTS</span>
          </Badge>
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>EVIDENCE VERIFIED</span>
          </Badge>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 tablet:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">SIMULATED INSIGHTS</span>
          <div className="font-heading text-2xl font-bold text-content-main">{totalCount} Generated</div>
          <span className="text-[11px] text-content-secondary">Across 6 research domains</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">EVIDENCE-LINKED COUNT</span>
          <div className="font-heading text-2xl font-bold text-primary">{evidenceLinkedCount}/{totalCount}</div>
          <span className="text-[11px] text-content-secondary">Supported by NASA/peer literature</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">DATA PROVENANCE MODE</span>
          <div className="font-heading text-2xl font-bold text-emerald-700">Validated Stream</div>
          <span className="text-[11px] text-emerald-600 font-medium">{syntheticCount} demonstration streams</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">LATEST SIMULATED RUN</span>
          <div className="font-mono text-sm font-bold text-content-main mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>{new Date(lastSimulatedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
          <span className="text-[11px] text-content-secondary">Simulated Mission Day 142</span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-xl bg-purple-50/60 border border-primary/20 flex items-start gap-3 text-xs">
        <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-content-main uppercase block">
            Research &amp; Educational Platform Notice
          </span>
          <p className="text-content-secondary leading-relaxed font-sans">
            OJAS generates explainable pattern observations for aerospace medical researchers and students. It does <strong>not</strong> produce autonomous medical diagnoses, clinical alert triage, or personalized therapeutic prescriptions. Observed patterns evaluate synthetic streams; they do not establish health conditions in actual astronauts.
          </p>
        </div>
      </div>
    </div>
  );
};
