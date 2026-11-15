import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { HealthInsight } from '../../types/insights';
import { ShieldCheck, BookOpen, ExternalLink } from 'lucide-react';
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
          <Badge variant={insight.priority === 'moderate' ? 'caution' : 'neutral'}>
            CATEGORY: {insight.category.toUpperCase()}
          </Badge>
          <span className="font-mono text-xs text-cosmos-muted">{insight.timestamp}</span>
        </div>

        {/* Observation Summary */}
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-cosmos-muted uppercase block">
            PHYSIOLOGICAL OBSERVATION
          </span>
          <p className="text-cosmos-text leading-relaxed">{insight.summary}</p>
        </div>

        {/* Scientific Rationale Box */}
        <div className="p-4 rounded bg-cosmos-elevated border border-cosmos-border space-y-2">
          <div className="flex items-center gap-2 text-cosmos-accent font-mono text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>SCIENTIFIC CONTEXT & CITATION</span>
          </div>
          <p className="text-xs text-cosmos-text-secondary leading-relaxed">
            {insight.scientificContext}
          </p>
        </div>

        {/* Evidence Summary */}
        <div className="p-3 rounded bg-cosmos-card border border-cosmos-border text-xs font-mono space-y-1">
          <span className="text-cosmos-muted text-[10px] uppercase block">EVIDENCE CLASSIFICATION</span>
          <span className="text-cosmos-accent font-semibold">{insight.evidenceClassification}</span>
          <p className="text-cosmos-text-secondary font-sans mt-1">{insight.evidenceSummary}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-cosmos-border">
          <Link to={`/insights?id=${insight.id}`} onClick={onClose}>
            <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span>EXPLORE FULL EXPLAINABILITY</span>
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
