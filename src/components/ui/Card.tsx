import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  className,
  children,
  hover = false,
  padding = 'md',
  ...props
}: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-cream-100 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-md',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
