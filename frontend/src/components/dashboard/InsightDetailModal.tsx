import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { HealthInsight } from '../../types/insights';
import { ShieldCheck, BookOpen, ExternalLink, Activity, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface InsightDetailModalProps {
  insight: HealthInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InsightDetailModal: React.FC<InsightDetailModalProps> = ({
  insight,
  isOpen,
  onClose,
}) => {
  if (!insight) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={insight.title}>
      <div className="space-y-5 text-sm font-sans">
        {/* Header tags */}
        <div className="flex items-center justify-between">
          <Badge variant={insight.priority === 'moderate' ? 'caution' : 'purple'}>
            CATEGORY: {insight.category.toUpperCase()}
          </Badge>
          <span className="font-mono text-xs text-content-muted">{insight.timestamp}</span>
        </div>

        {/* Observation Summary */}
        <div className="p-4 rounded-xl bg-surface-ground border border-surface-border space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-primary uppercase">
            <Activity className="h-3.5 w-3.5" />
            <span>Physiological Observation</span>
          </div>
          <p className="text-content-main leading-relaxed font-medium">{insight.summary}</p>
        </div>

        {/* Scientific Rationale Box */}
        <div className="p-4 rounded-xl bg-primary-subtle/50 border border-primary/20 space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>SCIENTIFIC CONTEXT & CITATION</span>
          </div>
          <p className="text-xs text-content-main leading-relaxed">
            {insight.scientificContext}
          </p>
        </div>

        {/* Evidence Summary */}
        <div className="p-4 rounded-xl bg-white border border-surface-border text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-content-muted text-[10px] font-mono uppercase font-bold">Evidence Classification</span>
            <Badge variant="purple" size="sm">{insight.evidenceClassification}</Badge>
          </div>
          <p className="text-content-secondary font-sans leading-relaxed">{insight.evidenceSummary}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border">
          <Link to={`/insights?id=${insight.id}`} onClick={onClose}>
            <Button variant="outline" size="sm" className="gap-2 font-mono text-xs text-primary border-primary/30 hover:border-primary">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Full Explainability</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
};
