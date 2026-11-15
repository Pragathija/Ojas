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
  );
};
