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
        'flex flex-col items-center justify-center rounded border border-semantic-priority/30 bg-semantic-priority/5 p-6 text-center',
        className
      )}
    >
      <div className="mb-2 text-semantic-priority">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h4 className="font-heading text-sm font-medium text-cosmos-text">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-cosmos-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-semantic-priority/40 hover:bg-semantic-priority/10">
          Re-establish Connection
        </Button>
      )}
    </div>
  );
};
