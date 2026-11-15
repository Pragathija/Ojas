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
        'flex flex-col gap-4 border-b border-surface-border pb-6 tablet:flex-row tablet:items-center tablet:justify-between',
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl tablet:text-3xl font-bold tracking-tight text-content-main">
            {title}
          </h1>
          {badge}
        </div>
        {tagline && (
          <p className="text-xs font-mono font-medium text-content-secondary tracking-wider uppercase">
            {tagline}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
};
