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
import { cn } from '@onecoach/lib-design-system';
import { useUIStore, useHeaderActions, useAuthStore } from '@onecoach/lib-stores';
import { ThemeToggle } from '../theme-toggle';

export interface AppShellHeaderProps {
  titleOverride?: string;
  brandHref?: string;
  brandLabel?: string;
}

export function AppShellHeader({ titleOverride, brandHref, brandLabel }: AppShellHeaderProps) {
  const { toggleMobileMenu } = useUIStore();
  const { user, updateUser } = useAuthStore();
  const { actions: headerActions } = useHeaderActions();
  const pathname = usePathname();

  // Simple breadcrumb/title logic
  const getPageTitle = () => {
    if (titleOverride) return titleOverride;
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname?.startsWith('/oneagenda')) return 'Agenda';
    if (pathname?.startsWith('/workouts')) return 'Programmi';
    if (pathname?.startsWith('/nutrition')) return 'Nutrizione';
    if (pathname?.startsWith('/profile')) return 'Profilo';
    if (pathname?.startsWith('/admin')) return 'Admin';
    return 'onecoach';
  };

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

      toast.success(newValue ? 'Copilot attivato' : 'Copilot disattivato');
    } catch (e) {
      // Revert on error
      updateUser({ copilotEnabled: !newValue });
      console.error('Failed to update copilot preference', e);
      toast.error(
        e instanceof Error ? e.message : "Errore durante l'aggiornamento delle preferenze"
      );
    }
  };

  const isOneAgenda = pathname?.startsWith('/oneagenda');
  const safeBrandHref = brandHref ?? (isOneAgenda ? '/oneagenda' : '/dashboard');
  const safeBrandLabel = brandLabel ?? (isOneAgenda ? 'OneAgenda' : 'onecoach');

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800',
        'bg-white/50 backdrop-blur-xl backdrop-saturate-150 dark:bg-[#020408]/50',
        'supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-[#020408]/50',
        'transition-all duration-200'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Mobile Menu & Brand/Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Apri menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Brand (Mobile) / Title (Desktop) */}
          <div className="flex items-center gap-3">
            <Link href={safeBrandHref} className="group flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                {isOneAgenda ? <Calendar className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>
              <span className="font-bold text-neutral-900 dark:text-white">{safeBrandLabel}</span>
            </Link>

            {/* Desktop Page Title */}
            <div className="hidden items-center gap-2 lg:flex">
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section: Actions & Theme */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Injected Actions */}
          {headerActions && (
            <div className="flex items-center gap-2 border-r border-neutral-200 pr-2 sm:pr-4 dark:border-neutral-800">
              {headerActions}
            </div>
          )}

          {/* Copilot Toggle */}
          <button
            onClick={toggleCopilotEnabled}
            className={cn(
              'rounded-md p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
              user?.copilotEnabled
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
            title={user?.copilotEnabled ? 'Disattiva Copilot' : 'Attiva Copilot'}
          >
            <Bot className="h-5 w-5" />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
