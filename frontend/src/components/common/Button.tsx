import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cosmos-accent disabled:opacity-50 disabled:pointer-events-none rounded';

    const variants = {
      primary: 'bg-cosmos-accent hover:bg-cosmos-accent-secondary text-cosmos-bg font-semibold shadow-sm',
      secondary: 'bg-cosmos-elevated hover:bg-cosmos-card text-cosmos-text border border-cosmos-border',
      outline: 'border border-cosmos-border hover:border-cosmos-accent text-cosmos-text hover:bg-cosmos-elevated/40',
      ghost: 'text-cosmos-text-secondary hover:text-cosmos-text hover:bg-cosmos-elevated/50',
      danger: 'bg-semantic-priority/20 text-semantic-priority hover:bg-semantic-priority/30 border border-semantic-priority/40',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs tracking-wide',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
