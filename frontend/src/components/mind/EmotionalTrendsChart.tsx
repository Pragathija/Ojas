import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
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
import { Info, ShieldAlert, HeartHandshake } from 'lucide-react';

const SAMPLE_TREND_DATA = [
  { day: 'Day 36', stress: 4, energy: 8, moodScore: 8, label: 'Focused' },
  { day: 'Day 37', stress: 5, energy: 7, moodScore: 7, label: 'Calm' },
  { day: 'Day 38', stress: 6, energy: 6, moodScore: 6, label: 'Tired' },
  { day: 'Day 39', stress: 3, energy: 8, moodScore: 9, label: 'Happy' },
  { day: 'Day 40', stress: 4, energy: 7, moodScore: 8, label: 'Calm' },
  { day: 'Day 41', stress: 5, energy: 7, moodScore: 7, label: 'Focused' },
  { day: 'Day 42', stress: 3, energy: 8, moodScore: 9, label: 'Calm' },
];

export const EmotionalTrendsChart: React.FC = () => {
  return (
    <Card className="p-6 tablet:p-8 space-y-6 border-[#EAE6F2] shadow-soft">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              LONGITUDINAL SELF-ASSESSMENT
            </span>
            <Badge variant="purple" size="sm">VOLUNTARY REVIEWS</Badge>
          </div>
          <h2 className="font-heading text-xl tablet:text-2xl font-bold text-content-main mt-1">
            Emotional Wellness & Energy Trajectory
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Self-reported perceived load versus vital energy across flight days.
          </p>
        </div>
        <div className="font-mono text-xs text-content-secondary">
          LAST 7 FLIGHT DAYS (SAMPLE N=7)
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SAMPLE_TREND_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#EAE6F2" strokeDasharray="3 3" opacity={0.8} />
            <XAxis
              dataKey="day"
              stroke="#A5A0B8"
              tick={{ fill: '#777187', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
            />
            <YAxis
              domain={[1, 10]}
              stroke="#A5A0B8"
              tick={{ fill: '#777187', fontSize: 11, fontFamily: 'JetBrains Mono' }}
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
                color: '#29243A',
              }}
              formatter={(value, name) => [
                `${value} / 10`,
                name === 'energy' ? 'Vital Energy' : name === 'stress' ? 'Perceived Load' : 'Mood Rating',
              ]}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              name="energy"
              dataKey="energy"
              stroke="#7656D9"
              strokeWidth={2.5}
              dot={{ fill: '#7656D9', r: 3 }}
              activeDot={{ r: 5, fill: '#5535A5' }}
            />
            <Line
              type="monotone"
              name="stress"
              dataKey="stress"
              stroke="#E9A23B"
              strokeWidth={2.5}
              dot={{ fill: '#E9A23B', r: 3 }}
              activeDot={{ r: 5, fill: '#D97706' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distinct Data Provenance & Safety Disclaimer */}
      <div className="p-4 rounded-xl bg-pastel-blue/60 border border-[#BFDBFE] space-y-2 text-xs font-sans">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
          <Info className="h-4 w-4 text-[#2F7BE5]" />
          <span>METHODOLOGICAL CLASSIFICATION: SELF-REPORTED DATA</span>
        </div>
        <p className="text-content-secondary leading-relaxed text-[11px]">
          These scores are derived purely from voluntary astronaut check-ins and are explicitly separated from telemetry biosensors (e.g. ECG, PPG, actigraphy).
        </p>
        <p className="text-[11px] text-content-main font-medium border-t border-[#BFDBFE]/70 pt-2 flex items-start gap-1.5">
          <HeartHandshake className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Non-Diagnostic Notice:</strong> Ojas is an astronaut wellness support system and does not formulate psychiatric or psychological clinical diagnoses (such as depression, anxiety, or PTSD). This tool is not a replacement for certified aerospace medicine or behavioral health support.
          </span>
        </p>
      </div>
    </Card>
  );
};