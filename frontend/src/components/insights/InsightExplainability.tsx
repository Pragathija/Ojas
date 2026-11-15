import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { HealthInsight } from '../../types/insights';
import {
  Cpu,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  X,
  ArrowRight,
  BookOpen,
  Calculator,
} from 'lucide-react';

export interface InsightExplainabilityProps {
  insight: HealthInsight | null;
  onClose?: () => void;
  onNavigateToCountermeasures?: (insightId: string) => void;
  onNavigateToResearch?: (paperId?: string) => void;
}

export const InsightExplainability: React.FC<InsightExplainabilityProps> = ({
  insight,
  onClose,
  onNavigateToCountermeasures,
  onNavigateToResearch,
}) => {
  if (!insight) return null;

  const { explainability } = insight;
  const metrics = explainability.calculatedMetrics;

  return (
    <Card className="p-6 space-y-6 border-cosmos-accent/60 bg-cosmos-bg-secondary shadow-2xl animate-in fade-in slide-in-from-top-2">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-cosmos-border pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">EXPLAINABILITY AUDIT</Badge>
            <Badge variant={explainability.isDynamicallyCalculated ? 'normal' : 'caution'}>
              {explainability.isDynamicallyCalculated
                ? 'DYNAMICALLY CALCULATED FROM DATA'
                : 'PREDEFINED SYNTHETIC DEMONSTRATION'}
            </Badge>
            <span className="font-mono text-xs text-cosmos-muted">{insight.category}</span>
          </div>
          <h2 className="font-heading text-xl tablet:text-2xl font-bold text-cosmos-text mt-1">
            {insight.title}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-cosmos-text-secondary hover:text-cosmos-text hover:bg-cosmos-elevated"
            aria-label="Close explainability panel"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Numerical Verification Row */}
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">SAMPLE SIZE (N)</span>
          <div className="font-bold text-lg text-cosmos-text tabular-nums">
            {explainability.sampleCount} Points
          </div>
          <span className="text-[9px] text-cosmos-muted block">{explainability.observationTimeframe}</span>
        </div>

        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">SERIES SAMPLE MEAN</span>
          <div className="font-bold text-lg text-cosmos-text tabular-nums">
            {metrics.mean !== undefined ? metrics.mean : '—'}
          </div>
          <span className="text-[9px] text-cosmos-muted block">Arithmetic sample mean</span>
        </div>

        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">OLS REGRESSION SLOPE</span>
          <div className="font-bold text-lg text-cosmos-accent tabular-nums">
            {metrics.olsSlope !== undefined
              ? `${metrics.olsSlope > 0 ? '+' : ''}${metrics.olsSlope} `
              : '— '}
            <span className="text-[10px] text-cosmos-muted font-normal">
              {metrics.olsSlopeUnit || ''}
            </span>
          </div>
          <span className="text-[9px] text-cosmos-muted block">Ordinary Least Squares</span>
        </div>

        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">MIDPOINT DEVIATION</span>
          <div className="font-bold text-lg text-semantic-info tabular-nums">
            {metrics.deviationFromMidpointPercent !== undefined
              ? `${metrics.deviationFromMidpointPercent > 0 ? '+' : ''}${metrics.deviationFromMidpointPercent}%`
              : '—'}
          </div>
          <span className="text-[9px] text-cosmos-muted block">Relative to reference midpoint</span>
        </div>
      </div>

      {/* Grid: 2 Core Explainability Pillars */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 text-xs font-mono">
        {/* Why the Insight was generated */}
        <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-2">
          <div className="flex items-center gap-2 text-cosmos-accent font-semibold uppercase">
            <Cpu className="h-4 w-4" />
            <span>Why Insight Was Triggered</span>
          </div>
          <p className="text-cosmos-text leading-relaxed font-sans text-xs">
            {explainability.triggerRationale}
          </p>
        </div>

        {/* Statistical Method Applied */}
        <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-2">
          <div className="flex items-center gap-2 text-semantic-info font-semibold uppercase">
            <HelpCircle className="h-4 w-4" />
            <span>Statistical Screening Method</span>
          </div>
          <p className="text-cosmos-text leading-relaxed font-sans text-xs">
            {explainability.statisticalMethodApplied}
          </p>
          <span className="text-[10px] text-cosmos-muted block">
            Corridor verification: {metrics.corridorStatus || 'Corridor active'}
          </span>
        </div>
      </div>

      {/* Observations Evaluated */}
      <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold text-cosmos-muted uppercase tracking-wider block">
            Underlying Observations Evaluated
          </span>
          <span className="font-mono text-[10px] text-cosmos-accent flex items-center gap-1">
            <Calculator className="h-3 w-3" />
            <span>N = {explainability.sampleCount} Observations</span>
          </span>
        </div>
        <ul className="space-y-1.5 text-xs font-mono text-cosmos-text-secondary">
          {explainability.underlyingObservations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cosmos-accent shrink-0 mt-1.5" />
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Alternative Explanations & System Non-Conclusions */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 text-xs font-sans">
        {/* Alternative Explanations (Hypotheses) */}
        <div className="p-4 rounded bg-cosmos-elevated border border-cosmos-border space-y-2">
          <div className="flex items-center gap-2 text-cosmos-text font-mono font-semibold uppercase text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-cosmos-accent" />
            <span>Plausible Alternative Explanations (Hypotheses)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-cosmos-text-secondary list-disc pl-4 leading-relaxed">
            {explainability.alternativeExplanations.map((alt, i) => (
              <li key={i}>{alt}</li>
            ))}
          </ul>
        </div>

        {/* What the System Cannot Conclude */}
        <div className="p-4 rounded bg-cosmos-elevated border border-cosmos-border space-y-2">
          <div className="flex items-center gap-2 text-semantic-caution font-mono font-semibold uppercase text-xs">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>What the System Cannot Conclude</span>
          </div>
          <ul className="space-y-1.5 text-xs text-cosmos-text-secondary list-disc pl-4 leading-relaxed">
            {explainability.systemBoundariesAndUncertainties.map((unc, i) => (
              <li key={i}>{unc}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Evidence Scope & Context Box */}
      <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1.5 text-xs font-sans">
        <div className="flex items-center gap-2 text-cosmos-text font-mono text-xs font-semibold uppercase">
          <BookOpen className="h-3.5 w-3.5 text-cosmos-accent" />
          <span>Scientific Evidence Scope & Citation Context</span>
        </div>
        <p className="text-cosmos-text-secondary leading-relaxed">
          {insight.evidenceScope}
        </p>
      </div>

      {/* Educational & Scientific Disclaimer Box */}
      <div className="p-3.5 rounded bg-cosmos-card/80 border border-cosmos-border/80 text-xs font-sans text-cosmos-muted leading-relaxed">
        <strong>Explainability Rule:</strong> All inferences are computed from synthetic prototype matrices and reference model equations. This demonstration explores spaceflight health monitoring logic and <em>does not establish medical diagnoses in an actual astronaut</em>.
      </div>

      {/* Navigation Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-cosmos-border">
        {insight.countermeasureIds.length > 0 && onNavigateToCountermeasures && (
          <Button
            size="sm"
            onClick={() => onNavigateToCountermeasures(insight.id)}
            className="gap-2 font-mono text-xs"
          >
            <span>EXPLORE {insight.countermeasureIds.length} RELATED COUNTERMEASURES</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}

        {insight.evidenceSourceId && onNavigateToResearch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToResearch(insight.evidenceSourceId)}
            className="gap-2 font-mono text-xs"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>VIEW SUPPORTING NASA/PEER RESEARCH</span>
          </Button>
        )}
      </div>
    </Card>
  );
};
