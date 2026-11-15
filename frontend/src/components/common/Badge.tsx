import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'normal' | 'caution' | 'priority' | 'info' | 'neutral' | 'accent' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    caution: 'bg-amber-50 text-amber-700 border-amber-200',
    priority: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-50 text-content-secondary border-surface-border',
    accent: 'bg-primary-light text-primary border-primary/20',
    purple: 'bg-primary-light text-primary font-semibold border-primary/25',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider uppercase font-mono',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
