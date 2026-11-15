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
    <Card className="p-6 space-y-4">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-cosmos-border pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-cosmos-accent" />
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            Indicator Comparison
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-cosmos-muted">COMPARE WITH:</span>
          <select
            value={secondaryMetricId}
            onChange={(e) => handleSelectSecondary(e.target.value)}
            className="rounded border border-cosmos-border bg-cosmos-card px-2.5 py-1 text-xs font-mono text-cosmos-text focus:outline-none focus:ring-1 focus:ring-cosmos-accent"
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

      <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border/70 text-xs font-sans space-y-1">
        <p className="text-cosmos-text-secondary leading-relaxed">
          Independent dual-axis trajectory alignment. Allows qualitative inspection of physiological trends across separate bodily systems (e.g., autonomic heart rate vs. peripheral oxygen saturation) without merging incompatible scale ranges.
        </p>
        <p className="text-semantic-caution font-medium">
          <strong>Caution:</strong> Co-movement visualization does not imply causal or physiological correlation. Confounding operational factors (such as exercise cycles or ambient temperature shifts) can influence separate biometrics independently.
        </p>
      </div>

      {/* Recharts Dual-Axis Comparison */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#30353A" strokeDasharray="3 3" opacity={0.6} />
            <XAxis
              dataKey="time"
              stroke="#70777D"
              tick={{ fill: '#A5A9AD', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
            />
            {/* Primary Left Axis */}
            <YAxis
              yAxisId="left"
              stroke="#F07832"
              tick={{ fill: '#F07832', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              domain={['auto', 'auto']}
              unit={` ${primaryVital.unit}`}
            />
            {/* Secondary Right Axis */}
            {secondaryVital && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#7D9CCB"
                tick={{ fill: '#7D9CCB', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                domain={['auto', 'auto']}
                unit={` ${secondaryVital.unit}`}
              />
            )}
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#191C20',
                borderColor: '#30353A',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                color: '#F4F1EA',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              name={`${primaryVital.name} (${primaryVital.unit})`}
              dataKey="primaryVal"
              stroke="#F07832"
              strokeWidth={2}
              dot={false}
            />
            {secondaryVital && (
              <Line
                yAxisId="right"
                type="monotone"
                name={`${secondaryVital.name} (${secondaryVital.unit})`}
                dataKey="secondaryVal"
                stroke="#7D9CCB"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-cosmos-border/60 flex items-center justify-between text-[11px] font-mono text-cosmos-muted">
        <span>Dual independent scales preserved</span>
        <span className="text-semantic-caution">Statistical correlation exploratory tool only</span>
      </div>
    </Card>
  );
};
