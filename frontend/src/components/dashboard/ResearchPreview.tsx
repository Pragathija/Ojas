import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ResearchPaper } from '../../types/research';
import { BookOpen, ExternalLink, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ResearchPreviewProps {
  papers: ResearchPaper[];
}

export const ResearchPreview: React.FC<ResearchPreviewProps> = ({ papers }) => {
  const primaryPaper = papers[0];

  return (
    <Card className="p-6 space-y-4 bg-white border-surface-border shadow-soft rounded-2xl">
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-content-main">
            NASA Research Highlights
          </h3>
        </div>
        <Badge variant="purple" size="sm">OSDR & BRSMACT</Badge>
      </div>

      {primaryPaper ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">{primaryPaper.focusArea}</Badge>
            <span className="font-mono text-xs text-content-secondary font-medium">{primaryPaper.publicationYear}</span>
            {primaryPaper.isPeerReviewed && (
              <Badge variant="normal" size="sm">Peer-Reviewed</Badge>
            )}
          </div>

          <div className="text-sm font-bold text-content-main font-heading leading-snug">
            {primaryPaper.title}
          </div>

          <p className="text-xs text-content-secondary leading-relaxed line-clamp-3">
            {primaryPaper.abstract}
          </p>

          <div className="pt-2">
            <Link to="/research">
              <Button variant="outline" size="sm" className="w-full justify-center gap-2 text-xs font-semibold">
                <span>Explore Spaceflight Research</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-xs text-content-secondary">
          NASA research datasets active. Explore OSD-575, OSD-569, and BRSMAct Bedrest Actigraphy.
        </p>
      )}
    </Card>
  );
};
