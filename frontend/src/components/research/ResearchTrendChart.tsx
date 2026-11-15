import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ResearchObservationPoint } from '../../types/research';
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

export interface ResearchTrendChartProps {
  variableName: string;
  observations: ResearchObservationPoint[];
  isLoading: boolean;
}

export const ResearchTrendChart: React.FC<ResearchTrendChartProps> = ({
  variableName,
  observations,
  isLoading,
}) => {
  const chartData = observations.map((obs) => ({
    flightDay: `Day ${obs.flightDay}`,
    value: obs.observedValue,
    unit: obs.unit,
    condition: obs.condition,
    sampleId: obs.sampleId,
  }));

  const unit = observations[0]?.unit || '';
  const corridor = observations[0]?.nominalCorridor || [95, 100];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-cosmos-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-bold text-cosmos-text">
              {variableName}
            </h3>
            <Badge variant="caution" size="sm">SYNTHETIC ILLUSTRATIVE MODEL</Badge>
          </div>
          <p className="font-mono text-xs text-cosmos-muted mt-0.5">
            Synthetic curve parameterized for UI demonstration. No direct raw NASA measurements claimed.
          </p>
        </div>
        <div className="font-mono text-xs text-cosmos-muted">
          CORRIDOR: {corridor[0]}–{corridor[1]} {unit}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center font-mono text-xs text-cosmos-muted">
          Compiling series...
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#30353A" strokeDasharray="3 3" opacity={0.6} />
              <XAxis
                dataKey="flightDay"
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
                formatter={(val) => [`${val ?? 'N/A'} ${unit}`, 'Simulated Value']}
              />
              <ReferenceLine
                y={corridor[0]}
                stroke="#53B68A"
                strokeDasharray="4 4"
                label={{
                  value: `Min: ${corridor[0]} ${unit}`,
                  fill: '#53B68A',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideBottomRight',
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
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>SYNTHETIC VALUES: Generated for demonstration; references literature for context only.</span>
        </div>
        <span>Illustrative Demo Only</span>
      </div>
    </Card>
  );
};
