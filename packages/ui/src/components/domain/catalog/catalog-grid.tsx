'use client';

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface CatalogGridProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  viewMode?: 'grid' | 'list';
}

export const CatalogGrid = ({
  children,
  className,
  isLoading,
  emptyState,
  viewMode = 'grid',
}: CatalogGridProps) => {
  if (isLoading) {
    if (viewMode === 'list') {
      return (
        <div className={cn('flex flex-col gap-4', className)}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-white/[0.04]"
            />
          ))}
        </div>
      );
    }
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-neutral-100 dark:bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (React.Children.count(children) === 0 && emptyState) {
    return <div className="flex h-[60vh] w-full items-center justify-center">{emptyState}</div>;
  }

  if (viewMode === 'list') {
    return <div className={cn('flex flex-col gap-4', className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
};
