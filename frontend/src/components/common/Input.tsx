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
          <label htmlFor={inputId} className="block text-xs font-semibold text-content-secondary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border border-surface-border bg-white px-3 py-1.5 text-sm text-content-main placeholder:text-content-muted shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-semantic-critical focus-visible:ring-semantic-critical/20',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-content-muted">{hint}</p>}
        {error && <p className="text-xs text-semantic-critical font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
