/**
 * SelectionToolbar Component
 *
 * Floating toolbar for batch selection actions.
 * Mobile-first design with large touch targets (min 44px).
 */

'use client';

import { useTranslations } from 'next-intl';
import { X, Trash2, CheckSquare, Square } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface SelectionToolbarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Total number of items */
  totalCount: number;
  /** Whether all items are selected */
  allSelected: boolean;
  /** Called when "Select All" / "Deselect All" is clicked */
  onToggleSelectAll: () => void;
  /** Called when "Delete Selected" is clicked */
  onDeleteSelected: () => void;
  /** Called when "Cancel" is clicked to exit selection mode */
  onCancel: () => void;
  /** Whether delete is in progress */
  isDeleting?: boolean;
  /** Color theme: 'blue' for workouts, 'emerald' for nutrition, 'indigo' for modern workout */
  colorTheme?: 'blue' | 'emerald' | 'indigo';
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onDeleteSelected,
  onCancel,
  isDeleting = false,
  colorTheme = 'blue',
}: SelectionToolbarProps) {
  const t = useTranslations();
  if (selectedCount === 0) return null;

  const themeClasses = {
    blue: {
      bg: 'from-primary-600 to-indigo-700',
      ring: 'ring-primary-400/30',
      accent: 'bg-primary-500/20 hover:bg-primary-500/30',
    },
    emerald: {
      bg: 'from-emerald-600 to-teal-700',
      ring: 'ring-primary-400/30',
      accent: 'bg-emerald-500/20 hover:bg-emerald-500/30',
    },
    indigo: {
      bg: 'from-indigo-600 to-secondary-700',
      ring: 'ring-indigo-400/30',
      accent: 'bg-indigo-500/20 hover:bg-indigo-500/30',
    },
  };

  const theme = themeClasses[colorTheme];

  return (
    <div
      className={cn(
        // Fixed positioning at bottom
        'fixed right-0 bottom-0 left-0 z-50',
        // Safe area padding for mobile devices with home indicator
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-2xl px-4 pb-4',
          // Animate in
          'animate-in slide-in-from-bottom-4 duration-300'
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-2xl p-3',
            'bg-gradient-to-r shadow-2xl ring-1 backdrop-blur-xl',
            theme.bg,
            theme.ring
          )}
        >
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            {/* Cancel button */}
            <button
              onClick={onCancel}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95"
              aria-label="Annulla selezione"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Count */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">
                {selectedCount} selezionat{selectedCount === 1 ? 'o' : 'i'}
              </span>
              <span className="text-[10px] text-white/70">
                su {totalCount} total{totalCount === 1 ? 'e' : 'i'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Select All / Deselect All */}
            <button
              onClick={onToggleSelectAll}
              className={cn(
                'flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all active:scale-95',
                theme.accent
              )}
            >
              {allSelected ? (
                <>
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Deseleziona</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Tutti</span>
                </>
              )}
            </button>

            {/* Delete button */}
            <button
              onClick={onDeleteSelected}
              disabled={isDeleting}
              className={cn(
                'flex h-11 items-center gap-2 rounded-xl bg-rose-500 px-4 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all',
                'hover:bg-rose-600 active:scale-95',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('common.actions.delete')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
