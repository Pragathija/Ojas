import React from 'react';
import { cn } from '../../utils/cn';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded border border-dashed border-cosmos-border p-8 text-center bg-cosmos-card/40',
        className
      )}
    >
      <div className="mb-3 text-cosmos-muted">
        {icon || <Inbox className="h-8 w-8 stroke-1" />}
      </div>
      <h4 className="font-heading text-sm font-medium text-cosmos-text">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-cosmos-text-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
