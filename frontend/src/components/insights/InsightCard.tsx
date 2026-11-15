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
      className={`p-6 space-y-4 transition-all duration-150 flex flex-col justify-between ${
        isSelected
          ? 'border-cosmos-accent bg-cosmos-elevated shadow-lg ring-1 ring-cosmos-accent/30'
          : 'hover:border-cosmos-border/80'
      }`}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="accent" size="sm">
            {insight.category.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-cosmos-muted">
            <ShieldAlert className="h-3 w-3 text-semantic-caution" />
            <span>SYNTHETIC TELEMETRY</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-cosmos-text leading-snug">
          {insight.title}
        </h3>

        {/* Indicators Involved */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-cosmos-muted text-[10px] uppercase">INDICATORS:</span>
          {insight.relatedIndicatorNames.map((name, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-cosmos-card border border-cosmos-border text-[11px] text-cosmos-text-secondary flex items-center gap-1"
            >
              <Activity className="h-3 w-3 text-cosmos-accent" />
              <span>{name}</span>
            </span>
          ))}
        </div>

        {/* 4 Analytical Blocks */}
        <div className="space-y-2 pt-2 border-t border-cosmos-border/60 text-xs font-sans">
          {/* 1. Directly Observed Pattern */}
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] font-semibold text-cosmos-muted uppercase tracking-wider block">
              1. Observed Simulated Pattern
            </span>
            <p className="text-cosmos-text-secondary leading-relaxed text-[12px]">
              {insight.observedPattern}
            </p>
          </div>

          {/* 2. Statistical Interpretation */}
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] font-semibold text-cosmos-accent uppercase tracking-wider block">
              2. Statistical Interpretation
            </span>
            <p className="text-cosmos-text-secondary leading-relaxed text-[12px]">
              {insight.statisticalInterpretation}
            </p>
          </div>

          {/* 3. Scientific Context */}
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] font-semibold text-semantic-info uppercase tracking-wider block">
              3. Spaceflight Scientific Context
            </span>
            <p className="text-cosmos-text-secondary leading-relaxed text-[12px]">
              {insight.scientificContext}
            </p>
          </div>

          {/* 4. Investigation Hypothesis */}
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] font-semibold text-semantic-normal uppercase tracking-wider block">
              4. Research Hypothesis
            </span>
            <p className="text-cosmos-text-secondary leading-relaxed text-[12px]">
              {insight.investigationHypothesis}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-cosmos-border/60 space-y-3">
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
          <div className="flex items-center gap-1 text-cosmos-accent hover:underline font-semibold cursor-pointer">
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
              className="flex items-center gap-1 text-cosmos-text-secondary hover:text-cosmos-text transition-colors px-2 py-1 rounded bg-cosmos-card border border-cosmos-border hover:border-cosmos-accent text-[11px]"
            >
              <span>{insight.countermeasureIds.length} Linked Countermeasures</span>
              <ArrowRight className="h-3 w-3 text-cosmos-accent" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
