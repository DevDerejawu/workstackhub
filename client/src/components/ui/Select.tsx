import { type SelectHTMLAttributes, type ReactNode, forwardRef } from 'react';
interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  icon?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      icon,
      className = '',
      id,
      ...nativeProps
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3 py-2 border rounded-lg appearance-none
              bg-background text-foreground
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'}
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:bg-muted/50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${className}
            `}
            {...nativeProps}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            ▼
          </div>
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
export type { SelectProps, Option };