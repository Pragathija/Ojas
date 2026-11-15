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
      className={`p-6 space-y-3.5 transition-all rounded-2xl border ${
        isSelected
          ? 'border-primary bg-pastel-lavender/40 shadow-soft ring-2 ring-primary/20'
          : 'bg-white border-[#EAE6F2] hover:border-primary/40 hover:shadow-soft'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Badge variant="purple" size="sm">
              NASA_RESEARCH_DATA
            </Badge>
            <Badge variant="neutral" size="sm">
              {dataset.provenanceType.toUpperCase()}
            </Badge>
          </div>
          <h3 className="font-heading text-base font-bold text-content-main mt-1">
            {dataset.name}
          </h3>
        </div>
        <div className="text-right font-mono text-[11px] text-content-secondary shrink-0 font-semibold">
          DATA COMPLETENESS: {dataset.generatedSeriesCompletenessPercent}%
        </div>
      </div>

      <p className="text-xs text-content-secondary leading-relaxed">
        {dataset.description}
      </p>

      {/* Specific source data availability banner */}
      <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] text-[11px] font-sans text-content-secondary flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{dataset.sourceDataAvailabilityNotice}</span>
      </div>

      <div className="pt-2 border-t border-[#EAE6F2] grid grid-cols-2 gap-2 text-[10px] font-mono text-content-muted">
        <div className="flex items-center gap-1.5 truncate">
          <Database className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate">Source: {dataset.source}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="h-3 w-3 text-[#2F7BE5] shrink-0" />
          <span>{dataset.availableVariables.length} Target Analytes / Variables</span>
        </div>
      </div>
    </Card>
  );
};