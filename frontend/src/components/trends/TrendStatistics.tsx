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
    <Card className="p-6 space-y-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <div className="flex items-center justify-between border-b border-[#EAE6F2] pb-3">
        <div>
          <h3 className="font-heading text-sm font-bold tracking-wider uppercase text-content-main">
            Descriptive Statistical Profile
          </h3>
          <span className="font-mono text-[10px] text-content-muted block mt-0.5">
            Bessel-corrected sample metrics (s) across N = {stats.count} valid observations
          </span>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-primary-light text-primary font-bold">
          N = {stats.count}
        </span>
      </div>

      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">MEAN (μ)</span>
          <div className="font-bold text-lg text-content-main tabular-nums">
            {hasInsufficientData ? '—' : `${stats.mean} `}
            {!hasInsufficientData && <span className="text-[10px] text-content-secondary font-normal">{vital.unit}</span>}
          </div>
          <span className="text-[9px] text-content-muted block">
            {hasInsufficientData ? 'Insufficient data' : 'Arithmetic sample mean'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">MEDIAN (Q2)</span>
          <div className="font-bold text-lg text-content-main tabular-nums">
            {hasInsufficientData ? '—' : `${stats.median} `}
            {!hasInsufficientData && <span className="text-[10px] text-content-secondary font-normal">{vital.unit}</span>}
          </div>
          <span className="text-[9px] text-content-muted block">
            {hasInsufficientData ? 'Insufficient data' : '50th percentile rank'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">RANGE (MIN / MAX)</span>
          <div className="font-bold text-sm text-content-main tabular-nums pt-1">
            {hasInsufficientData ? '—' : `${stats.min} – ${stats.max}`}
          </div>
          <span className="text-[9px] text-content-muted block">
            {hasInsufficientData ? 'Insufficient data' : 'Observed extremes'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">SAMPLE STD DEV (s)</span>
          <div className="font-bold text-lg text-primary tabular-nums">
            {hasInsufficientData ? '—' : stats.count === 1 ? '— (N=1)' : `±${stats.sampleStdDev} `}
            {!hasInsufficientData && stats.count > 1 && (
              <span className="text-[10px] text-content-secondary font-normal">{vital.unit}</span>
            )}
          </div>
          <span className="text-[9px] text-content-muted block">
            {hasInsufficientData ? 'Insufficient data' : stats.count === 1 ? 'Undefined for N=1' : 'Unbiased: N - 1 divisor'}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-purple-50/70 border border-primary/20 text-[10px] font-mono text-content-secondary space-y-1">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <Info className="h-3.5 w-3.5" />
          <span>STATISTICAL CONVENTIONS &amp; REFERENCE COMPARISON</span>
        </div>
        <p className="font-sans leading-relaxed text-content-secondary text-[11px]">
          Sample standard deviation formula: <span className="font-mono text-primary font-bold">s = √[1/(N-1) Σ(xᵢ - μ)²]</span>. Deviation from nominal midpoint compares the observed sample mean ({hasInsufficientData ? '—' : `${stats.mean} ${vital.unit}`}) against the illustrative reference band midpoint ({stats.baselineReferenceValue} {vital.unit}). Illustrative reference bands are demonstration corridors and not individualized clinical thresholds or diagnostic criteria.
        </p>
      </div>

      <div className="pt-2 border-t border-[#EAE6F2] flex flex-wrap items-center justify-between text-[11px] font-mono text-content-muted">
        <span>Missingness Artifacts: {stats.missingDataPercent}%</span>
        <span>
          Deviation from Nominal Midpoint ({stats.baselineReferenceValue} {vital.unit}):{' '}
          {hasInsufficientData ? (
            <strong className="text-content-muted">—</strong>
          ) : (
            <strong className={stats.baselineChangePercent >= 0 ? 'text-primary font-bold' : 'text-emerald-600 font-bold'}>
              {stats.baselineChangePercent > 0 ? `+${stats.baselineChangePercent}%` : `${stats.baselineChangePercent}%`}
            </strong>
          )}
        </span>
      </div>
    </Card>
  );
};
