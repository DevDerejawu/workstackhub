// components/ui/Modal.tsx
import { type ReactNode, forwardRef, type HTMLAttributes } from 'react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = 'md',
      closeOnOverlayClick = true,
      className = '',
      ...nativeProps
    },
    ref
  ) => {
    if (!isOpen) return null;

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };

    const handleOverlayClick = () => {
      if (closeOnOverlayClick) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        {...nativeProps}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={handleOverlayClick}
        />

        {/* Modal Content */}
        <div
          ref={ref}
          className={`relative bg-card text-card-foreground rounded-xl shadow-xl ${sizes[size]} w-full mx-auto max-h-[100vh] overflow-y-auto ${className}`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-label="Close modal"
            type="button"
          >
            ✕
          </button>

          {/* Header */}
          {title && (
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-xl font-bold text-foreground">{title}</h3>
            </div>
          )}

          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
export { Modal };
export type { ModalProps };