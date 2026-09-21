'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      isLoading,
      iconLeft,
      iconRight,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = 'button';
    const isDisabled = disabled || isLoading;

    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-gold-500 text-navy-900 hover:bg-gold-400',
      secondary: 'bg-navy-900 text-white hover:bg-navy-800',
      outline: 'border border-navy-900 text-navy-900 hover:bg-navy-50',
      ghost: 'hover:bg-navy-50 hover:text-navy-900',
      whatsapp: 'bg-[#25D366] text-white hover:bg-[#128C7E]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-11 px-4 py-2 text-sm',
      lg: 'h-14 px-8 text-base',
    };

    // If using asChild, we wrap the custom child element with motion in a way that respects it,
    // or just rely on motion.div wrapper.
    if (asChild && React.isValidElement(children)) {
      return (
        <motion.div
          whileHover={isDisabled ? {} : { scale: 1.02 }}
          whileTap={isDisabled ? {} : { scale: 0.98 }}
          className={cn("inline-block", className)}
        >
          {React.cloneElement(children as React.ReactElement, {
            className: cn(baseStyles, variants[variant], sizes[size], children.props.className),
            ref,
            disabled: isDisabled,
            ...props
          })}
        </motion.div>
      );
    }

    return (
      <motion.div
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        className="inline-block"
      >
        <Comp
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {!isLoading && iconLeft && <span className="me-2">{iconLeft}</span>}
          {children}
          {!isLoading && iconRight && <span className="ms-2">{iconRight}</span>}
        </Comp>
      </motion.div>
    );
  }
);
Button.displayName = 'Button';

export { Button };
