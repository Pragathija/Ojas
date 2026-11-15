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
    <Card className="p-6 space-y-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <div className="flex items-center justify-between border-b border-[#EAE6F2] pb-3">
        <div>
          <h3 className="font-heading text-base font-bold text-content-main">
            {variableName} Stratification
          </h3>
          <p className="font-mono text-xs text-content-secondary mt-0.5">
            Cohort population distribution binning across mission epochs.
          </p>
        </div>
        <Badge variant="purple" size="sm">COHORT HISTOGRAM</Badge>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center font-mono text-xs text-content-muted">
          Binning cohort observations...
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid stroke="#EAE6F2" strokeDasharray="3 3" opacity={0.8} />
              <XAxis
                dataKey="binRange"
                stroke="#8C869E"
                tick={{ fill: '#716B83', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                stroke="#8C869E"
                tick={{ fill: '#716B83', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
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
                formatter={(val) => [`${val ?? 0} profiles (${data.find(d => d.count === val)?.percentage || 0}%)`, 'Cohort Frequency']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 2 ? '#7656D9' : index === 3 ? '#10B981' : index === 1 ? '#8B78C6' : '#C4B5FD'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[11px] font-mono text-content-muted">
        <div className="flex items-center gap-1.5 text-primary">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>NASA OSDR Spaceflight Cohort Distribution</span>
        </div>
        <span className="text-primary font-bold">Empirical Verification</span>
      </div>
    </Card>
  );
};
