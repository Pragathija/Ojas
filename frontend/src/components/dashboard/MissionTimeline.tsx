import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { MissionTask } from '../../types/mission';
import { Dumbbell, Beaker, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export interface MissionTimelineProps {
  tasks: MissionTask[];
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ tasks }) => {
  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Dumbbell className="h-4 w-4 text-primary" />;
      case 'biomedical_sample':
        return <Beaker className="h-4 w-4 text-indigo-600" />;
      default:
        return <Clock className="h-4 w-4 text-content-muted" />;
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-white border-surface-border shadow-soft rounded-2xl">
      <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-content-main">
            Daily Protocol & Habit Milestones
          </h3>
        </div>
        <Badge variant="purple" size="sm">
          DAY 42 OF 180
        </Badge>
      </div>

      <div className="space-y-3 pt-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
              task.completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-surface-ground border-surface-border'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 shadow-xs ${
              task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-primary border border-surface-border'
            }`}>
              {getTaskIcon(task.category)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-content-main">
                  {task.title}
                </span>
                <span className="font-mono text-[10px] text-content-secondary font-medium">
                  {task.scheduledTime} ({task.durationMinutes}m)
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Badge variant={task.completed ? 'normal' : 'neutral'} size="sm">
                  {task.category.toUpperCase().replace('_', ' ')}
                </Badge>
                {task.completed ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> VERIFIED (+50 XP)
                  </span>
                ) : (
                  <span className="font-mono text-[10px] font-semibold text-primary">
                    SCHEDULED
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
