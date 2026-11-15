import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-cosmos-text-secondary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded border border-cosmos-border bg-cosmos-card px-3 py-1 text-sm text-cosmos-text placeholder:text-cosmos-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cosmos-accent focus-visible:border-cosmos-accent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-semantic-priority focus-visible:ring-semantic-priority',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-cosmos-muted">{hint}</p>}
        {error && <p className="text-xs text-semantic-priority">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
