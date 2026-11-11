import { type TextareaHTMLAttributes, forwardRef } from 'react';
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      rows = 4,
      className = '',
      id,
      ...nativeProps
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full px-3 py-2 border rounded-lg
            bg-background text-foreground
            ${error ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-ring'}
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-muted/50 disabled:cursor-not-allowed
            resize-vertical
            transition-colors duration-200
            ${className}
          `}
          {...nativeProps}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };
export type { TextareaProps };