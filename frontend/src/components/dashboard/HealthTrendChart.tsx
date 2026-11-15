import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';
import { EmptyState } from '../common/EmptyState';
import { HealthMetricSeries, VitalSign } from '../../types/health';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ShieldAlert } from 'lucide-react';

export interface HealthTrendChartProps {
  vital: VitalSign | null;
  history: HealthMetricSeries[];
  isLoading: boolean;
  timeframe: '24h' | '7d' | '30d';
  onTimeframeChange: (tf: '24h' | '7d' | '30d') => void;
}

export const HealthTrendChart: React.FC<HealthTrendChartProps> = ({
  vital,
  history,
  isLoading,
  timeframe,
  onTimeframeChange,
}) => {
  if (!vital) {
    return (
      <Card className="p-8">
        <EmptyState
          title="No Indicator Selected"
          description="Choose a physiological indicator above to chart historical observations."
        />
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = history.map((point) => {
    const d = new Date(point.timestamp);
    const label =
      timeframe === '24h'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return {
      time: label,
      value: point.value,
      baseline: point.baseline,
      fullTime: d.toISOString(),
    };
  });

  return (
    <Card className="p-6 space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-cosmos-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-cosmos-text">
              {vital.name} Physiological Trend
            </h3>
            <Badge variant="accent" size="sm">{vital.symbol}</Badge>
          </div>
          <p className="font-mono text-xs text-cosmos-text-secondary mt-0.5">
            Illustrative Reference Band: {vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit} • Demonstration Corridor
          </p>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${
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

      {/* Main Chart Body */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingState label="Computing telemetry trajectory..." />
        </div>
      ) : chartData.length === 0 ? (
        <EmptyState
          title="Telemetry Data Unavailable"
          description="No historical observations found for the specified timeframe."
        />
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#30353A" strokeDasharray="3 3" opacity={0.6} />
              <XAxis
                dataKey="time"
                stroke="#70777D"
                tick={{ fill: '#A5A9AD', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
              />
              <YAxis
                stroke="#70777D"
                tick={{ fill: '#A5A9AD', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#191C20',
                  borderColor: '#30353A',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: '#F4F1EA',
                }}
                formatter={(val) => [`${val ?? 'N/A'} ${vital.unit}`, 'Observed Value']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              {/* Baseline Reference Line */}
              <ReferenceLine
                y={vital.nominalRange[0]}
                stroke="#53B68A"
                strokeDasharray="4 4"
                label={{
                  value: `Min: ${vital.nominalRange[0]}`,
                  fill: '#53B68A',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideBottomRight',
                }}
              />
              <ReferenceLine
                y={vital.nominalRange[1]}
                stroke="#E7B45B"
                strokeDasharray="4 4"
                label={{
                  value: `Max: ${vital.nominalRange[1]}`,
                  fill: '#E7B45B',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F07832"
                strokeWidth={2}
                dot={{ fill: '#F07832', r: 3 }}
                activeDot={{ r: 5, fill: '#F5A15C' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chart Footer Note */}
      <div className="pt-2 border-t border-cosmos-border/60 flex items-center justify-between text-[11px] font-mono text-cosmos-muted">
        <div className="flex items-center gap-1.5 text-semantic-caution">
          <ShieldAlert className="h-3 w-3" />
          <span>SYNTHETIC DEMONSTRATION TELEMETRY</span>
        </div>
        <span>UNITS: {vital.unit}</span>
      </div>
    </Card>
  );
};
