'use client';

/**
 * AppShell Header
 *
 * Header sticky con brand, azioni e toggle copilot.
 * Mantiene compatibilità con gli store esistenti (UI store + header actions).
 */

import { Menu, Sparkles, Bot, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import { cn } from '@giulio-leone/lib-design-system';
import { useUIStore, useHeaderActions, useAuthStore } from '@giulio-leone/lib-stores';
import { ThemeToggle } from '../theme-toggle';

export interface AppShellHeaderLabels {
  openMenu: string;
  copilotEnabled: string;
  copilotDisabled: string;
  enableCopilot: string;
  disableCopilot: string;
  updateError: string;
}

export interface AppShellHeaderProps {
  brandHref?: string;
  brandLabel?: string;
  /** Extra content to render on the right side, before ThemeToggle */
  rightExtra?: React.ReactNode;
  labels?: AppShellHeaderLabels;
}

const DEFAULT_LABELS: AppShellHeaderLabels = {
  openMenu: 'Apri menu',
  copilotEnabled: 'Copilot attivato',
  copilotDisabled: 'Copilot disattivato',
  enableCopilot: 'Attiva Copilot',
  disableCopilot: 'Disattiva Copilot',
  updateError: "Errore durante l'aggiornamento delle preferenze",
};

export function AppShellHeader({
  brandHref,
  brandLabel,
  rightExtra,
  labels = DEFAULT_LABELS,
}: AppShellHeaderProps) {
  const { toggleMobileMenu } = useUIStore();
  const { user, updateUser } = useAuthStore();
  const { actions: headerActions, leftContent } = useHeaderActions();
  const pathname = usePathname();

  const toggleCopilotEnabled = async () => {
    if (!user) return;
    const newValue = !user.copilotEnabled;

    // Optimistic update
    updateUser({ copilotEnabled: newValue });

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copilotEnabled: newValue }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to update copilot preference:', error);
        throw new Error(`Errore aggiornamento preferenze (${response.status})`);
      }

      toast.success(newValue ? labels.copilotEnabled : labels.copilotDisabled);
    } catch (e) {
      // Revert on error
      updateUser({ copilotEnabled: !newValue });
      console.error('Failed to update copilot preference', e);
      toast.error(e instanceof Error ? e.message : labels.updateError);
    }
  };

  const isOneAgenda = pathname?.startsWith('/oneagenda');
  const isProject = pathname?.startsWith('/projects/');
  const safeBrandHref =
    brandHref ?? (isOneAgenda ? '/oneagenda' : isProject ? '/projects' : '/dashboard');
  const safeBrandLabel =
    brandLabel ?? (isOneAgenda ? 'OneAgenda' : isProject ? 'Progetto' : 'OneCoach');

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full overflow-hidden border-b',
        'border-neutral-200/50 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#09090b]/90',
        'shadow-sm shadow-neutral-900/5 dark:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.3)]',
        'transition-all duration-200'
      )}
    >
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 sm:px-6 sm:py-3 lg:h-16 lg:flex-nowrap lg:gap-4 lg:px-8 lg:py-0">
        {/* Sezione sinistra: menu mobile e brand */}
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-4">
          <button
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:text-neutral-400 dark:hover:bg-white/[0.06]"
            aria-label={labels.openMenu}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            {leftContent ? (
              <div className="flex min-w-0 items-center gap-2">{leftContent}</div>
            ) : (
              <Link
                href={safeBrandHref}
                className="group flex min-w-0 items-center gap-2 lg:hidden"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20">
                  {isOneAgenda ? (
                    <Calendar className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>
                <span className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {safeBrandLabel}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Sezione destra: azioni e tema */}
        <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-4">
          {headerActions && (
            <div className="flex items-center gap-2 border-r border-neutral-200/60 pr-2 sm:pr-4 dark:border-neutral-800">
              {headerActions}
            </div>
          )}

          <button
            onClick={toggleCopilotEnabled}
            className={cn(
              'rounded-md p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-white/[0.06]',
              user?.copilotEnabled
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
            title={user?.copilotEnabled ? labels.disableCopilot : labels.enableCopilot}
          >
            <Bot className="h-5 w-5" />
          </button>

          {rightExtra}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
