import React from 'react';
import { Badge } from '../common/Badge';
import { Clock, ShieldAlert, Radio } from 'lucide-react';
import { isUsingMockData } from '../../services';
import { AstronautProfile } from '../../types/health';

export interface DashboardWelcomeProps {
  astronaut: AstronautProfile;
  lastUpdated: string;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  astronaut,
  lastUpdated,
}) => {
  return (
    <div className="rounded border border-cosmos-border bg-cosmos-bg-secondary p-6 space-y-4">
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4">
        {/* Editorial Heading */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cosmos-accent tracking-widest uppercase">
              FLIGHT DECK TELEMETRY
            </span>
            <span className="text-cosmos-muted">•</span>
            <span className="font-mono text-xs text-cosmos-muted">
              MET: DAY {astronaut.totalSpaceflightDays}
            </span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-3xl font-bold tracking-tight text-cosmos-text">
            Your mission. Your health.
          </h1>
          <p className="text-sm text-cosmos-text-secondary max-w-2xl leading-relaxed">
            Understand your recorded physiological observations and explore how they change over time.
          </p>
        </div>

        {/* Operational Context Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="normal" className="gap-1.5 py-1 px-2.5">
            <Radio className="h-3 w-3 text-semantic-normal" />
            <span>ROLE: {astronaut.missionRole.toUpperCase()}</span>
          </Badge>

          <Badge variant="neutral" className="gap-1.5 py-1 px-2.5">
            <Clock className="h-3 w-3 text-cosmos-muted" />
            <span>UPDATED: {lastUpdated}</span>
          </Badge>

          {isUsingMockData && (
            <Badge variant="caution" className="gap-1.5 py-1 px-2.5">
              <ShieldAlert className="h-3 w-3 text-semantic-caution" />
              <span>SYNTHETIC DEMONSTRATION</span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
