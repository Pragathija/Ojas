import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-cosmos-text-secondary">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded border border-cosmos-border bg-cosmos-card px-3 py-1 text-sm text-cosmos-text transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cosmos-accent focus-visible:border-cosmos-accent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-semantic-priority',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-cosmos-card text-cosmos-text">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-semantic-priority">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
