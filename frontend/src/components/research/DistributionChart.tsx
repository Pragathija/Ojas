import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { DistributionBin } from '../../types/research';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ShieldAlert } from 'lucide-react';

export interface DistributionChartProps {
  variableName: string;
  data: DistributionBin[];
  isLoading: boolean;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  variableName,
  data,
  isLoading,
}) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
        <div>
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            {variableName} Stratification
          </h3>
          <p className="font-mono text-xs text-cosmos-muted mt-0.5">
            Illustrative population stratification binning based on simulated countermeasure adherence.
          </p>
        </div>
        <Badge variant="caution" size="sm">SIMULATED HISTOGRAM</Badge>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center font-mono text-xs text-cosmos-muted">
          Binning simulated cohort observations...
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid stroke="#30353A" strokeDasharray="3 3" opacity={0.6} />
              <XAxis
                dataKey="binRange"
                stroke="#70777D"
                tick={{ fill: '#A5A9AD', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                stroke="#70777D"
                tick={{ fill: '#A5A9AD', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
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
                formatter={(val) => [`${val ?? 0} profiles (${data.find(d => d.count === val)?.percentage || 0}%)`, 'Simulated Frequency']}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 2 ? '#F07832' : index === 3 ? '#53B68A' : index === 1 ? '#E7B45B' : '#E36B58'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="pt-2 border-t border-cosmos-border/60 flex items-center justify-between text-[11px] font-mono text-cosmos-muted">
        <div className="flex items-center gap-1.5 text-semantic-caution">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>SYNTHETIC DEMONSTRATION DATA</span>
        </div>
        <span>Illustrative Demo Only</span>
      </div>
    </Card>
  );
};
