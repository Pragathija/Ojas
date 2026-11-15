import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ResearchDatasetMeta } from '../../types/research';
import { Database, Layers, AlertCircle } from 'lucide-react';

export interface DatasetSummaryProps {
  dataset: ResearchDatasetMeta;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DatasetSummary: React.FC<DatasetSummaryProps> = ({
  dataset,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Card
      interactive={Boolean(onSelect)}
      onClick={onSelect}
      className={`p-5 space-y-3 transition-colors ${
        isSelected ? 'border-cosmos-accent bg-cosmos-elevated shadow-md' : 'hover:border-cosmos-border/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <Badge variant="caution" size="sm">
            {dataset.provenanceType.toUpperCase()}
          </Badge>
          <h3 className="font-heading text-base font-semibold text-cosmos-text">
            {dataset.name}
          </h3>
        </div>
        <div className="text-right font-mono text-[11px] text-cosmos-text-secondary shrink-0">
          GEN-SERIES: {dataset.generatedSeriesCompletenessPercent}%
        </div>
      </div>

      <p className="text-xs text-cosmos-text-secondary leading-relaxed">
        {dataset.description}
      </p>

      {/* Specific source data availability banner */}
      <div className="p-2.5 rounded bg-cosmos-bg border border-cosmos-border text-[11px] font-mono text-cosmos-muted flex items-start gap-2">
        <AlertCircle className="h-3.5 w-3.5 text-semantic-caution shrink-0 mt-0.5" />
        <span>{dataset.sourceDataAvailabilityNotice}</span>
      </div>

      <div className="pt-2 border-t border-cosmos-border/60 grid grid-cols-2 gap-2 text-[10px] font-mono text-cosmos-muted">
        <div className="flex items-center gap-1.5 truncate">
          <Database className="h-3 w-3 text-cosmos-accent shrink-0" />
          <span className="truncate">Publisher: {dataset.source}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="h-3 w-3 text-semantic-info shrink-0" />
          <span>{dataset.availableVariables.length} Target Variables</span>
        </div>
      </div>
    </Card>
  );
};
