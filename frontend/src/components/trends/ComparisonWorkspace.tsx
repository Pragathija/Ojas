import React, { useState } from 'react';
import { Card } from '../common/Card';
import { VitalSign, HealthMetricSeries } from '../../types/health';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SlidersHorizontal } from 'lucide-react';

export interface ComparisonWorkspaceProps {
  vitals: VitalSign[];
  primaryVital: VitalSign;
  primaryHistory: HealthMetricSeries[];
  secondaryHistoryFetcher: (metricId: string) => Promise<HealthMetricSeries[]>;
}

export const ComparisonWorkspace: React.FC<ComparisonWorkspaceProps> = ({
  vitals,
  primaryVital,
  primaryHistory,
  secondaryHistoryFetcher,
}) => {
  const [secondaryMetricId, setSecondaryMetricId] = useState<string>(
    vitals.find((v) => v.id !== primaryVital.id)?.id || ''
  );
  const [secondaryHistory, setSecondaryHistory] = useState<HealthMetricSeries[]>([]);

  const secondaryVital = vitals.find((v) => v.id === secondaryMetricId) || null;

  const handleSelectSecondary = async (id: string) => {
    setSecondaryMetricId(id);
    try {
      const data = await secondaryHistoryFetcher(id);
      setSecondaryHistory(data);
    } catch (err) {
      console.error('Failed to fetch secondary history for comparison:', err);
      setSecondaryHistory([]);
    }
  };

  // Initial fetch when primary changes or mounts
  React.useEffect(() => {
    if (secondaryMetricId) {
      handleSelectSecondary(secondaryMetricId);
    }
  }, [secondaryMetricId]);

  // Merge data safely with dual independent Y-axes
  const comparisonData = primaryHistory.map((p, index) => {
    const s = secondaryHistory[index];
    const d = new Date(p.timestamp);
    return {
      time: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      primaryVal: p.value,
      secondaryVal: s ? s.value : undefined,
    };
  });

  return (
    <Card className="p-6 space-y-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-content-main">
            Indicator Comparison
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-content-muted">COMPARE WITH:</span>
          <select
            value={secondaryMetricId}
            onChange={(e) => handleSelectSecondary(e.target.value)}
            className="rounded-xl border border-[#EAE6F2] bg-white px-3 py-1.5 text-xs font-mono text-content-main focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
          >
            {vitals
              .filter((v) => v.id !== primaryVital.id)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.symbol} — {v.unit})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] text-xs font-sans space-y-1">
        <p className="text-content-secondary leading-relaxed">
          Independent dual-axis trajectory alignment. Allows qualitative inspection of physiological trends across separate bodily systems (e.g., autonomic heart rate vs. peripheral oxygen saturation) without merging incompatible scale ranges.
        </p>
        <p className="text-primary font-medium text-[11px]">
          <strong>Notice:</strong> Co-movement visualization explores trend alignment. Operational factors (such as exercise cycles or ambient temperature shifts) can influence separate biometrics independently.
        </p>
      </div>

      {/* Recharts Dual-Axis Comparison */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#EAE6F2" strokeDasharray="3 3" opacity={0.8} />
            <XAxis
              dataKey="time"
              stroke="#8C869E"
              tick={{ fill: '#716B83', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
            />
            {/* Primary Left Axis */}
            <YAxis
              yAxisId="left"
              stroke="#7656D9"
              tick={{ fill: '#7656D9', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              domain={['auto', 'auto']}
              unit={` ${primaryVital.unit}`}
            />
            {/* Secondary Right Axis */}
            {secondaryVital && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                tick={{ fill: '#10B981', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                domain={['auto', 'auto']}
                unit={` ${secondaryVital.unit}`}
              />
            )}
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#EAE6F2',
                borderRadius: '12px',
                boxShadow: '0 4px 20px -2px rgba(118,86,217,0.12)',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                color: '#252039',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              name={`${primaryVital.name} (${primaryVital.unit})`}
              dataKey="primaryVal"
              stroke="#7656D9"
              strokeWidth={2.5}
              dot={false}
            />
            {secondaryVital && (
              <Line
                yAxisId="right"
                type="monotone"
                name={`${secondaryVital.name} (${secondaryVital.unit})`}
                dataKey="secondaryVal"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[11px] font-mono text-content-muted">
        <span>Dual independent scales preserved</span>
        <span className="text-primary font-bold">Statistical correlation exploratory tool only</span>
      </div>
    </Card>
  );
};
