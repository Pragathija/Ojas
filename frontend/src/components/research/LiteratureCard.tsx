import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ResearchPaper } from '../../types/research';
import { ExternalLink, BookOpen, Quote } from 'lucide-react';

export interface LiteratureCardProps {
  paper: ResearchPaper;
  onSelect?: () => void;
}

export const LiteratureCard: React.FC<LiteratureCardProps> = ({ paper, onSelect }) => {
  return (
    <Card
      interactive={Boolean(onSelect)}
      onClick={onSelect}
      className="p-6 space-y-4 bg-cosmos-card hover:border-cosmos-accent/40 transition-colors"
    >
      {/* Top Header: Tag, Year, Peer-Reviewed Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">{paper.focusArea}</Badge>
          <span className="text-xs font-mono text-cosmos-muted">{paper.publicationYear}</span>
          {paper.isPeerReviewed && (
            <Badge variant="normal" size="sm">Verified Source</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-cosmos-text-secondary">
          <Quote className="h-3 w-3 text-cosmos-accent" />
          <span>{paper.citationCount} Citations</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading text-lg font-bold text-cosmos-text leading-snug">
        {paper.title}
      </h3>

      {/* Authors & Source */}
      <p className="text-xs font-mono text-cosmos-text-secondary">
        <strong className="text-cosmos-text">Authors:</strong> {paper.authors.join(', ')} •{' '}
        <span className="text-cosmos-muted">{paper.source}</span>
      </p>

      {/* Abstract */}
      <p className="text-sm text-cosmos-text-secondary leading-relaxed font-sans">
        {paper.abstract}
      </p>

      {/* Footer Link */}
      {paper.openAccessUrl && (
        <div className="pt-2 border-t border-cosmos-border/60 flex items-center justify-between">
          <a
            href={paper.openAccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cosmos-accent hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>ACCESS SCIENTIFIC SOURCE</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="font-mono text-[10px] text-cosmos-muted">
            {paper.doi ? `DOI: ${paper.doi}` : 'NTRS Indexed'}
          </span>
        </div>
      )}
    </Card>
  );
};
