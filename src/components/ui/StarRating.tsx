'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  isInteractive?: boolean;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  isInteractive = false,
  readOnly = false,
  onChange,
  className,
}: StarRatingProps) {
  const interactive = isInteractive && !readOnly;
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxRating} stars`}
      onMouseLeave={() => interactive && setHoverRating(null)}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = displayRating >= starValue;
        const isHalf = !isFilled && displayRating >= starValue - 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            className={cn(
              'focus:outline-none transition-transform relative',
              interactive ? 'cursor-pointer hover:scale-110 focus-visible:ring-2 focus-visible:ring-gold-500 rounded-sm' : 'cursor-default'
            )}
            aria-label={interactive ? `Rate ${starValue} stars` : undefined}
            aria-checked={interactive ? starValue === Math.round(rating) : undefined}
            role={interactive ? 'radio' : undefined}
          >
            <div className="relative">
              <Star
                size={size}
                className={cn(
                  'text-cream-100 transition-colors',
                  isFilled && 'text-gold-500 fill-gold-500'
                )}
              />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-[50%] rtl:right-0 rtl:left-auto text-gold-500">
                  <Star size={size} className="fill-gold-500" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
