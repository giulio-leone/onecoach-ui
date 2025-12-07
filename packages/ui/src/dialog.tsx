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
import { cn, darkModeClasses } from '@onecoach/lib-design-system';
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
      'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-xl duration-200 dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="focus:ring-primary-500 focus:ring-offset-background absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800">
        <X className="h-4 w-4" />
        <span className="sr-only">Chiudi</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

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
        'animate-fadeIn'
      )}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) {
          handleBackdropClick(closeOnBackdropClick);
        }
      }}
      role="presentation"
    >
      <div
        className={cn('absolute inset-0', darkModeClasses.bg.backdrop, 'backdrop-blur-sm')}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className={cn(
          'relative w-full',
          sizeStyles[size],
          'rounded-2xl',
          'overflow-hidden',
          darkModeClasses.card.elevated,
          'animate-slide-up',
          'max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]',
          'flex flex-col',
          'shadow-2xl'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
      >
        <div className={cn('flex items-start gap-4', 'px-6 py-5 sm:px-6 sm:py-6', 'flex-shrink-0')}>
          <div
            className={cn(
              'flex-shrink-0',
              'h-10 w-10 sm:h-12 sm:w-12',
              'rounded-full',
              'flex items-center justify-center'
            )}
            style={{ backgroundColor: typeConfig.iconBg }}
          >
            <IconComponent
              className="h-5 w-5 sm:h-6 sm:w-6"
              style={{ color: typeConfig.iconColor }}
            />
          </div>

          <div className="min-w-0 flex-1">
            {labels.title && (
              <h2
                id="dialog-title"
                className={cn(
                  'mb-2 text-lg font-semibold sm:text-xl',
                  darkModeClasses.text.primary
                )}
              >
                {labels.title}
              </h2>
            )}
            <p
              id="dialog-message"
              className={cn(
                'text-sm sm:text-base',
                darkModeClasses.text.secondary,
                'whitespace-pre-wrap'
              )}
            >
              {message}
            </p>
          </div>
        </div>

        {type === 'prompt' && (
          <div className="px-6 pb-4">
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
                'px-4 py-3',
                'rounded-lg',
                'border',
                darkModeClasses.border.base,
                darkModeClasses.bg.base,
                darkModeClasses.text.primary,
                'focus:ring-2 focus:outline-none',
                'focus:ring-emerald-500 dark:focus:ring-emerald-400',
                'focus:border-transparent',
                'transition-all duration-200'
              )}
            />
          </div>
        )}

        <div
          className={cn(
            'flex flex-col-reverse sm:flex-row',
            'items-stretch sm:items-center',
            'justify-end gap-3',
            'px-6 py-4 sm:py-5',
            'border-t',
            darkModeClasses.border.base,
            'flex-shrink-0'
          )}
        >
          {(type === 'confirm' || type === 'prompt') && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="min-h-[2.75rem] sm:min-w-[6rem]"
            >
              {labels.cancel}
            </Button>
          )}
          <Button
            variant={type === 'error' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className="min-h-[2.75rem] sm:min-w-[6rem]"
          >
            {labels.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const getDialogInputValue = (): string => '';

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
