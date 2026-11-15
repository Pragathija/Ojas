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
    <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 p-4 rounded bg-cosmos-card border border-cosmos-border">
      {/* Indicator Selection Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-cosmos-muted mr-1 uppercase">METRIC:</span>
        {vitals.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelectMetric(v.id)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${
              selectedMetricId === v.id
                ? 'bg-cosmos-accent text-cosmos-bg font-bold border-cosmos-accent'
                : 'bg-cosmos-elevated text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text'
            }`}
          >
            {v.name.toUpperCase()} ({v.symbol})
          </button>
        ))}
      </div>

      {/* Time-Range Selector */}
      <div className="flex items-center gap-1.5 self-start laptop:self-auto">
        <span className="font-mono text-xs text-cosmos-muted mr-1 uppercase">WINDOW:</span>
        {(['24h', '7d', '30d', '90d', 'full'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
              timeframe === tf
                ? 'bg-cosmos-accent text-cosmos-bg font-bold border-cosmos-accent'
                : 'bg-cosmos-elevated text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text'
            }`}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
