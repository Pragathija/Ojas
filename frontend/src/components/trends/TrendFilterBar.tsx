import React from 'react';
import { VitalSign } from '../../types/health';

export interface TrendFilterBarProps {
  vitals: VitalSign[];
  selectedMetricId: string;
  onSelectMetric: (id: string) => void;
  timeframe: '24h' | '7d' | '30d' | '90d' | 'full';
  onTimeframeChange: (tf: '24h' | '7d' | '30d' | '90d' | 'full') => void;
}

export const TrendFilterBar: React.FC<TrendFilterBarProps> = ({
  vitals,
  selectedMetricId,
  onSelectMetric,
  timeframe,
  onTimeframeChange,
}) => {
  return (
    <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      {/* Indicator Selection Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-content-muted mr-1 uppercase">METRIC:</span>
        {vitals.map((v) => {
          const isSelected = selectedMetricId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelectMetric(v.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isSelected
                  ? 'bg-primary text-white font-bold border-primary shadow-xs'
                  : 'bg-[#FAF9FF] text-content-secondary border-[#EAE6F2] hover:bg-primary-light/40 hover:text-primary'
              }`}
            >
              {v.name.toUpperCase()} ({v.symbol})
            </button>
          );
        })}
      </div>

      {/* Time-Range Selector */}
      <div className="flex items-center gap-1.5 self-start laptop:self-auto shrink-0">
        <span className="font-mono text-xs font-bold text-content-muted mr-1 uppercase">WINDOW:</span>
        {(['24h', '7d', '30d', '90d', 'full'] as const).map((tf) => {
          const isSelected = timeframe === tf;
          return (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isSelected
                  ? 'bg-primary text-white font-bold border-primary shadow-xs'
                  : 'bg-[#FAF9FF] text-content-secondary border-[#EAE6F2] hover:bg-primary-light/40 hover:text-primary'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
