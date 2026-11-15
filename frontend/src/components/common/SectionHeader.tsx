import React from 'react';
import { cn } from '../../utils/cn';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <div>
        <h2 className="font-heading text-sm font-semibold tracking-wider uppercase text-cosmos-text">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-cosmos-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
