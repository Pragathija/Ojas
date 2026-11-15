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
    <Card className="p-6 space-y-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-[#EAE6F2] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-content-main">
              {vital.name} Time-Series Trajectory
            </h3>
            <Badge variant="purple" size="sm">{vital.symbol}</Badge>
            <Badge variant="neutral" size="sm">TELEMETRY STREAM</Badge>
          </div>
          <p className="font-mono text-xs text-content-secondary mt-0.5">
            Illustrative Reference Band: {vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit} (Demonstration corridor)
          </p>
        </div>
        <div className="font-mono text-xs text-content-muted">
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
              <CartesianGrid stroke="#EAE6F2" strokeDasharray="3 3" opacity={0.8} />
              <XAxis
                dataKey="time"
                stroke="#8C869E"
                tick={{ fill: '#716B83', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
              />
              <YAxis
                stroke="#8C869E"
                tick={{ fill: '#716B83', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EAE6F2',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px -2px rgba(118,86,217,0.12)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: '#252039',
                }}
                formatter={(val) => [`${val ?? 'N/A'} ${vital.unit}`, 'Observed Parameter']}
              />
              {/* Baseline Range Boundaries */}
              <ReferenceLine
                y={vital.nominalRange[0]}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{
                  value: `Min: ${vital.nominalRange[0]}`,
                  fill: '#10B981',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideBottomRight',
                }}
              />
              <ReferenceLine
                y={vital.nominalRange[1]}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: `Max: ${vital.nominalRange[1]}`,
                  fill: '#F59E0B',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideTopRight',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7656D9"
                strokeWidth={2.5}
                dot={{ fill: '#7656D9', r: 3 }}
                activeDot={{ r: 5, fill: '#5535A5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[11px] font-mono text-content-muted">
        <div className="flex items-center gap-1.5 text-primary">
          <ShieldAlert className="h-3 w-3" />
          <span>Non-diagnostic telemetry corridor. Certified clinical decisions require Flight Surgeon review.</span>
        </div>
        <span>UNITS: {vital.unit}</span>
      </div>
    </Card>
  );
};
