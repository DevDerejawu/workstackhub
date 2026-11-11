import { type HTMLAttributes, forwardRef } from 'react';

interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange?: (value: number) => void;  
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  max?: number;
}
const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      onChange,
      readonly = false,
      size = 'md',
      max = 5,
      className = '',
      ...nativeProps
    },
    ref
  ) => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-xl',
      lg: 'text-2xl',
    };

    const handleClick = (starValue: number) => {
      if (!readonly && onChange) {
        onChange(starValue);
      }
    };

    return (
      <div
        ref={ref}
        className={`flex gap-1 ${className}`}
        {...nativeProps}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            className={`${sizes[size]} ${
              readonly ? 'cursor-default' : 'cursor-pointer'
            } transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded`}
            disabled={readonly}
            aria-label={`Rate ${star} out of ${max}`}
          >
            <span
              className={
                star <= value
                  ? 'text-warning' // use warning color for filled stars
                  : 'text-muted-foreground/30'
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>
    );
  }
);

Rating.displayName = 'Rating';
export { Rating };
export type { RatingProps };