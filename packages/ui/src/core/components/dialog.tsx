/**
 * Dialog Components
 *
 * - New Radix-based API: Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose
 * - Simple alert/confirm/prompt dialog exported come SimpleDialog (ex LegacyDialog, compat mantenuta)
 */

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Button } from './button';
import {
  type DialogProps as SimpleDialogProps,
  getDialogTypeConfig,
  getDialogLabels,
  useDialogInput,
  useDialogHandlers,
} from './dialog.shared';

export type { DialogType, DialogProps as SimpleDialogProps } from './dialog.shared';

// -----------------------------------------------------------------------------
// Radix-based Dialog
// -----------------------------------------------------------------------------

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in fixed inset-0 z-[1050] bg-black/50 backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    mobileFullScreen?: boolean;
    showCloseButton?: boolean;
  }
>(
  (
    { className, children, size = 'md', mobileFullScreen = true, showCloseButton = true, ...props },
    ref
  ) => {
    const sizeStyles = {
      sm: 'w-full max-w-sm',
      md: 'w-full max-w-md sm:max-w-lg',
      lg: 'w-full max-w-lg sm:max-w-2xl',
      xl: 'w-full max-w-2xl sm:max-w-4xl',
      full: 'w-full h-full max-w-full max-h-full m-0 rounded-none transform-none top-0 left-0 translate-x-0 translate-y-0',
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed z-[1050] gap-4 border bg-white/90 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] dark:border-white/[0.08] duration-300',
            size !== 'full' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6',
            size === 'full' && 'p-4 sm:p-6',
            mobileFullScreen &&
              size !== 'full' &&
              'm-4 h-auto w-full max-w-none rounded-2xl sm:m-0 sm:w-auto sm:max-w-lg', // Mobile adaptations
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close className="focus:ring-primary-500 focus:ring-offset-background absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800">
              <X className="h-4 w-4" />
              <span className="sr-only">Chiudi</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean; // Radix handles this via onInteractOutside
  showCloseButton?: boolean;
  mobileFullScreen?: boolean;
  className?: string; // Content class
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  showCloseButton = true,
  mobileFullScreen = true,
  className,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        size={size}
        mobileFullScreen={mobileFullScreen}
        showCloseButton={showCloseButton}
        className={className}
        onInteractOutside={(e: Event) => {
          if (!closeOnBackdropClick) e.preventDefault();
        }}
      >
        {title && (
          <DialogHeader className="mb-4">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogClose = DialogPrimitive.Close;

// -----------------------------------------------------------------------------
// Simple Dialog (alert/confirm/prompt)
// -----------------------------------------------------------------------------

const SimpleDialog = ({
  isOpen,
  onClose,
  type = 'alert',
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  defaultValue,
  placeholder,
  size = 'md',
  closeOnBackdropClick = false,
  inputValue: controlledInputValue,
  onInputChange,
}: SimpleDialogProps & { inputValue?: string; onInputChange?: (value: string) => void }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  const { value: inputValue, setValue: setInputValue } = useDialogInput(
    isOpen,
    defaultValue,
    controlledInputValue,
    onInputChange
  );

  const { handleCancel, handleConfirm, handleBackdropClick } = useDialogHandlers(
    type,
    onClose,
    onConfirm,
    onCancel
  );

  React.useEffect(() => {
    if (isOpen && type === 'prompt' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, type]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleCancel]);

  React.useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      if (type === 'prompt' && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        firstElement?.focus();
      }

      return () => document.removeEventListener('keydown', handleTab);
    }
    return undefined;
  }, [isOpen, type]);

  const typeConfig = getDialogTypeConfig(type);
  const labels = getDialogLabels(type, confirmLabel, cancelLabel, title);

  const IconComponent = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
    alert: AlertCircle,
    confirm: AlertCircle,
    prompt: AlertCircle,
  }[type];

  // Fix: duplicate keys above. 'confirm' and 'prompt' repeated.
  // Actually original code (Step 261) had:
  /*
    confirm: AlertCircle,
    prompt: AlertCircle,
  }[type];
  */
  // Wait, step 261 lines 304-306:
  // confirm: AlertCircle,
  // prompt: AlertCircle,
  // All good.

  const sizeStyles = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[1060] flex items-center justify-center',
        'p-4 sm:p-6',
        'animate-in fade-in duration-200'
      )}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) {
          handleBackdropClick(closeOnBackdropClick);
        }
      }}
      role="presentation"
    >
      {/* Premium Glassmorphism Backdrop */}
      <div
        className={cn('absolute inset-0', 'bg-black/40 dark:bg-black/60', 'backdrop-blur-xl')}
        aria-hidden="true"
      />

      {/* Premium Glassmorphism Dialog Container */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full',
          sizeStyles[size],
          // Glassmorphism Container
          'rounded-3xl',
          'overflow-hidden',
          'bg-white/80 dark:bg-white/[0.06]',
          'backdrop-blur-2xl',
          'border border-white/20 dark:border-white/10',
          // Premium Shadow
          'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
          'dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]',
          // Animation
          'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
          'max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]',
          'flex flex-col'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className={cn('flex items-start gap-4', 'px-6 py-6', 'flex-shrink-0')}>
          {/* Premium Glass Icon Container */}
          <div
            className={cn(
              'flex-shrink-0',
              'h-12 w-12 sm:h-14 sm:w-14',
              'rounded-2xl',
              'flex items-center justify-center',
              'bg-gradient-to-br from-white/50 to-white/20',
              'dark:from-white/10 dark:to-white/5',
              'border border-white/30 dark:border-white/10',
              'shadow-lg'
            )}
          >
            <IconComponent
              className="h-6 w-6 sm:h-7 sm:w-7"
              style={{ color: typeConfig.iconColor }}
            />
          </div>

          <div className="min-w-0 flex-1">
            {labels.title && (
              <h2
                id="dialog-title"
                className={cn(
                  'mb-2 text-xl font-bold tracking-tight sm:text-2xl',
                  'text-neutral-900 dark:text-white'
                )}
              >
                {labels.title}
              </h2>
            )}
            <p
              id="dialog-message"
              className={cn(
                'text-sm sm:text-base',
                'text-neutral-600 dark:text-neutral-400',
                'leading-relaxed whitespace-pre-wrap'
              )}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Premium Glass Input Field */}
        {type === 'prompt' && (
          <div className="px-6 pb-5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              placeholder={placeholder}
              className={cn(
                'w-full',
                'px-5 py-4',
                'rounded-xl',
                'text-base font-medium',
                // Glass Input Styling
                'bg-white/60 dark:bg-white/[0.05]',
                'backdrop-blur-sm',
                'border border-neutral-200/50 dark:border-white/[0.08]',
                'text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                // Focus States
                'focus:outline-none',
                'focus:ring-2 focus:ring-primary-500/30 dark:focus:ring-primary-400/30',
                'focus:border-primary-500/50 dark:focus:border-primary-400/50',
                'focus:bg-white/80 dark:focus:bg-white/[0.06]',
                'transition-all duration-200'
              )}
            />
          </div>
        )}

        {/* Premium Glass Footer */}
        <div
          className={cn(
            'flex flex-col-reverse sm:flex-row',
            'items-stretch sm:items-center',
            'justify-end gap-3',
            'px-6 py-5',
            'border-t border-neutral-200/30 dark:border-white/[0.06]',
            'bg-neutral-50/50 dark:bg-white/[0.04]',
            'flex-shrink-0'
          )}
        >
          {(type === 'confirm' || type === 'prompt') && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="min-h-[2.75rem] rounded-xl font-semibold sm:min-w-[7rem]"
            >
              {labels.cancel}
            </Button>
          )}
          <Button
            variant={type === 'error' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="min-h-[2.75rem] rounded-xl font-semibold shadow-lg sm:min-w-[7rem]"
          >
            {labels.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const getDialogInputValue = (): string => '';

export const ModalFooter = DialogFooter;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  SimpleDialog,
  // Deprecated alias for backward compatibility
  SimpleDialog as LegacyDialog,
};

export type { ModalProps };
