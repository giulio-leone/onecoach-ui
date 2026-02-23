'use client';

import React from 'react';
import { Search, LayoutGrid, List as ListIcon, Plus } from 'lucide-react';
import { Button } from '../../button';
import { cn } from '@giulio-leone/lib-design-system';

export interface CatalogHeaderProps {
  title: string;
  description?: string;
  stats?: Array<{ label: string; value: string | number }>;
  onAdd?: () => void;
  addLabel?: string;
}

export const CatalogHeader = ({
  title,
  description,
  stats = [],
  onAdd,
  addLabel = 'Aggiungi Nuovo',
}: CatalogHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-neutral-500 dark:text-neutral-400">{description}</p>
        )}

        {stats.length > 0 && (
          <div className="flex gap-6 pt-2">
            {stats.map((stat: { label: string; value: string | number }) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {onAdd && (
        <Button variant="gradient-primary" onClick={onAdd} className="shrink-0">
          <div className="flex items-center gap-2">
            <Plus size={20} />
            <span>{addLabel}</span>
          </div>
        </Button>
      )}
    </div>
  );
};

export interface FilterOption {
  label: string;
  value: string;
}

export interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilters?: string[];
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void; // Simplification for now
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  className?: string;
}

export const CatalogToolbar = ({
  searchQuery,
  onSearchChange,
  activeFilters = [],
  filterOptions = [],
  onFilterChange,
  viewMode = 'grid',
  onViewModeChange,
  className,
}: CatalogToolbarProps) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 mb-8 flex flex-col gap-4 rounded-2xl bg-white/80 p-2 backdrop-blur-xl sm:flex-row sm:items-center dark:bg-neutral-900/80',
        className
      )}
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Cerca nel catalogo..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="h-12 w-full rounded-xl border-none bg-transparent pr-4 pl-10 text-base outline-none placeholder:text-neutral-400 focus:ring-0"
        />
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center gap-2 px-2 pb-2 sm:pb-0">
        {/* Filter Pills (Scrollable) */}
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto sm:flex-none">
          {filterOptions.map((option: FilterOption) => {
            const isActive = activeFilters.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange?.(option.value)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />

        {/* View Toggle */}
        <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => onViewModeChange?.('grid')}
            className={cn(
              'rounded-md p-2 transition-all',
              viewMode === 'grid'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500'
            )}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('list')}
            className={cn(
              'rounded-md p-2 transition-all',
              viewMode === 'list'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500'
            )}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
