/**
 * AI Settings Tab Navigation
 * Mobile-first responsive tabs component
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Bot,
  Sparkles,
  Settings2,
  Wand2,
  BarChart3,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { AISettingsTab } from './types';

interface AISettingsTabsProps {
  activeTab: AISettingsTab;
  onTabChange: (tab: AISettingsTab) => void;
}

export function AISettingsTabs({
  activeTab, onTabChange }: AISettingsTabsProps) {
  const t = useTranslations('admin.aiSettings.navigation');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const TABS = useMemo(
    () => [
      {
        id: 'models' as const,
        label: t('models.label'),
        shortLabel: t('models.short'),
        icon: Bot,
        description: t('models.desc'),
      },
      {
        id: 'features' as const,
        label: t('features.label'),
        shortLabel: t('features.short'),
        icon: Sparkles,
        description: t('features.desc'),
      },
      {
        id: 'framework' as const,
        label: t('framework.label'),
        shortLabel: t('framework.short'),
        icon: Settings2,
        description: t('framework.desc'),
      },
      {
        id: 'copilot' as const,
        label: t('copilot.label'),
        shortLabel: t('copilot.short'),
        icon: Wand2,
        description: t('copilot.desc'),
      },
      {
        id: 'analytics' as const,
        label: t('analytics.label'),
        shortLabel: t('analytics.short'),
        icon: BarChart3,
        description: t('analytics.desc'),
      },
      {
        id: 'conversations' as const,
        label: t('conversations.label'),
        shortLabel: t('conversations.short'),
        icon: MessageSquare,
        description: t('conversations.desc'),
      },
    ],
    [t]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTabConfig = TABS.find((t: any) => t.id === activeTab) ?? TABS[0]!;

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="relative md:hidden" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-2xl p-4',
            'bg-white/80 dark:bg-neutral-800/80',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50',
            'shadow-lg shadow-neutral-900/5 dark:shadow-neutral-900/20',
            'transition-transform active:scale-[0.98]'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                'from-primary-500 bg-gradient-to-br to-violet-600',
                'shadow-primary-500/25 shadow-lg'
              )}
            >
              {(() => {
                const Icon = activeTabConfig.icon;
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
            <div className="text-left">
              <p className="font-semibold text-neutral-900 dark:text-white">
                {activeTabConfig.label}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeTabConfig.description}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-neutral-400 transition-transform duration-200',
              isDropdownOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn(
              'absolute top-full right-0 left-0 z-50 mt-2',
              'rounded-2xl p-2',
              'bg-white/95 dark:bg-neutral-800/95',
              'backdrop-blur-xl',
              'border border-neutral-200/50 dark:border-neutral-700/50',
              'shadow-2xl shadow-neutral-900/20 dark:shadow-neutral-900/40'
            )}
          >
            {TABS.map((tab: any) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      isActive
                        ? 'from-primary-500 shadow-primary-500/25 bg-gradient-to-br to-violet-600 text-white shadow-lg'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={cn(
                        'font-medium',
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      {tab.label}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {tab.description}
                    </p>
                  </div>
                  {isActive && <div className="bg-primary-500 h-2 w-2 rounded-full" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <div
          className={cn(
            'flex gap-1 rounded-2xl p-1.5',
            'bg-white/60 dark:bg-neutral-800/60',
            'backdrop-blur-xl',
            'border border-neutral-200/50 dark:border-neutral-700/50',
            'shadow-lg shadow-neutral-900/5 dark:shadow-neutral-900/20',
            'scrollbar-hide overflow-x-auto'
          )}
        >
          {TABS.map((tab: any) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex min-w-max items-center gap-2 rounded-xl px-4 py-2.5',
                  'text-sm font-medium',
                  'transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className={cn(
                      'absolute inset-0 rounded-xl',
                      'from-primary-500 bg-gradient-to-r to-violet-600',
                      'shadow-primary-500/25 shadow-lg'
                    )}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={cn('relative z-10 h-4 w-4')} />
                <span className="relative z-10 hidden lg:inline">{tab.label}</span>
                <span className="relative z-10 lg:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
