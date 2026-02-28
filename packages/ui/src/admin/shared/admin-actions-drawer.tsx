/**
 * Admin Actions Drawer Component
 *
 * Drawer dal basso per mobile, dropdown per desktop
 * Soluzione definitiva per problemi di responsività
 * Principi: KISS, SOLID, DRY
 */

'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { AdminMenuItem } from './admin-menu-item.types';

interface AdminActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: AdminMenuItem[];
  title?: string;
}

export function AdminActionsDrawer({
  isOpen,
  onClose,
  items,
  title = 'Azioni',
}: AdminActionsDrawerProps) {
  // Blocca scroll del body quando il drawer è aperto
  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', 'animate-fadeIn')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50',
          'max-h-[85vh] rounded-t-2xl border-t-2 shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          'animate-slide-up',
          darkModeClasses.card.elevated,
          darkModeClasses.border.base
        )}
      >
        {/* Handle bar */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className={cn('h-1 w-12 rounded-full', 'bg-neutral-300 dark:bg-white/[0.10]')} />
        </div>

        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-4 pb-3',
            'border-b',
            darkModeClasses.border.base
          )}
        >
          <h3 className={cn('text-lg font-semibold', darkModeClasses.text.primary)}>{title}</h3>
          <button
            onClick={onClose}
            className={cn(
              'min-h-[2.75rem] min-w-[2.75rem] rounded-lg p-2',
              'touch-manipulation transition-colors',
              darkModeClasses.text.secondary,
              darkModeClasses.interactive.hover
            )}
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="max-h-[calc(85vh-80px)] overflow-y-auto px-2 py-2">
          {items.map((item: AdminMenuItem) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    onClose();
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3',
                  'min-h-[2.75rem] touch-manipulation transition-colors',
                  'text-left',
                  item.disabled
                    ? 'cursor-not-allowed opacity-50'
                    : item.variant === 'danger'
                      ? cn(
                          'text-red-600 dark:text-red-400',
                          'hover:bg-red-50 dark:hover:bg-red-900/30',
                          'active:bg-red-100 dark:active:bg-red-900/40'
                        )
                      : cn(
                          darkModeClasses.text.secondary,
                          darkModeClasses.interactive.hover,
                          'active:bg-neutral-100 dark:active:bg-neutral-800/50'
                        )
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-base font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
