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
        return <ArrowUpRight className="h-3.5 w-3.5 text-cosmos-accent" />;
      case 'decreasing':
        return <ArrowDownRight className="h-3.5 w-3.5 text-semantic-info" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-cosmos-muted" />;
    }
  };

  return (
    <Card
      interactive={Boolean(onSelect)}
      onClick={onSelect}
      className={`p-5 flex flex-col justify-between space-y-4 transition-all ${
        isSelected ? 'border-cosmos-accent bg-cosmos-elevated shadow-lg' : 'hover:border-cosmos-border/80'
      }`}
    >
      <div className="space-y-2">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="neutral" size="sm">{vital.category.toUpperCase()}</Badge>
          <Badge variant={vital.status === 'caution' ? 'caution' : 'normal'} size="sm">
            {vital.status.toUpperCase()}
          </Badge>
        </div>

        {/* Title & Scientific Description */}
        <div>
          <h3 className="font-heading text-lg font-bold text-cosmos-text">
            {vital.name} ({vital.symbol})
          </h3>
          <p className="text-xs text-cosmos-text-secondary line-clamp-2 mt-1 leading-relaxed">
            {vital.scientificDescription}
          </p>
        </div>

        {/* Value Display */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-mono text-3xl font-bold text-cosmos-text tabular-nums">
            {vital.currentValue}
          </span>
          <span className="font-mono text-xs text-cosmos-text-secondary">{vital.unit}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="space-y-2 pt-3 border-t border-cosmos-border/60 text-[10px] font-mono">
        <div className="flex items-center justify-between text-cosmos-muted">
          <span>Ref Band: {vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit}</span>
          <div className="flex items-center gap-1 text-cosmos-text-secondary">
            {getTrendIcon(vital.trend)}
            <span className="capitalize">{vital.trend}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-semantic-caution">
            <ShieldAlert className="h-3 w-3" />
            <span>SYNTHETIC DEMO</span>
          </div>
          <div className="flex items-center gap-1 text-cosmos-accent font-semibold hover:underline">
            <span>INSPECT</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Card>
  );
};
