import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ResearchPaper } from '../../types/research';
import { BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ResearchPreviewProps {
  papers: ResearchPaper[];
}

export const ResearchPreview: React.FC<ResearchPreviewProps> = ({ papers }) => {
  const primaryPaper = papers[0];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cosmos-accent" />
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            Research Foundation Preview
          </h3>
        </div>
        <Badge variant="normal" size="sm">NTRS EVIDENCE BASE</Badge>
      </div>

      {primaryPaper ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">{primaryPaper.focusArea}</Badge>
            <span className="font-mono text-xs text-cosmos-muted">{primaryPaper.publicationYear}</span>
            {primaryPaper.isPeerReviewed && (
              <Badge variant="normal" size="sm">Peer-Reviewed</Badge>
            )}
          </div>

          <div className="text-sm font-semibold text-cosmos-text font-heading">
            {primaryPaper.title}
          </div>

          <p className="text-xs text-cosmos-text-secondary leading-relaxed line-clamp-3">
            {primaryPaper.abstract}
          </p>

          <div className="pt-2">
            <Link to="/research">
              <Button variant="outline" size="sm" className="w-full justify-center gap-2 font-mono text-xs">
                <span>OPEN RESEARCH EXPLORER</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-xs text-cosmos-text-secondary">
          Research citations currently offline. Check network downlink.
        </p>
      )}
    </Card>
  );
};
