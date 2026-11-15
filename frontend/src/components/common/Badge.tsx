import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'normal' | 'caution' | 'priority' | 'info' | 'neutral' | 'accent';
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
    normal: 'bg-semantic-normal/15 text-semantic-normal border-semantic-normal/30',
    caution: 'bg-semantic-caution/15 text-semantic-caution border-semantic-caution/30',
    priority: 'bg-semantic-priority/15 text-semantic-priority border-semantic-priority/30',
    info: 'bg-semantic-info/15 text-semantic-info border-semantic-info/30',
    neutral: 'bg-cosmos-elevated text-cosmos-text-secondary border-cosmos-border',
    accent: 'bg-cosmos-accent/15 text-cosmos-accent border-cosmos-accent/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider uppercase',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium border rounded',
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
