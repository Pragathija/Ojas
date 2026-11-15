import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { VitalSign } from '../../types/health';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, ArrowRight } from 'lucide-react';

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
      <div className="space-y-6 text-sm font-sans">
        {/* Top Metric Header */}
        <div className="flex items-baseline justify-between p-4 rounded bg-cosmos-elevated border border-cosmos-border">
          <div>
            <span className="text-[10px] font-mono text-cosmos-muted uppercase block">CURRENT OBSERVATION</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl font-bold text-cosmos-text tabular-nums">
                {vital.currentValue}
              </span>
              <span className="font-mono text-sm text-cosmos-text-secondary">{vital.unit}</span>
            </div>
          </div>
          <Badge variant={vital.status === 'caution' ? 'caution' : 'normal'}>
            {vital.status.toUpperCase()}
          </Badge>
        </div>

        {/* Technical Specification Matrix */}
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-cosmos-border">
            <span className="text-cosmos-muted">MEASUREMENT DOMAIN:</span>
            <span className="text-cosmos-text uppercase">{vital.category}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-cosmos-border">
            <span className="text-cosmos-muted">ILLUSTRATIVE REF BAND:</span>
            <span className="text-cosmos-text">
              {vital.nominalRange[0]} – {vital.nominalRange[1]} {vital.unit}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-cosmos-border">
            <span className="text-cosmos-muted">SENSOR CONFIDENCE:</span>
            <span className="text-semantic-normal">{vital.confidence}% HIGH FIDELITY</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-cosmos-border">
            <span className="text-cosmos-muted">OBSERVATION AGE:</span>
            <span className="text-cosmos-text">Latest simulated observation ({vital.lastUpdated})</span>
          </div>
        </div>

        {/* Synthetic Demonstration Notice */}
        <div className="p-3 rounded bg-cosmos-bg border border-cosmos-border text-xs flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-semantic-caution shrink-0 mt-0.5" />
          <p className="text-cosmos-text-secondary leading-relaxed">
            Data Integrity: Measurement generated under simulated bio-harness stream parameters for platform validation.
            Illustrative reference bands are demonstration corridors and not individualized clinical thresholds or diagnostic criteria.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link to="/indicators" onClick={onClose}>
            <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
              <Activity className="h-3.5 w-3.5" />
              <span>FULL INDICATOR MATRIX</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
