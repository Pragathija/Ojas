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
            {countermeasure.category.toUpperCase()}
          </Badge>
          {getClassificationBadge()}
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-content-main leading-snug">
          {countermeasure.name}
        </h3>

        {/* Indicators Addressed */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-content-muted text-[10px] uppercase font-semibold">TARGET BIOMETRICS:</span>
          {countermeasure.relevantIndicatorNames.map((name, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-lg bg-[#FAF9FF] border border-[#EAE6F2] text-[11px] text-content-secondary flex items-center gap-1 font-medium"
            >
              <Activity className="h-3 w-3 text-primary" />
              <span>{name}</span>
            </span>
          ))}
        </div>

        {/* Scientific Rationale */}
        <div className="space-y-1 text-xs">
          <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider block">
            Scientific Rationale
          </span>
          <p className="text-content-secondary leading-relaxed font-sans text-xs">
            {countermeasure.scientificRationale}
          </p>
        </div>

        {/* Evidence Scope & Context Box */}
        <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-content-main font-mono text-[10px] font-bold uppercase">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>Evidence Scope &amp; Validation Baseline</span>
          </div>
          <p className="text-content-secondary font-sans leading-relaxed text-[11px]">
            {countermeasure.evidenceScope}
          </p>
        </div>

        {/* Operational Considerations */}
        <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1 text-xs font-mono">
          <span className="text-content-muted text-[10px] uppercase block font-semibold">
            OPERATIONAL CONSIDERATIONS
          </span>
          <p className="text-content-secondary font-sans leading-relaxed text-[11px]">
            {countermeasure.operationalConsiderations}
          </p>
        </div>

        {/* Research Limitations Box */}
        <div className="p-3 rounded-xl bg-purple-50/50 border border-primary/20 space-y-1 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-primary font-mono text-[10px] font-bold uppercase">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Research Limitations &amp; Boundaries</span>
          </div>
          <p className="text-content-secondary leading-relaxed text-[11px]">
            {countermeasure.evidenceLimitations}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#EAE6F2] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-content-muted">
          <Layers className="h-3.5 w-3.5" />
          <span>{countermeasure.relatedInsightIds.length} Linked Insight Contexts</span>
        </div>

        {countermeasure.evidenceSourceId && onNavigateToResearch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToResearch(countermeasure.evidenceSourceId);
            }}
            className="flex items-center gap-1 text-primary hover:underline font-bold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>View Literature</span>
          </button>
        )}
      </div>
    </Card>
  );
};
