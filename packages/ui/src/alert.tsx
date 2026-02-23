/**
 * Alert Component
 *
 * Componente per messaggi di notifica e avvisi
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}: AlertProps) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const variantStyles = {
    success:
      'bg-success-light dark:bg-green-900/30 border-success dark:border-green-700 text-success-dark dark:text-green-300',
    warning:
      'bg-warning-light dark:bg-yellow-900/30 border-warning dark:border-yellow-700 text-warning-dark dark:text-yellow-300',
    error:
      'bg-error-light dark:bg-red-900/30 border-error dark:border-red-700 text-error-dark dark:text-red-300',
    info: 'bg-info-light dark:bg-blue-900/30 border-info dark:border-blue-700 text-info-dark dark:text-blue-300',
  };

  const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[variant];

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div
      className={`relative flex gap-3 rounded-xl border p-4 ${variantStyles[variant]} ${className}`}
      role="alert"
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        {title && <div className="mb-1 font-semibold">{title}</div>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:bg-neutral-900/5 dark:hover:bg-white"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`text-sm [&_p]:leading-relaxed ${className || ''}`} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 leading-none font-medium tracking-tight ${className || ''}`}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';
