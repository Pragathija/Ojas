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

export interface TrendChartProps {
  vital: VitalSign;
  history: HealthMetricSeries[];
  isLoading: boolean;
  timeframe: '24h' | '7d' | '30d' | '90d' | 'full';
}

export const TrendChart: React.FC<TrendChartProps> = ({
  vital,
  history,
  isLoading,
  timeframe,
}) => {
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
    };
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-cosmos-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-cosmos-text">
              {vital.name} Time-Series Trajectory
            </h3>
            <Badge variant="accent" size="sm">{vital.symbol}</Badge>
            <Badge variant="caution" size="sm">SYNTHETIC MODEL</Badge>
          </div>
          <p className="font-mono text-xs text-cosmos-muted mt-0.5">
            Illustrative Reference Band: {vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit} (Demonstration corridor)
          </p>
        </div>
        <div className="font-mono text-xs text-cosmos-muted">
          TIMEFRAME: {timeframe.toUpperCase()} ({history.length} SAMPLES)
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 flex items-center justify-center">
          <LoadingState label="Computing longitudinal spline..." />
        </div>
      ) : chartData.length === 0 ? (
        <EmptyState
          title="Telemetry Data Missing"
          description="No historical observations found for this time range."
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
                formatter={(val) => [`${val ?? 'N/A'} ${vital.unit}`, 'Observed Parameter']}
              />
              {/* Baseline Range Boundaries */}
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

      <div className="pt-2 border-t border-cosmos-border/60 flex items-center justify-between text-[11px] font-mono text-cosmos-muted">
        <div className="flex items-center gap-1.5 text-semantic-caution">
          <ShieldAlert className="h-3 w-3" />
          <span>SYNTHETIC DEMONSTRATION: Illustrative reference bands are not individualized clinical thresholds or diagnostic criteria.</span>
        </div>
        <span>UNITS: {vital.unit}</span>
      </div>
    </Card>
  );
};
