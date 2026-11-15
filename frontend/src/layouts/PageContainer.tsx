import React from 'react';
import { cn } from '../utils/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'xl',
  className,
  ...props
}) => {
  const maxWidths = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 py-6 tablet:px-6 laptop:py-8 space-y-6',
        maxWidths[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
