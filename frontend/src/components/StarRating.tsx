import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  showCount = false,
  count,
  interactive = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'min-w-[32px] min-h-[32px] p-1',
    md: 'min-w-[44px] min-h-[44px] p-2',
    lg: 'min-w-[48px] min-h-[48px] p-2',
  };

  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating);
          const isPartial = star === Math.ceil(displayRating) && displayRating % 1 !== 0;

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={cn(
                  'touch-target transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring rounded',
                  buttonSizeClasses[size]
                )}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    isFilled || isPartial
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-muted-foreground'
                  )}
                />
              </button>
            );
          }

          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                isFilled || isPartial
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-muted-foreground'
              )}
            />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs sm:text-sm text-muted-foreground ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
