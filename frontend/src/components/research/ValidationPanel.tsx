import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertCircle, FileText, Info } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  return (
    <Card className="p-6 space-y-5 bg-cosmos-card border-cosmos-border">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-cosmos-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cosmos-accent" />
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            Statistical Anomaly Detection & Methodological Scope
          </h3>
        </div>
        <Badge variant="caution" size="sm">PROPOSED OJAS METHODOLOGY</Badge>
      </div>

      <p className="text-xs text-cosmos-text-secondary leading-relaxed">
        OJAS implements statistical drift detection algorithms designed to track physiological variance in spaceflight.
        It is critical to distinguish proposed algorithmic anomaly detection from certified medical diagnostics.
      </p>

      {/* Grid of Methodological Constraints */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <div className="flex items-center gap-1.5 text-cosmos-text font-semibold uppercase">
            <Info className="h-3.5 w-3.5 text-cosmos-accent" />
            <span>Statistical ±2σ Baseline Corridor</span>
          </div>
          <p className="text-[11px] text-cosmos-text-secondary leading-relaxed font-sans">
            <strong className="text-cosmos-text font-mono">Status: Proposed Methodology.</strong> Terrestrial baselines define statistical normal distributions ($\mu \pm 2\sigma$). Values exceeding $2\sigma$ indicate statistical drift, not certified clinical pathologies.
          </p>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <div className="flex items-center gap-1.5 text-cosmos-text font-semibold uppercase">
            <AlertCircle className="h-3.5 w-3.5 text-semantic-caution" />
            <span>Sensor Artifacts & Confidence</span>
          </div>
          <p className="text-[11px] text-cosmos-text-secondary leading-relaxed font-sans">
            <strong className="text-cosmos-text font-mono">Status: Proposed Methodology.</strong> Bio-harness movement and microgravity displacement cause motion artifacts. Quality confidence scores (0–100%) filter non-physiological spikes before trend computation.
          </p>
        </div>

        <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
          <div className="flex items-center gap-1.5 text-cosmos-text font-semibold uppercase">
            <AlertCircle className="h-3.5 w-3.5 text-semantic-priority" />
            <span>Clinical Scope Boundary</span>
          </div>
          <p className="text-[11px] text-cosmos-text-secondary leading-relaxed font-sans">
            <strong className="text-cosmos-text font-mono">Status: Non-Diagnostic Constraint.</strong> OJAS is a challenge research and decision-support prototype. It does not provide certified medical diagnoses or replace flight surgeon protocols.
          </p>
        </div>
      </div>
    </Card>
  );
};
