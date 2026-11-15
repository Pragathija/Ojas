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
import { ShieldAlert, TrendingUp } from 'lucide-react';

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
      <Card className="p-8 bg-white border-surface-border">
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
    <Card className="p-6 space-y-4 bg-white border-surface-border shadow-soft rounded-2xl">
      {/* Chart Header Bar */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-content-main flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {vital.name} Physiological Trajectory
            </h3>
            <Badge variant="purple" size="sm">{vital.symbol}</Badge>
          </div>
          <p className="font-mono text-xs text-content-secondary mt-0.5">
            Nominal Corridor: {vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit} • Personal Median/IQR Corridors Active
          </p>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-ground rounded-xl border border-surface-border">
          {(['24h', '7d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                timeframe === tf
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-content-secondary hover:text-content-main hover:bg-white'
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
              <CartesianGrid stroke="#EAE6F2" strokeDasharray="3 3" opacity={0.8} />
              <XAxis
                dataKey="time"
                stroke="#77718C"
                tick={{ fill: '#77718C', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
              />
              <YAxis
                stroke="#77718C"
                tick={{ fill: '#77718C', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EAE6F2',
                  borderRadius: '12px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: '#211B35',
                  boxShadow: '0 4px 20px rgba(109, 74, 255, 0.08)',
                }}
                formatter={(val) => [`${val ?? 'N/A'} ${vital.unit}`, `${vital.symbol} Observed`]}
                labelFormatter={(label) => `Timestamp: ${label}`}
              />
              {/* Baseline Reference Lines */}
              <ReferenceLine
                y={vital.nominalRange[0]}
                stroke="#19A974"
                strokeDasharray="4 4"
                label={{
                  value: `Min (${vital.nominalRange[0]})`,
                  fill: '#19A974',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <ReferenceLine
                y={vital.nominalRange[1]}
                stroke="#19A974"
                strokeDasharray="4 4"
                label={{
                  value: `Max (${vital.nominalRange[1]})`,
                  fill: '#19A974',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6D4AFF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6D4AFF', strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#4B2BBF', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chart Footer with Provenance */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 pt-3 border-t border-surface-border text-xs text-content-secondary font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>Telemetry Stream: <strong>{vital.dataClassification}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Observation Reliability: <strong className="text-emerald-600">{vital.confidence}%</strong></span>
          <span>•</span>
          <span>Missing: <strong>{vital.missingDataPercent}%</strong></span>
        </div>
      </div>
    </Card>
  );
};
