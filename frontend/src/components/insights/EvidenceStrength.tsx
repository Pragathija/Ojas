import React from 'react';
import { Badge } from '../common/Badge';
import { EvidenceClassification } from '../../types/insights';
import { BookOpen, FileText, HelpCircle, CheckCircle2 } from 'lucide-react';

export interface EvidenceStrengthProps {
  classification: EvidenceClassification;
  sourceTitle?: string;
  evidenceScope?: string;
  className?: string;
}

export const EvidenceStrength: React.FC<EvidenceStrengthProps> = ({
  classification,
  sourceTitle,
  evidenceScope,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (classification) {
      case 'Directly Measured Evidence':
        return {
          variant: 'normal' as const,
          icon: <CheckCircle2 className="h-3 w-3" />,
          label: 'DIRECTLY MEASURED EVIDENCE',
        };
      case 'Peer-Reviewed Contextual Literature':
        return {
          variant: 'normal' as const,
          icon: <BookOpen className="h-3 w-3" />,
          label: 'PEER-REVIEWED CONTEXTUAL LITERATURE',
        };
      case 'NASA Technical Reports':
        return {
          variant: 'accent' as const,
          icon: <FileText className="h-3 w-3" />,
          label: 'NASA TECHNICAL REPORTS',
        };
      case 'Research Concepts':
        return {
          variant: 'neutral' as const,
          icon: <BookOpen className="h-3 w-3" />,
          label: 'RESEARCH CONCEPTS',
        };
      case 'Evidence Unavailable':
      default:
        return {
          variant: 'caution' as const,
          icon: <HelpCircle className="h-3 w-3" />,
          label: 'EVIDENCE UNAVAILABLE IN RELEASE',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <Badge variant={config.variant} size="sm" className="gap-1 font-mono text-[10px]">
          {config.icon}
          <span>{config.label}</span>
        </Badge>
      </div>
      {sourceTitle && (
        <span className="text-[11px] text-cosmos-text-secondary truncate font-mono">
          Ref: {sourceTitle}
        </span>
      )}
      {evidenceScope && (
        <span className="text-[10px] text-cosmos-muted line-clamp-1 font-sans">
          Scope: {evidenceScope}
        </span>
      )}
    </div>
  );
};
