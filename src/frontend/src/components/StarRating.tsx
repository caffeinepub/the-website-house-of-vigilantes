import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  onChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  interactive = false, 
  size = 'md',
  count,
  onChange 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = displayRating >= star;
          const halfFilled = !filled && displayRating >= star - 0.5;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  filled || halfFilled
                    ? 'fill-starry-secondary text-starry-secondary'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          );
        })}
      </div>
      {!interactive && count !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">
          ({count})
        </span>
      )}
    </div>
  );
}
