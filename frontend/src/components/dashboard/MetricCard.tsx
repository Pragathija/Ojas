import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
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
        return <ArrowUpRight className="h-3.5 w-3.5 text-cosmos-accent" />;
      case 'decreasing':
        return <ArrowDownRight className="h-3.5 w-3.5 text-semantic-info" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-cosmos-muted" />;
    }
  };

  const statusVariant = vital.status === 'caution' ? 'caution' : 'normal';

  return (
    <Card
      interactive
      onClick={onClick}
      className={cn(
        'p-4 transition-all duration-150 flex flex-col justify-between space-y-3',
        isSelected
          ? 'border-cosmos-accent bg-cosmos-elevated shadow-md'
          : 'hover:border-cosmos-border/80'
      )}
    >
      {/* Top Header: Category & Status */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-cosmos-muted uppercase tracking-wider">
          {vital.category}
        </span>
        <Badge variant={statusVariant} size="sm">
          {vital.status.toUpperCase()}
        </Badge>
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-cosmos-text truncate font-heading">
          {vital.name}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-cosmos-text tabular-nums">
            {vital.currentValue}
          </span>
          <span className="font-mono text-xs text-cosmos-text-secondary">{vital.unit}</span>
        </div>
      </div>

      {/* Technical Footer */}
      <div className="pt-2 border-t border-cosmos-border/60 flex items-center justify-between text-[10px] font-mono text-cosmos-muted">
        <div className="flex items-center gap-1">
          {getTrendIcon(vital.trend)}
          <span className="capitalize">{vital.trend}</span>
        </div>
        <div className="flex items-center gap-1 hover:text-cosmos-accent transition-colors">
          <span>INSPECT</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Card>
  );
};
