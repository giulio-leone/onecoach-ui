/**
 * Section Card
 *
 * Reusable card wrapper for admin sections with glassmorphism styling.
 * Extracted from ai-settings-page-client for DRY principle.
 */

'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="from-primary-500/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br to-violet-500/10">
              <Icon className="text-primary-600 dark:text-primary-400 h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl',
          'bg-white/60 dark:bg-white/[0.05]',
          'backdrop-blur-xl',
          'border border-neutral-200/50 dark:border-white/[0.08]',
          'shadow-lg shadow-neutral-900/5 dark:shadow-neutral-900/20',
          'overflow-hidden'
        )}
      >
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
