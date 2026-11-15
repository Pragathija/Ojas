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
    <Card className="p-6 space-y-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-[#EAE6F2] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-bold text-content-main">
              {variableName}
            </h3>
            <Badge variant="purple" size="sm">EMPIRICAL MODEL</Badge>
          </div>
          <p className="font-mono text-xs text-content-secondary mt-0.5">
            Spaceflight trajectory parameter curve indexed from NASA research cohorts.
          </p>
        </div>
        <div className="font-mono text-xs text-content-muted">
          CORRIDOR: {corridor[0]}–{corridor[1]} {unit}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center font-mono text-xs text-content-muted">
          Compiling series...
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#EAE6F2" strokeDasharray="3 3" opacity={0.8} />
              <XAxis
                dataKey="flightDay"
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
                formatter={(val) => [`${val ?? 'N/A'} ${unit}`, 'Observed Parameter']}
              />
              <ReferenceLine
                y={corridor[0]}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{
                  value: `Min: ${corridor[0]} ${unit}`,
                  fill: '#10B981',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono',
                  position: 'insideBottomRight',
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
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>NASA Open Science Data Repository cohort trajectory curve.</span>
        </div>
        <span className="text-primary font-bold">OSDR Verified</span>
      </div>
    </Card>
  );
};
