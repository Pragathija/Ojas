import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { HealthInsight } from '../../types/insights';
import { Lightbulb, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface InsightPanelProps {
  insights: HealthInsight[];
  onSelectInsight: (insight: HealthInsight) => void;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  insights,
  onSelectInsight,
}) => {
  return (
    <Card className="p-6 space-y-4 bg-white border-surface-border shadow-soft rounded-2xl">
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-content-main">
            AI Clinical Insights & Countermeasures
          </h3>
        </div>
        <Link to="/insights">
          <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1 text-primary hover:text-primary-dark">
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          title="No Active Anomaly Observations"
          description="Physiological indicators are operating within standard baseline corridors."
        />
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectInsight(item)}
              className="p-4 rounded-xl bg-surface-ground border border-surface-border hover:border-primary/40 hover:shadow-xs cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Badge variant={item.priority === 'high' ? 'priority' : item.priority === 'moderate' ? 'caution' : 'purple'} size="sm">
                  {item.category}
                </Badge>
                <span className="font-mono text-[10px] text-content-secondary">
                  {item.timestamp}
                </span>
              </div>

              <div className="text-xs font-bold text-content-main font-heading group-hover:text-primary transition-colors">
                {item.title}
              </div>

              <p className="text-[11px] text-content-secondary line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
