import React from 'react';
import { VitalSign } from '../../types/health';
import { MetricCard } from './MetricCard';

export interface MetricGridProps {
  vitals: VitalSign[];
  selectedVitalId?: string;
  onSelectVital: (vital: VitalSign) => void;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  vitals,
  selectedVitalId,
  onSelectVital,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold tracking-wider uppercase text-cosmos-text">
          Physiological Indicator Array
        </h3>
        <span className="font-mono text-xs text-cosmos-muted">
          SELECT INDICATOR TO CHART ({vitals.length} AVAILABLE)
        </span>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-6 gap-3">
        {vitals.map((vital) => (
          <MetricCard
            key={vital.id}
            vital={vital}
            isSelected={selectedVitalId === vital.id}
            onClick={() => onSelectVital(vital)}
          />
        ))}
      </div>
    </div>
  );
};
