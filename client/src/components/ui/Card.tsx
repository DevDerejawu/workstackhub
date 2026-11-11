// components/ui/Card.tsx
import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      className = '',
      ...nativeProps
    },
    ref
  ) => {
    const variants = {
      default: 'bg-card text-card-foreground rounded-xl shadow-sm',
      hover:
        'bg-card text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer',
      elevated: 'bg-card text-card-foreground rounded-xl shadow-lg',
      bordered:
        'bg-card text-card-foreground rounded-xl border border-border',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${paddings[padding]} ${className}`}
        {...nativeProps}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export { Card };
export type { CardProps };