import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AnomalyPoint } from '../../types/health';
import { AlertTriangle, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

export interface AnomalyAnalysisProps {
  anomalies: AnomalyPoint[];
  metricName: string;
  zThreshold: number;
}

export const AnomalyAnalysis: React.FC<AnomalyAnalysisProps> = ({
  anomalies,
  metricName,
  zThreshold,
}) => {
  return (
    <Card className="p-6 space-y-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-[#EAE6F2] pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-content-main">
            Rolling Z-Score Anomaly Screening
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="sm">THRESHOLD: |Z| ≥ {zThreshold}σ</Badge>
          <Badge variant="neutral" size="sm">PRE-OBSERVATION WINDOW k=5</Badge>
          <Badge variant="normal" size="sm">STATISTICAL SCREENING</Badge>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-content-secondary leading-relaxed font-sans">
          Screening formulation: <span className="font-mono text-primary font-bold">Z = (xₜ - μₜ₋₁) / sₜ₋₁</span>, where mean <span className="font-mono text-content-main">μₜ₋₁</span> and sample standard deviation <span className="font-mono text-content-main">sₜ₋₁</span> are derived strictly from the preceding <span className="font-mono text-content-main">k=5</span> valid observations, excluding the tested observation <span className="font-mono text-content-main">xₜ</span>.
        </p>
        <p className="text-xs text-primary leading-relaxed font-sans font-medium">
          <strong>Notice:</strong> Statistical screening exploratory tool only. Outliers indicate telemetry variance or sensor movement noise, not medical diagnoses.
        </p>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 text-xs font-mono text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>No statistical outliers detected beyond |Z| ≥ {zThreshold}σ for {metricName} across rolling baselines. Corridors nominal.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {anomalies.map((anom, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <Badge variant={anom.zScore > 0 ? 'caution' : 'priority'} size="sm">
                  {anom.type}
                </Badge>
                <span className="text-content-main font-semibold">{anom.description}</span>
              </div>
              <div className="text-content-muted text-[11px] shrink-0 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-primary-light text-primary font-bold">
                  k = {anom.rollingWindowSize} pts
                </span>
                <span>
                  Logged: {new Date(anom.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-[#EAE6F2] flex flex-wrap items-center justify-between text-[11px] font-mono text-content-muted gap-2">
        <div className="flex items-center gap-1.5 text-primary">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>STATISTICAL SCREENING ONLY: Requires k ≥ 3 prior observations. Certified clinical decisions require Flight Surgeon review.</span>
        </div>
        <div className="flex items-center gap-1 text-content-secondary">
          <Activity className="h-3 w-3" />
          <span>Downlink Stream Verified</span>
        </div>
      </div>
    </Card>
  );
};
