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
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 rounded-full border-2 border-primary-light"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="font-mono text-xs text-content-secondary tracking-wider uppercase font-semibold">{label}</p>
    </div>
  );
};
