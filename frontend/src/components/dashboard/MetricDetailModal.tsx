import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { VitalSign } from '../../types/health';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

export interface MetricDetailModalProps {
  vital: VitalSign | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  vital,
  isOpen,
  onClose,
}) => {
  if (!vital) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${vital.name} (${vital.symbol})`}>
      <div className="space-y-5 text-sm font-sans">
        {/* Top Metric Header */}
        <div className="flex items-baseline justify-between p-4 rounded-xl bg-surface-ground border border-surface-border">
          <div>
            <span className="text-[10px] font-mono text-content-secondary uppercase block font-semibold">
              CURRENT OBSERVATION
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading font-black text-3xl text-content-main tabular-nums">
                {vital.currentValue}
              </span>
              <span className="font-mono text-sm font-semibold text-content-secondary">{vital.unit}</span>
            </div>
          </div>
          <Badge variant={vital.status === 'priority' ? 'priority' : vital.status === 'caution' ? 'caution' : 'normal'}>
            {vital.status.toUpperCase()}
          </Badge>
        </div>

        {/* Technical Specification Matrix */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-2 border-b border-surface-border">
            <span className="text-content-secondary">MEASUREMENT DOMAIN:</span>
            <span className="text-content-main font-bold uppercase">{vital.category}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-surface-border">
            <span className="text-content-secondary">NOMINAL CORRIDOR:</span>
            <span className="text-content-main font-bold">
              {vital.nominalRange[0]} – {vital.nominalRange[1]} {vital.unit}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-surface-border">
            <span className="text-content-secondary">SIGNAL FIDELITY:</span>
            <span className="text-emerald-700 font-bold">{vital.confidence}% CONFIDENCE</span>
          </div>
          <div className="flex justify-between py-2 border-b border-surface-border">
            <span className="text-content-secondary">DATA CONTEXT:</span>
            <span className="text-primary font-bold">{vital.dataClassification}</span>
          </div>
        </div>

        {/* Scientific Rationale */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-purple-50/60 border border-primary/20 text-xs text-content-secondary">
          <span className="font-bold text-primary font-heading uppercase text-[11px] block">
            Physiological Relevance
          </span>
          <p className="leading-relaxed">{vital.physiologicalRelevance}</p>
        </div>

        {/* Action Link to Full Trends */}
        <div className="pt-2">
          <Link to="/trends" onClick={onClose}>
            <Button className="w-full gap-2 font-heading font-bold text-xs shadow-soft">
              <span>View Full Longitudinal Trend Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
