import React from 'react';
import { Card } from '../common/Card';
import { TrendDescriptiveStats, VitalSign } from '../../types/health';
import { Info } from 'lucide-react';

export interface TrendStatisticsProps {
  stats: TrendDescriptiveStats;
  vital: VitalSign;
}

export const TrendStatistics: React.FC<TrendStatisticsProps> = ({ stats, vital }) => {
  const hasInsufficientData = stats.count === 0;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
        <div>
          <h3 className="font-heading text-sm font-semibold tracking-wider uppercase text-cosmos-text">
            Descriptive Statistical Profile
          </h3>
          <span className="font-mono text-[10px] text-cosmos-muted block mt-0.5">
            Bessel-corrected sample metrics (s) across N = {stats.count} valid observations
          </span>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-cosmos-elevated border border-cosmos-border text-cosmos-accent">
          N = {stats.count}
        </span>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">MEAN (μ)</span>
          <div className="font-bold text-lg text-cosmos-text tabular-nums">
            {hasInsufficientData ? '—' : `${stats.mean} `}
            {!hasInsufficientData && <span className="text-[10px] text-cosmos-muted font-normal">{vital.unit}</span>}
          </div>
          <span className="text-[9px] text-cosmos-muted block">
            {hasInsufficientData ? 'Insufficient data' : 'Arithmetic sample mean'}
          </span>
        </div>

        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">MEDIAN (Q2)</span>
          <div className="font-bold text-lg text-cosmos-text tabular-nums">
            {hasInsufficientData ? '—' : `${stats.median} `}
            {!hasInsufficientData && <span className="text-[10px] text-cosmos-muted font-normal">{vital.unit}</span>}
          </div>
          <span className="text-[9px] text-cosmos-muted block">
            {hasInsufficientData ? 'Insufficient data' : '50th percentile rank'}
          </span>
        </div>

        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">RANGE (MIN / MAX)</span>
          <div className="font-bold text-sm text-cosmos-text tabular-nums pt-1">
            {hasInsufficientData ? '—' : `${stats.min} – ${stats.max}`}
          </div>
          <span className="text-[9px] text-cosmos-muted block">
            {hasInsufficientData ? 'Insufficient data' : 'Observed extremes'}
          </span>
        </div>

        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">SAMPLE STD DEV (s)</span>
          <div className="font-bold text-lg text-semantic-info tabular-nums">
            {hasInsufficientData ? '—' : stats.count === 1 ? '— (N=1)' : `±${stats.sampleStdDev} `}
            {!hasInsufficientData && stats.count > 1 && (
              <span className="text-[10px] text-cosmos-muted font-normal">{vital.unit}</span>
            )}
          </div>
          <span className="text-[9px] text-cosmos-muted block">
            {hasInsufficientData ? 'Insufficient data' : stats.count === 1 ? 'Undefined for N=1' : 'Unbiased: N - 1 divisor'}
          </span>
        </div>
      </div>

      <div className="p-2.5 rounded bg-cosmos-elevated/70 border border-cosmos-border/60 text-[10px] font-mono text-cosmos-text-secondary space-y-1">
        <div className="flex items-center gap-1.5 text-cosmos-accent font-semibold">
          <Info className="h-3 w-3" />
          <span>STATISTICAL CONVENTIONS & REFERENCE COMPARISON</span>
        </div>
        <p className="font-sans leading-relaxed text-cosmos-muted text-[11px]">
          Sample standard deviation formula: <span className="font-mono text-cosmos-text">s = √[1/(N-1) Σ(xᵢ - μ)²]</span>. Deviation from nominal midpoint compares the observed sample mean ({hasInsufficientData ? '—' : `${stats.mean} ${vital.unit}`}) against the illustrative reference band midpoint ({stats.baselineReferenceValue} {vital.unit}). Illustrative reference bands are demonstration corridors and not individualized clinical thresholds or diagnostic criteria.
        </p>
      </div>

      <div className="pt-2 border-t border-cosmos-border/60 flex flex-wrap items-center justify-between text-[11px] font-mono text-cosmos-muted">
        <span>Missingness Artifacts: {stats.missingDataPercent}%</span>
        <span>
          Deviation from Nominal Midpoint ({stats.baselineReferenceValue} {vital.unit}):{' '}
          {hasInsufficientData ? (
            <strong className="text-cosmos-muted">—</strong>
          ) : (
            <strong className={stats.baselineChangePercent >= 0 ? 'text-cosmos-accent' : 'text-semantic-info'}>
              {stats.baselineChangePercent > 0 ? `+${stats.baselineChangePercent}%` : `${stats.baselineChangePercent}%`}
            </strong>
          )}
        </span>
      </div>
    </Card>
  );
};
