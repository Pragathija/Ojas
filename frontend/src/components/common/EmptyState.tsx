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
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border p-8 text-center bg-white shadow-soft',
        className
      )}
    >
      <div className="mb-3 p-3 rounded-full bg-primary-light text-primary">
        {icon || <Inbox className="h-6 w-6 stroke-1.5" />}
      </div>
      <h4 className="font-heading text-sm font-semibold text-content-main">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-content-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
