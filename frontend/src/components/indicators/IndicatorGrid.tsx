import React from 'react';
import { VitalSign } from '../../types/health';
import { IndicatorCard } from './IndicatorCard';

export interface IndicatorGridProps {
  vitals: VitalSign[];
  selectedVitalId?: string;
  onSelectVital: (vital: VitalSign) => void;
}

export const IndicatorGrid: React.FC<IndicatorGridProps> = ({
  vitals,
  selectedVitalId,
  onSelectVital,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold tracking-wider uppercase text-cosmos-text">
          Available Physiological Sensors ({vitals.length})
        </h2>
        <span className="font-mono text-xs text-cosmos-muted">
          SELECT CARD TO INSPECT CLINICAL METADATA
        </span>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-4">
        {vitals.map((vital) => (
          <IndicatorCard
            key={vital.id}
            vital={vital}
            isSelected={selectedVitalId === vital.id}
            onSelect={() => onSelectVital(vital)}
          />
        ))}
      </div>
    </div>
  );
};
