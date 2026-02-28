/**
 * ErrorState Component
 *
 * Componente per visualizzare stati di errore
 * Componente indipendente, non wrapper di EmptyState
 */

import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ErrorStateProps {
  error: Error | null | undefined;
  title?: string | null;
  description?: string | null;
  /**
   * Alias più esplicito per descrivere l'errore (backward compat con le app)
   */
  message?: string | null;
  action?: ReactNode;
  className?: string;
}

export const ErrorState = ({
  error,
  title,
  description,
  message,
  action,
  className = '',
}: ErrorStateProps) => {
  const errorTitle = title ?? 'An error occurred';
  const errorMessage = error?.message ?? null;
  const errorDescription =
    description ?? message ?? errorMessage ?? 'Something went wrong. Please try again later.';

  return (
    <div className={`animate-fadeIn mt-20 text-center text-neutral-500 ${className}`}>
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20">
        <AlertCircle size={40} className="text-red-500 dark:text-red-400" />
      </div>
      <p className="mb-2 text-xl font-semibold text-neutral-700 dark:text-neutral-300">{errorTitle}</p>
      <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorDescription}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
