/**
 * UndoRedoToolbar Component
 *
 * Reusable toolbar for undo/redo controls with optional history access.
 * Seamlessly integrates with existing visual builder aesthetic.
 * Mobile-first with touch-friendly button sizes.
 */

'use client';

import { Undo2, Redo2, History } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface UndoRedoToolbarProps {
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Undo action handler */
  onUndo: () => void;
  /** Redo action handler */
  onRedo: () => void;
  /** Optional: Show history button */
  onShowHistory?: () => void;
  /** Number of versions in history (shown as badge) */
  historyCount?: number;
  /** Additional CSS classes */
  className?: string;
  /** Theme variant matching visual builder themes */
  variant?: 'primary' | 'emerald' | 'neutral';
  /** Translations */
  labels?: {
    undo?: string;
    redo?: string;
    history?: string;
  };
}

const VARIANT_STYLES = {
  primary: {
    active: 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10',
    disabled: 'text-neutral-300 dark:text-neutral-600',
    badge: 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
  },
  emerald: {
    active:
      'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10',
    disabled: 'text-neutral-300 dark:text-neutral-600',
    badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  neutral: {
    active: 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/[0.06]',
    disabled: 'text-neutral-300 dark:text-neutral-600',
    badge: 'bg-neutral-200 text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300',
  },
} as const;

export function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onShowHistory,
  historyCount = 0,
  className,
  variant = 'neutral',
  labels = {},
}: UndoRedoToolbarProps) {
  const styles = VARIANT_STYLES[variant];

  const buttonBase = cn(
    'flex items-center justify-center rounded-lg transition-all duration-200',
    'min-h-[2.5rem] min-w-[2.5rem] p-2',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-primary-500 dark:focus-visible:ring-offset-[#09090b]'
  );

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-xl bg-white/80 p-1',
        'border border-neutral-200/80 shadow-sm backdrop-blur-md',
        'dark:border-white/10 dark:bg-white/[0.05]',
        className
      )}
    >
      {/* Undo Button */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title={labels.undo ?? 'Undo (⌘Z)'}
        aria-label={labels.undo ?? 'Undo'}
        className={cn(
          buttonBase,
          canUndo ? styles.active : styles.disabled,
          !canUndo && 'cursor-not-allowed'
        )}
      >
        <Undo2 size={18} />
      </button>

      {/* Redo Button */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title={labels.redo ?? 'Redo (⌘⇧Z)'}
        aria-label={labels.redo ?? 'Redo'}
        className={cn(
          buttonBase,
          canRedo ? styles.active : styles.disabled,
          !canRedo && 'cursor-not-allowed'
        )}
      >
        <Redo2 size={18} />
      </button>

      {/* History Button (optional) */}
      {onShowHistory && (
        <>
          <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-white/10" />
          <button
            type="button"
            onClick={onShowHistory}
            title={labels.history ?? 'Version History'}
            aria-label={labels.history ?? 'Version History'}
            className={cn(buttonBase, styles.active, 'relative')}
          >
            <History size={18} />
            {historyCount > 0 && (
              <span
                className={cn(
                  'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center',
                  'rounded-full px-1 text-[10px] font-bold',
                  styles.badge
                )}
              >
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}
