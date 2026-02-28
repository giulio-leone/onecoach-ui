/**
 * VersionHistory Component
 *
 * Generic version history component for visual builders
 * Displays list of versions with restore functionality
 * Fully optimized for dark mode
 */

import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';

export interface Version {
  id: string;
  version: number;
  createdAt: string | Date;
}

export interface VersionHistoryProps {
  versions: Version[];
  onRestore: (version: number) => void;
  className?: string;
  variant?: 'blue' | 'green';
}

export function VersionHistory({
  versions,
  onRestore,
  className = '',
  variant = 'blue',
}: VersionHistoryProps) {
  const gradientClass =
    variant === 'green'
      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-lg sm:p-6',
        darkModeClasses.card.base,
        className
      )}
    >
      <h3
        className={cn(
          'mb-4 text-lg font-semibold sm:mb-6 sm:text-xl',
          darkModeClasses.text.primary
        )}
      >
        Cronologia Versioni
      </h3>
      <div className="space-y-2">
        {versions.length === 0 ? (
          <p className={cn('text-sm', darkModeClasses.text.muted)}>Nessuna versione precedente</p>
        ) : (
          versions.map((v: any) => (
            <div
              key={v.id}
              className={cn(
                'flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md',
                darkModeClasses.border.base,
                darkModeClasses.bg.subtle,
                darkModeClasses.interactive.hover
              )}
            >
              <div>
                <p className={cn('font-semibold', darkModeClasses.text.primary)}>
                  Versione {v.version}
                </p>
                <p
                  className={cn('mt-1 text-xs font-medium sm:text-sm', darkModeClasses.text.muted)}
                >
                  {new Date(v.createdAt).toLocaleString('it-IT')}
                </p>
              </div>
              <button
                onClick={() => onRestore(v.version)}
                className={cn(
                  'min-h-[44px] touch-manipulation rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]',
                  gradientClass
                )}
              >
                Ripristina
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
