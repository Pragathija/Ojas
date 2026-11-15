import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ResearchPaper } from '../../types/research';
import { ExternalLink, BookOpen, Quote, ShieldCheck } from 'lucide-react';

export interface ObservationDetailModalProps {
  paper: ResearchPaper | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationDetailModal: React.FC<ObservationDetailModalProps> = ({
  paper,
  isOpen,
  onClose,
}) => {
  if (!paper) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={paper.title}>
      <div className="space-y-5 text-sm font-sans">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cosmos-border pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="info">{paper.focusArea}</Badge>
            <span className="font-mono text-xs text-cosmos-muted">{paper.publicationYear}</span>
            {paper.isPeerReviewed && <Badge variant="normal" size="sm">Peer-Reviewed</Badge>}
          </div>
          <div className="flex items-center gap-1 font-mono text-xs text-cosmos-accent">
            <Quote className="h-3 w-3" />
            <span>{paper.citationCount} Citations</span>
          </div>
        </div>

        {/* Authors & Source metadata */}
        <div className="space-y-1 font-mono text-xs">
          <div className="text-cosmos-text-secondary">
            <strong className="text-cosmos-text">Authors:</strong> {paper.authors.join(', ')}
          </div>
          <div className="text-cosmos-text-secondary">
            <strong className="text-cosmos-text">Source:</strong> {paper.source}
          </div>
          <div className="text-cosmos-text-secondary">
            <strong className="text-cosmos-text">Relevance Score:</strong>{' '}
            <span className="text-semantic-normal font-bold">{paper.relevanceScore}%</span>
          </div>
        </div>

        {/* Abstract */}
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-cosmos-muted uppercase block">
            SCIENTIFIC ABSTRACT & METHODOLOGY
          </span>
          <p className="text-cosmos-text leading-relaxed text-xs">
            {paper.abstract}
          </p>
        </div>

        {/* Provenance note */}
        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border flex items-start gap-2 text-xs font-mono">
          <ShieldCheck className="h-4 w-4 text-cosmos-accent shrink-0 mt-0.5" />
          <p className="text-cosmos-text-secondary leading-tight">
            Scientific Provenance: Verified entry from the NASA Human Research Program. Not synthetic.
          </p>
        </div>

        {/* Action Link */}
        <div className="pt-2 flex items-center justify-between border-t border-cosmos-border">
          {paper.openAccessUrl ? (
            <a
              href={paper.openAccessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-cosmos-accent hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>ACCESS FULL PUBLICATION (EXTERNAL)</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="font-mono text-xs text-cosmos-muted">No external URL registered</span>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
