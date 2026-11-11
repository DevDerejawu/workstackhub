// components/ui/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import Spinner  from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      loading = false,
      disabled = false,
      type = 'button',
      className = '',
      onClick,
      asChild = false,
      ...nativeProps
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 shadow-sm',
      outline:
        'border border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
      danger:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm',
      success:
        'bg-success text-success-foreground hover:bg-success/90 active:bg-success/80 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const isDisabled = disabled || loading;
    const stateStyles = isDisabled
      ? 'opacity-60 cursor-not-allowed'
      : 'cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]';

    const buttonClasses = `
      ${variants[variant]}
      ${sizes[size]}
      ${stateStyles}
      ${fullWidth ? 'w-full' : ''}
      rounded-xl font-semibold
      flex items-center justify-center gap-2
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      ${className}
    `;

    // When asChild is true, render the child element directly with the button classes
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={buttonClasses}
          {...nativeProps}
        >
          {children}
        </Slot>
      );
    }

    // Default: render a <button> element
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={buttonClasses}
        {...nativeProps}
      >
        {loading && <Spinner />}
        {!loading && icon && iconPosition === 'left' && (
          <span className="text-xl">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="text-xl">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };