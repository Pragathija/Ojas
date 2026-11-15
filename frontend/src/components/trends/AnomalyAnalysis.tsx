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
    <Card className="p-6 space-y-4">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-cosmos-border pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-cosmos-accent" />
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            Rolling Z-Score Anomaly Screening
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="caution" size="sm">THRESHOLD: |Z| ≥ {zThreshold}σ</Badge>
          <Badge variant="neutral" size="sm">PRE-OBSERVATION WINDOW k=5</Badge>
          <Badge variant="priority" size="sm">EXPERIMENTAL SCREENING</Badge>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-cosmos-text-secondary leading-relaxed font-sans">
          Screening formulation: <span className="font-mono text-cosmos-text">Z = (xₜ - μₜ₋₁) / sₜ₋₁</span>, where mean <span className="font-mono text-cosmos-text">μₜ₋₁</span> and sample standard deviation <span className="font-mono text-cosmos-text">sₜ₋₁</span> are derived strictly from the preceding <span className="font-mono text-cosmos-text">k=5</span> valid observations, excluding the tested observation <span className="font-mono text-cosmos-text">xₜ</span>.
        </p>
        <p className="text-xs text-semantic-caution leading-relaxed font-sans font-medium">
          <strong>Non-Diagnostic Disclaimer:</strong> Experimental statistical screening only; not a validated clinical alert system. Outliers indicate high telemetry variance or sensor movement noise, not medical diagnoses.
        </p>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-4 rounded bg-cosmos-elevated border border-cosmos-border flex items-center gap-3 text-xs font-mono text-semantic-normal">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>No statistical outliers detected beyond |Z| ≥ {zThreshold}σ for {metricName} across rolling baselines. Corridors nominal.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {anomalies.map((anom, idx) => (
            <div
              key={idx}
              className="p-3 rounded bg-cosmos-elevated border border-cosmos-border flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <Badge variant={anom.zScore > 0 ? 'caution' : 'priority'} size="sm">
                  {anom.type}
                </Badge>
                <span className="text-cosmos-text font-semibold">{anom.description}</span>
              </div>
              <div className="text-cosmos-muted text-[11px] shrink-0 flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-cosmos-card border border-cosmos-border text-cosmos-accent">
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

      <div className="pt-2 border-t border-cosmos-border/60 flex flex-wrap items-center justify-between text-[11px] font-mono text-cosmos-muted gap-2">
        <div className="flex items-center gap-1.5 text-semantic-caution">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>STATISTICAL SCREENING ONLY: Requires k ≥ 3 prior observations; ignores observations lacking preceding baselines.</span>
        </div>
        <div className="flex items-center gap-1 text-cosmos-text-secondary">
          <Activity className="h-3 w-3" />
          <span>Synthetic Demonstration Stream</span>
        </div>
      </div>
    </Card>
  );
};
