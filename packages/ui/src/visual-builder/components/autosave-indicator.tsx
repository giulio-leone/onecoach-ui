'use client';

import { useEffect, useState } from 'react';
import { cn } from '@onecoach/lib-design-system';
import { Check, AlertCircle, Loader2, Cloud } from 'lucide-react';

export interface AutosaveIndicatorProps {
  /** Whether autosave is currently in progress */
  isSaving: boolean;
  /** Last successful save timestamp */
  lastSaved: Date | null;
  /** Error from last save attempt */
  error: Error | null;
  /** Whether there are unsaved changes */
  hasPendingChanges?: boolean;
  /** Callback to retry save on error */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AutosaveIndicator
 * 
 * Visual feedback component for autosave status.
 * Shows: saving spinner, saved checkmark, or error state.
 */
export function AutosaveIndicator({
  isSaving,
  lastSaved,
  error,
  hasPendingChanges = false,
  onRetry,
  className,
}: AutosaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  // Show "Saved" indicator briefly after save completes
  useEffect(() => {
    if (lastSaved && !isSaving && !error) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving, error]);

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
          'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400',
          className
        )}
      >
        <AlertCircle size={14} />
        <span>Errore</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-1 underline hover:no-underline"
          >
            Riprova
          </button>
        )}
      </div>
    );
  }

  // Saving state
  if (isSaving) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
          'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
          className
        )}
      >
        <Loader2 size={14} className="animate-spin" />
        <span>Salvataggio...</span>
      </div>
    );
  }

  // Recently saved state
  if (showSaved) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
          'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
          'animate-in fade-in duration-300',
          className
        )}
      >
        <Check size={14} />
        <span>Salvato</span>
      </div>
    );
  }

  // Pending changes state (subtle indicator)
  if (hasPendingChanges) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
          'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
          className
        )}
      >
        <Cloud size={14} />
        <span>Non salvato</span>
      </div>
    );
  }

  // Idle state - no indicator needed
  return null;
}
