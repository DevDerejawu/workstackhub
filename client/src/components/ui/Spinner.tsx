import { cn } from "../../lib/tw.merge/cn"; 
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'amber' | 'green' | 'blue' | 'red' | 'gray' | 'primary';
  variant?: 'border' | 'dot' | 'pulse';
  thickness?: 'thin' | 'normal' | 'thick';
  className?: string;
}

// Mapping for CSS variable colors (for border spinner)
const colorBorderMap: Record<NonNullable<SpinnerProps['color']>, string> = {
  white: 'border-white border-t-transparent',
  amber: 'border-warning border-t-transparent',
  green: 'border-success border-t-transparent',
  blue: 'border-info border-t-transparent',
  red: 'border-destructive border-t-transparent',
  gray: 'border-muted-foreground border-t-transparent',
  primary: 'border-primary border-t-transparent',
};

// Mapping for dot/pulse background colors (using CSS variables)
const colorBgMap: Record<NonNullable<SpinnerProps['color']>, string> = {
  white: 'bg-white',
  amber: 'bg-warning',
  green: 'bg-success',
  blue: 'bg-info',
  red: 'bg-destructive',
  gray: 'bg-muted-foreground',
  primary: 'bg-primary',
};

export default function Spinner({
  size = 'sm',
  color = 'primary',
  variant = 'dot',
  thickness = 'normal',
  className = '',
}: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  const thicknessClasses = {
    thin: 'border-2',
    normal: 'border-[2.5px]',
    thick: 'border-4',
  };

  // Border spinner
  if (variant === 'border') {
    return (
      <div
        className={cn(
          sizeClasses[size],
          thicknessClasses[thickness],
          colorBorderMap[color],
          'animate-spin rounded-full',
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Dot spinner (3 dots bouncing)
  if (variant === 'dot') {
    const dotColor = colorBgMap[color];
    return (
      <div
        className={cn('flex gap-1 items-center', className)}
        role="status"
        aria-label="Loading"
      >
        <div
          className={cn(
            sizeClasses[size],
            dotColor,
            'rounded-full animate-bounce [animation-delay:-0.3s]'
          )}
        />
        <div
          className={cn(
            sizeClasses[size],
            dotColor,
            'rounded-full animate-bounce [animation-delay:-0.15s]'
          )}
        />
        <div
          className={cn(sizeClasses[size], dotColor, 'rounded-full animate-bounce')}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Pulse spinner (pulsing circle)
  if (variant === 'pulse') {
    const pulseColor = colorBgMap[color] + '/30'; 
    const mainColor = colorBgMap[color];
    return (
      <div className={cn('relative', className)} role="status" aria-label="Loading">
        <div
          className={cn(
            sizeClasses[size],
            pulseColor,
            'rounded-full animate-ping'
          )}
        />
        <div
          className={cn(
            sizeClasses[size],
            mainColor,
            'rounded-full absolute top-0 left-0 animate-pulse'
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return null;
}