import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { MissionTask } from '../../types/mission';
import { Dumbbell, Beaker, CheckCircle2, Clock } from 'lucide-react';

export interface MissionTimelineProps {
  tasks: MissionTask[];
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ tasks }) => {
  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Dumbbell className="h-4 w-4 text-cosmos-accent" />;
      case 'biomedical_sample':
        return <Beaker className="h-4 w-4 text-semantic-info" />;
      default:
        return <Clock className="h-4 w-4 text-cosmos-muted" />;
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
        <h3 className="font-heading text-base font-bold text-cosmos-text">
          Mission Activity & Protocol Schedule
        </h3>
        <Badge variant="neutral" size="sm">
          FLIGHT DAY 142
        </Badge>
      </div>

      <div className="space-y-4 pt-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-3 rounded bg-cosmos-elevated border border-cosmos-border"
          >
            <div className="p-2 rounded bg-cosmos-card border border-cosmos-border shrink-0 mt-0.5">
              {getTaskIcon(task.category)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold text-cosmos-text">
                  {task.title}
                </span>
                <span className="font-mono text-[10px] text-cosmos-muted">
                  {task.scheduledTime} ({task.durationMinutes}m)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-cosmos-text-secondary uppercase">{task.category}</span>
                <span>•</span>
                {task.completed ? (
                  <span className="text-semantic-normal flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>COMPLETED & LOGGED</span>
                  </span>
                ) : (
                  <span className="text-semantic-caution">PENDING SCHEDULE</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
