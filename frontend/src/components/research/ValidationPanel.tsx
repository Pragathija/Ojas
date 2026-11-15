import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertCircle, FileText, Info } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  return (
    <Card className="p-6 tablet:p-8 space-y-5 bg-white border-[#EAE6F2] rounded-2xl shadow-soft">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-[#EAE6F2] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-content-main">
            Statistical Anomaly Detection & Methodological Scope
          </h3>
        </div>
        <Badge variant="purple" size="sm">OJAS RESEARCH METHODOLOGY</Badge>
      </div>

      <p className="text-xs text-content-secondary leading-relaxed">
        OJAS implements statistical drift detection algorithms designed to track physiological variance in spaceflight.
        It is critical to distinguish proposed algorithmic anomaly detection from certified medical diagnostics.
      </p>

      {/* Grid of Methodological Constraints */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <div className="flex items-center gap-1.5 text-content-main font-semibold uppercase">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Statistical ±2σ Baseline Corridor</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed font-sans">
            <strong className="text-content-main font-mono">Status: Algorithmic Model.</strong> Terrestrial baselines define statistical normal distributions ($\mu \pm 2\sigma$). Values exceeding $2\sigma$ indicate statistical drift, not certified clinical pathologies.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <div className="flex items-center gap-1.5 text-content-main font-semibold uppercase">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
            <span>Sensor Artifacts & Confidence</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed font-sans">
            <strong className="text-content-main font-mono">Status: Signal Preprocessing.</strong> Bio-harness movement and microgravity displacement cause motion artifacts. Quality confidence scores (0–100%) filter non-physiological spikes before trend computation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <div className="flex items-center gap-1.5 text-content-main font-semibold uppercase">
            <AlertCircle className="h-3.5 w-3.5 text-emerald-700" />
            <span>Clinical Scope Boundary</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed font-sans">
            <strong className="text-content-main font-mono">Status: Non-Diagnostic Constraint.</strong> OJAS is a challenge research and decision-support prototype. It does not provide certified medical diagnoses or replace flight surgeon protocols.
          </p>
        </div>
      </div>
    </Card>
  );
};
