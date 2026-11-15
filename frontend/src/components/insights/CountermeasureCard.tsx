import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CountermeasureResearch } from '../../types/insights';
import { Activity, BookOpen, ShieldAlert, Layers, CheckCircle2 } from 'lucide-react';

export interface CountermeasureCardProps {
  countermeasure: CountermeasureResearch;
  isSelected?: boolean;
  onSelect?: () => void;
  onNavigateToResearch?: (paperId?: string) => void;
}

export const CountermeasureCard: React.FC<CountermeasureCardProps> = ({
  countermeasure,
  isSelected = false,
  onSelect,
  onNavigateToResearch,
}) => {
  const getClassificationBadge = () => {
    switch (countermeasure.classification) {
      case 'Established Operational Countermeasure':
        return <Badge variant="normal" size="sm">ESTABLISHED OPERATIONAL</Badge>;
      case 'Research-Supported Intervention':
        return <Badge variant="accent" size="sm">RESEARCH-SUPPORTED</Badge>;
      case 'Experimental Research Concept':
        return <Badge variant="caution" size="sm">EXPERIMENTAL CONCEPT</Badge>;
      case 'Monitoring & Measurement Technology':
        return <Badge variant="neutral" size="sm">MONITORING TECHNOLOGY</Badge>;
      case 'Environmental Protection & Engineering Strategy':
        return <Badge variant="neutral" size="sm">ENGINEERING STRATEGY</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{countermeasure.classification}</Badge>;
    }
  };

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
            {countermeasure.category.toUpperCase()}
          </Badge>
          {getClassificationBadge()}
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-cosmos-text leading-snug">
          {countermeasure.name}
        </h3>

        {/* Indicators Addressed */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-cosmos-muted text-[10px] uppercase">TARGET BIOMETRICS:</span>
          {countermeasure.relevantIndicatorNames.map((name, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-cosmos-card border border-cosmos-border text-[11px] text-cosmos-text-secondary flex items-center gap-1"
            >
              <Activity className="h-3 w-3 text-cosmos-accent" />
              <span>{name}</span>
            </span>
          ))}
        </div>

        {/* Scientific Rationale */}
        <div className="space-y-1 text-xs">
          <span className="font-mono text-[10px] font-semibold text-cosmos-accent uppercase tracking-wider block">
            Scientific Rationale
          </span>
          <p className="text-cosmos-text-secondary leading-relaxed font-sans text-xs">
            {countermeasure.scientificRationale}
          </p>
        </div>

        {/* Evidence Scope & Context Box */}
        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-cosmos-text font-mono text-[10px] font-semibold uppercase">
            <CheckCircle2 className="h-3 w-3 text-cosmos-accent" />
            <span>Evidence Scope & Validation Baseline</span>
          </div>
          <p className="text-cosmos-text-secondary font-sans leading-relaxed text-[11px]">
            {countermeasure.evidenceScope}
          </p>
        </div>

        {/* Operational Considerations */}
        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border/70 space-y-1 text-xs font-mono">
          <span className="text-cosmos-muted text-[10px] uppercase block">
            OPERATIONAL CONSIDERATIONS
          </span>
          <p className="text-cosmos-text-secondary font-sans leading-relaxed text-[11px]">
            {countermeasure.operationalConsiderations}
          </p>
        </div>

        {/* Research Limitations Box */}
        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border space-y-1 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-semantic-caution font-mono text-[10px] font-semibold uppercase">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Research Limitations & Boundaries</span>
          </div>
          <p className="text-cosmos-muted leading-relaxed text-[11px]">
            {countermeasure.evidenceLimitations}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-cosmos-border/60 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cosmos-muted">
          <Layers className="h-3.5 w-3.5" />
          <span>{countermeasure.relatedInsightIds.length} Linked Insight Contexts</span>
        </div>

        {countermeasure.evidenceSourceId && onNavigateToResearch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToResearch(countermeasure.evidenceSourceId);
            }}
            className="flex items-center gap-1 text-cosmos-accent hover:underline font-semibold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>View Literature</span>
          </button>
        )}
      </div>
    </Card>
  );
};
