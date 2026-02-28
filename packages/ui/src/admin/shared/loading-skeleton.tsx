/**
 * Loading Skeleton Components
 * Consistent loading states for admin dashboard
 */

'use client';

import { cn } from '@giulio-leone/lib-design-system';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton pulse animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60', className)}
    />
  );
}

/**
 * Skeleton for stat cards grid
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200/50 bg-white/60 p-4 dark:border-white/[0.08] dark:bg-neutral-800/60">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-12" />
    </div>
  );
}

/**
 * Skeleton for section content (charts, tables)
 */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * Full tab loading skeleton
 */
export function TabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content area */}
      <div className="rounded-2xl border border-neutral-200/50 bg-white/60 p-6 dark:border-white/[0.08] dark:bg-neutral-800/60">
        <SectionSkeleton rows={5} />
      </div>
    </div>
  );
}

/**
 * Card skeleton for list items
 */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200/50 bg-white/60 p-4 dark:border-white/[0.08] dark:bg-neutral-800/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="mt-2 h-4 w-24" />
          <Skeleton className="mt-2 h-3 w-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/50 dark:border-white/[0.08]">
      {/* Header */}
      <div className="flex gap-4 border-b border-neutral-200/50 bg-neutral-50/60 p-4 dark:border-white/[0.08] dark:bg-neutral-800/60">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-neutral-100 p-4 last:border-b-0 dark:border-white/[0.08]"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
