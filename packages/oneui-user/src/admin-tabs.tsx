'use client';

/**
 * Admin Tabs Component
 *
 * Reusable tabs for admin pages.
 * Supports URL hash-based routing for tab navigation.
 */

import { useEffect, useState } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface AdminTab {
  id: string;
  label: string;
  count?: number;
  badge?: string;
  disabled?: boolean;
}

export interface AdminTabsProps {
  tabs: AdminTab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function AdminTabs({
  tabs, defaultTab, onTabChange, className }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash && tabs.some((t) => t.id === hash && !t.disabled)) {
        return hash;
      }
    }
    return defaultTab || tabs.find((t) => !t.disabled)?.id || tabs[0]?.id || '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      const initialTab = defaultTab || tabs.find((t) => !t.disabled)?.id || tabs[0]?.id || '';

      if (!hash || !tabs.some((t) => t.id === hash && !t.disabled)) {
        const currentPath = window.location.pathname;
        window.history.replaceState(null, '', `${currentPath}#${initialTab}`);
      }
    }
  }, [defaultTab, tabs]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && tabs.some((t) => t.id === hash && !t.disabled)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [tabs]);

  const handleTabClick = (tabId: string) => {
    if (tabs.find((t) => t.id === tabId)?.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      window.history.replaceState(null, '', `${currentPath}#${tabId}`);
      window.dispatchEvent(new CustomEvent('admintabchange', { detail: { tabId } }));
    }
  };

  return (
    <div className={cn('border-b border-neutral-200 dark:border-neutral-800', className)}>
      <nav
        className={cn(
          '-mb-px flex overflow-x-auto',
          'scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent',
          'scroll-snap-x-mandatory scroll-smooth',
          'lg:space-x-1'
        )}
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={isDisabled}
              className={cn(
                'group relative flex-shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                'scroll-snap-start touch-manipulation',
                'min-h-[44px] min-w-[44px]',
                'sm:px-4 sm:py-3',
                'lg:min-w-0 lg:flex-1',
                'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
                isDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600',
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <span className="truncate">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                      'sm:px-2',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={cn(
                      'flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                      'sm:px-2',
                      isActive
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export interface AdminTabPanelProps {
  children: React.ReactNode;
  tabId: string;
  activeTab?: string;
  className?: string;
}

export function AdminTabPanel({
  children,
  tabId,
  activeTab: propActiveTab,
  className,
}: AdminTabPanelProps) {
  const [urlActiveTab, setUrlActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      return hash || '';
    }
    return '';
  });

  useEffect(() => {
    if (propActiveTab) return;

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setUrlActiveTab(hash || '');
    };

    const handleTabChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ tabId: string }>;
      setUrlActiveTab(customEvent.detail.tabId || '');
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('admintabchange', handleTabChange as EventListener);

    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      setUrlActiveTab(hash || '');
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('admintabchange', handleTabChange as EventListener);
    };
  }, [propActiveTab]);

  const activeTab = propActiveTab || urlActiveTab;

  if (tabId !== activeTab) return null;

  return <div className={cn('mt-6', className)}>{children}</div>;
}
