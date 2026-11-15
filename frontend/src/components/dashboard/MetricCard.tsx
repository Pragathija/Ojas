import React from 'react';
import { Card } from '../common/Card';
import { VitalSign } from '../../types/health';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  vital: VitalSign;
  isSelected?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  vital,
  isSelected = false,
  onClick,
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUpRight className="h-3 w-3 text-primary" />;
      case 'decreasing':
        return <ArrowDownRight className="h-3 w-3 text-blue-600" />;
      default:
        return <Minus className="h-3 w-3 text-content-muted" />;
    }
  };

  const corridorMin = vital.nominalRange ? vital.nominalRange[0] : 0;
  const corridorMax = vital.nominalRange ? vital.nominalRange[1] : 100;
  const rangeSpan = corridorMax - corridorMin;
  const rawPos = rangeSpan > 0 ? ((vital.currentValue - corridorMin) / rangeSpan) * 100 : 50;
  const clampedPos = Math.max(10, Math.min(90, rawPos));

  const isNominal = vital.status === 'normal';

  return (
    <Card
      interactive
      onClick={onClick}
      className={cn(
        'group p-4 transition-all duration-200 flex flex-col justify-between space-y-3 rounded-2xl border',
        isSelected
          ? 'border-primary bg-purple-50/50 shadow-soft-md ring-2 ring-primary/20'
          : 'bg-white border-[#EAE6F2] hover:border-primary/40 hover:shadow-soft'
      )}
    >
      {/* Top Header: Symbol & Status Pill */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-black text-primary tracking-wider">
          {vital.symbol}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border',
            isNominal
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isNominal ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            )}
          />
          {isNominal ? 'Nominal' : 'Variance'}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-content-secondary truncate">
          {vital.name}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-black text-2xl tablet:text-3xl text-content-main tabular-nums tracking-tight">
            {vital.currentValue}
          </span>
          <span className="font-mono text-xs font-semibold text-content-muted">{vital.unit}</span>
        </div>
      </div>

      {/* Visual Corridor Gauge Bar */}
      <div className="space-y-1 pt-1">
        <div className="h-1.5 w-full bg-[#FAF9FF] rounded-full relative overflow-hidden border border-[#EAE6F2]">
          {/* Target band corridor */}
          <div
            className="absolute top-0 bottom-0 bg-primary/20 rounded-full"
            style={{ left: '15%', right: '15%' }}
          />
          {/* Value marker */}
          <div
            className="absolute top-0 bottom-0 w-2 bg-primary rounded-full -ml-1 shadow-xs"
            style={{ left: `${clampedPos}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-content-muted">
          <span>{corridorMin}</span>
          <span className="text-[9px] text-primary font-bold">CORRIDOR</span>
          <span>{corridorMax}</span>
        </div>
      </div>

      {/* Technical Footer */}
      <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[11px] font-mono text-content-secondary">
        <div className="flex items-center gap-1 text-content-muted">
          {getTrendIcon(vital.trend)}
          <span className="capitalize text-[10px] font-medium">{vital.trend}</span>
        </div>
        <div className="flex items-center gap-0.5 text-primary text-[10px] font-bold group-hover:translate-x-0.5 transition-transform">
          <span>Inspect</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Card>
  );
};
