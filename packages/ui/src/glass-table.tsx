'use client';

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface GlassTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface GlassTableProps<T> {
  data: T[];
  columns: GlassTableColumn<T>[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  // Selection props
  selectedIds?: Set<string> | string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
}

export function GlassTable<T>({
  data,
  columns,
  onRowClick,
  keyExtractor,
  isLoading,
  emptyState,
  className,
  selectedIds,
  onSelectRow,
  onSelectAll,
  isAllSelected,
}: GlassTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-xl bg-white/20 dark:bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState || <div className="p-8 text-center text-neutral-500">No data available</div>;
  }

  const isSelectionEnabled = onSelectRow && selectedIds;
  const selectedSet = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-white/20 bg-white/30 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/20',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/40 dark:bg-white/5">
              {isSelectionEnabled && (
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-6 py-4 font-semibold text-neutral-900 dark:text-white',
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.map((item: T) => {
              const id = keyExtractor(item);
              const isSelected = selectedSet.has(id);

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'group transition-colors hover:bg-white/40 dark:hover:bg-white/5',
                    onRowClick && 'cursor-pointer',
                    isSelected &&
                      'bg-blue-50/50 hover:bg-blue-50/70 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                  )}
                >
                  {isSelectionEnabled && (
                    <td className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.stopPropagation();
                          onSelectRow(id);
                        }}
                        className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700"
                      />
                    </td>
                  )}
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={cn(
                        'px-6 py-4 text-neutral-700 dark:text-neutral-300',
                        column.className
                      )}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                          ? (item[column.accessorKey] as React.ReactNode)
                          : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
