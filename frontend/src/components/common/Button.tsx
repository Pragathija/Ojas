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
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none rounded-lg';

    const variants = {
      primary: 'bg-primary hover:bg-primary-dark text-white font-semibold shadow-soft hover:shadow-soft-md active:scale-[0.98]',
      secondary: 'bg-primary-light hover:bg-[#E4DDFF] text-primary border border-primary/25 font-semibold active:scale-[0.98]',
      outline: 'border border-surface-border hover:border-primary text-content-main hover:bg-surface-subtle active:scale-[0.98]',
      ghost: 'text-content-secondary hover:text-content-main hover:bg-primary-light/50',
      danger: 'bg-semantic-critical/10 text-semantic-critical hover:bg-semantic-critical/20 border border-semantic-critical/30',
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
