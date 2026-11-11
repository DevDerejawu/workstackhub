import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md';
  rounded?: 'full' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      rounded = 'full',
      className = '',
      ...nativeProps
    },
    ref
  ) => {
    const variants = {
      default:
        'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
      success:
        'bg-success/10 text-success-foreground hover:bg-success/20',
      warning:
        'bg-warning/10 text-warning-foreground hover:bg-warning/20',
      error:
        'bg-destructive/10 text-destructive hover:bg-destructive/20',
      info: 'bg-info/10 text-info-foreground hover:bg-info/20',
      purple: 'bg-purple/10 text-purple-foreground hover:bg-purple/20',
    };

    const sizes = {
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    };

    const radius = {
      full: 'rounded-full',
      md: 'rounded-md',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1 font-medium transition-colors duration-200 ${
          variants[variant]
        } ${sizes[size]} ${radius[rounded]} ${className}`}
        {...nativeProps}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
export { Badge };
export type { BadgeProps };