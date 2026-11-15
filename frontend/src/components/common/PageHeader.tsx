import React from 'react';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  title: string;
  tagline?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  tagline,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-cosmos-border pb-5 tablet:flex-row tablet:items-center tablet:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-cosmos-text">
            {title}
          </h1>
          {badge}
        </div>
        {tagline && (
          <p className="text-xs font-mono text-cosmos-text-secondary tracking-wide uppercase">
            {tagline}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
