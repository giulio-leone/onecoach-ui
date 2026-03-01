'use client';

import { useState, useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Input } from '@giulio-leone/ui';
import { Search } from 'lucide-react';

export interface FilterBarProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  initialSearch?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchPlaceholder,
  onSearchChange,
  initialSearch = '',
  children,
  className,
}: FilterBarProps) {
  const [search, setSearch] = useState(initialSearch);

  useMemo(() => {
    onSearchChange?.(search);
  }, [search, onSearchChange]);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-white/[0.05]',
        className
      )}
    >
      {searchPlaceholder && (
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
        </div>
      )}
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
