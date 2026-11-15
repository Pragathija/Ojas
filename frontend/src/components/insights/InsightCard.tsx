import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { HealthInsight } from '../../types/insights';
import { EvidenceStrength } from './EvidenceStrength';
import { ChevronRight, ArrowRight, Activity, ShieldAlert, Cpu } from 'lucide-react';

export interface InsightCardProps {
  insight: HealthInsight;
  isSelected?: boolean;
  onSelect?: () => void;
  onNavigateToCountermeasures?: (insightId: string) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  isSelected = false,
  onSelect,
  onNavigateToCountermeasures,
}) => {
  return (
    <Card
      interactive={Boolean(onSelect)}
      onClick={onSelect}
      className={`p-6 space-y-4 transition-all duration-200 flex flex-col justify-between rounded-2xl border ${
        isSelected
          ? 'border-primary bg-purple-50/40 shadow-soft-md ring-2 ring-primary/20'
          : 'bg-white border-[#EAE6F2] hover:border-primary/40 hover:shadow-soft'
      }`}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="purple" size="sm">
            {insight.category.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-content-muted">
            <ShieldAlert className="h-3 w-3 text-primary" />
            <span>EXPLAINABILITY MODEL</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-content-main leading-snug">
          {insight.title}
        </h3>

        {/* Indicators Involved */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-content-muted text-[10px] uppercase font-semibold">INDICATORS:</span>
          {insight.relatedIndicatorNames.map((name, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-lg bg-[#FAF9FF] border border-[#EAE6F2] text-[11px] text-content-secondary flex items-center gap-1 font-medium"
            >
              <Activity className="h-3 w-3 text-primary" />
              <span>{name}</span>
            </span>
          ))}
        </div>

        {/* 4 Analytical Blocks */}
        <div className="space-y-2 pt-2 border-t border-[#EAE6F2] text-xs font-sans">
          {/* 1. Directly Observed Pattern */}
          <div className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-0.5">
            <span className="font-mono text-[10px] font-bold text-content-muted uppercase tracking-wider block">
              1. Observed Telemetry Pattern
            </span>
            <p className="text-content-secondary leading-relaxed text-[12px]">
              {insight.observedPattern}
            </p>
          </div>

          {/* 2. Statistical Interpretation */}
          <div className="p-2.5 rounded-xl bg-purple-50/50 border border-primary/20 space-y-0.5">
            <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider block">
              2. Statistical Interpretation
            </span>
            <p className="text-content-secondary leading-relaxed text-[12px]">
              {insight.statisticalInterpretation}
            </p>
          </div>

          {/* 3. Scientific Context */}
          <div className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-0.5">
            <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              3. Spaceflight Scientific Context
            </span>
            <p className="text-content-secondary leading-relaxed text-[12px]">
              {insight.scientificContext}
            </p>
          </div>

          {/* 4. Investigation Hypothesis */}
          <div className="p-2.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-0.5">
            <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider block">
              4. Research Hypothesis
            </span>
            <p className="text-content-secondary leading-relaxed text-[12px]">
              {insight.investigationHypothesis}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-[#EAE6F2] space-y-3">
        {/* Evidence Strength Indicator */}
        <div className="flex items-center justify-between">
          <EvidenceStrength
            classification={insight.evidenceClassification}
            sourceTitle={insight.evidenceSummary}
            evidenceScope={insight.evidenceScope}
          />
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-between pt-1 text-xs font-mono">
          <div className="flex items-center gap-1 text-primary hover:underline font-bold cursor-pointer">
            <Cpu className="h-3.5 w-3.5" />
            <span>EXPLAINABILITY AUDIT</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>

          {insight.countermeasureIds.length > 0 && onNavigateToCountermeasures && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToCountermeasures(insight.id);
              }}
              className="flex items-center gap-1.5 text-content-secondary hover:text-content-main transition-colors px-2.5 py-1 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] hover:border-primary text-[11px] font-medium shadow-xs"
            >
              <span>{insight.countermeasureIds.length} Linked Countermeasures</span>
              <ArrowRight className="h-3 w-3 text-primary" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
