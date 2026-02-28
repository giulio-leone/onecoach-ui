'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@giulio-leone/lib-design-system';
import { ArrowUpRight } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType | string;
  href: string;
  color?: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsGrid({ actions, className }: QuickActionsGridProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {actions.map((action: QuickAction) => {
        const Icon = typeof action.icon !== 'string' ? action.icon : null;
        // Default gradient if none provided
        const colorClass = action.color || 'from-indigo-500 to-secondary-500';

        return (
          <Link key={action.id} href={action.href} className="group block h-full outline-none">
            <div
              className={cn(
                'relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300',
                // Glassmorphism Base
                'bg-white/40 backdrop-blur-md dark:bg-neutral-900/40',
                'border-white/40 dark:border-white/5',
                // Hover State
                'hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20',
                'group-focus-visible:ring-2 group-focus-visible:ring-indigo-500'
              )}
            >
              {/* Background Gradient Glow (Subtle) */}
              <div
                className={cn(
                  'absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-20',
                  `bg-gradient-to-br ${colorClass}`
                )}
              />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110',
                    `bg-gradient-to-br ${colorClass} text-white shadow-lg shadow-indigo-500/20`
                  )}
                >
                  {Icon ? (
                    <Icon className="h-6 w-6" />
                  ) : (
                    <span className="text-xl">{action.icon as string}</span>
                  )}
                </div>

                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100',
                    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  )}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <div className="relative z-10 mt-4">
                <h3 className="font-bold text-neutral-900 dark:text-white">{action.label}</h3>
                <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
