import React from 'react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Acquiring telemetry stream...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 space-y-3', className)}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-cosmos-border"></div>
        <div className="absolute inset-0 rounded-full border-2 border-cosmos-accent border-t-transparent animate-spin"></div>
      </div>
      <p className="font-mono text-xs text-cosmos-text-secondary tracking-wider uppercase">{label}</p>
    </div>
  );
};
