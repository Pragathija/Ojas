import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Downlink Signal Interrupted',
  message = 'Telemetry data could not be parsed or connection was lost.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center shadow-soft',
        className
      )}
    >
      <div className="mb-2 p-2.5 rounded-full bg-rose-100 text-semantic-critical">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="font-heading text-sm font-bold text-content-main">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-content-secondary">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100/50">
          Re-establish Connection
        </Button>
      )}
    </div>
  );
};
