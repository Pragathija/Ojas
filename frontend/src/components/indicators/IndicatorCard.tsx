import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { VitalSign } from '../../types/health';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight, ShieldAlert } from 'lucide-react';

export interface IndicatorCardProps {
  vital: VitalSign;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
  vital,
  isSelected = false,
  onSelect,
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUpRight className="h-3.5 w-3.5 text-primary" />;
      case 'decreasing':
        return <ArrowDownRight className="h-3.5 w-3.5 text-[#2F7BE5]" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-content-muted" />;
    }
  };

  return (
    <Card
      interactive={Boolean(onSelect)}
      onClick={onSelect}
      className={`p-5 flex flex-col justify-between space-y-4 transition-all rounded-2xl border ${
        isSelected
          ? 'border-primary bg-pastel-lavender/40 shadow-soft ring-2 ring-primary/20'
          : 'bg-white border-[#EAE6F2] hover:border-primary/40 hover:shadow-soft'
      }`}
    >
      <div className="space-y-2">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="purple" size="sm">{vital.category.toUpperCase()}</Badge>
          <Badge variant={vital.status === 'caution' ? 'caution' : 'normal'} size="sm">
            {vital.status.toUpperCase()}
          </Badge>
        </div>

        {/* Title & Scientific Description */}
        <div>
          <h3 className="font-heading text-lg font-bold text-content-main">
            {vital.name} ({vital.symbol})
          </h3>
          <p className="text-xs text-content-secondary line-clamp-2 mt-1 leading-relaxed">
            {vital.scientificDescription}
          </p>
        </div>

        {/* Value Display */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-mono text-3xl font-bold text-content-main tabular-nums">
            {vital.currentValue}
          </span>
          <span className="font-mono text-xs text-content-secondary">{vital.unit}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="space-y-2 pt-3 border-t border-[#EAE6F2] text-[10px] font-mono">
        <div className="flex items-center justify-between text-content-muted">
          <span>Corridor: {vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit}</span>
          <div className="flex items-center gap-1 text-content-secondary">
            {getTrendIcon(vital.trend)}
            <span className="capitalize">{vital.trend}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-content-muted">{vital.confidence}% Quality</span>
          <div className="flex items-center gap-0.5 text-primary font-bold">
            <span>INSPECT</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Card>
  );
};