import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, iconStart, iconEnd, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-navy-800">
            {label}
          </label>
        )}
        <div className="relative">
          {iconStart && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-navy-700">
              {iconStart}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-11 w-full rounded-md border border-cream-100 bg-cream-50 px-3 py-2 text-sm text-navy-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-navy-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              iconStart && 'ps-10',
              iconEnd && 'pe-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {iconEnd && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 text-navy-700">
              {iconEnd}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
