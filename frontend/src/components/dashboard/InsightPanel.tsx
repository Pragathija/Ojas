import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { HealthInsight } from '../../types/insights';
import { Lightbulb, ChevronRight } from 'lucide-react';
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
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-cosmos-accent" />
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            Health Insights & Actions
          </h3>
        </div>
        <Link to="/insights">
          <Button variant="ghost" size="sm" className="text-xs font-mono gap-1 text-cosmos-accent">
            <span>VIEW ALL</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {insights.length === 0 ? (
        <EmptyState
          title="No Active Observations"
          description="Physiological indicators are running within standard baseline corridors."
        />
      ) : (
        <div className="space-y-3">
          {insights.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectInsight(item)}
              className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border hover:border-cosmos-accent/40 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant={item.priority === 'moderate' ? 'caution' : 'neutral'} size="sm">
                  {item.category}
                </Badge>
                <span className="font-mono text-[10px] text-cosmos-muted">
                  {item.timestamp}
                </span>
              </div>

              <div className="text-xs font-semibold text-cosmos-text font-heading">
                {item.title}
              </div>

              <p className="text-[11px] text-cosmos-text-secondary line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
