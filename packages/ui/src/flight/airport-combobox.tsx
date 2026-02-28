'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { MagnifyingGlass, Check, X, Airplane, SpinnerGap, MapPin, CaretDown } from '@phosphor-icons/react';
import { cn } from '@giulio-leone/lib-design-system';
import type { Airport } from './types';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface AirportComboboxProps {
  /** Currently selected airport codes */
  value: string[];
  /** Called when selection changes */
  onChange: (codes: string[]) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Hint text shown below the component */
  hint?: string;
  /** Initial airports to display (popular/cached) */
  initialAirports?: Airport[];
  /** Server action to search airports */
  searchAirports: (query: string) => Promise<Airport[]>;
  /** Optional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Maximum selections allowed (0 = unlimited) */
  maxSelections?: number;
  /** Translations */
  translations?: AirportComboboxTranslations;
}

export interface AirportComboboxTranslations {
  selected: string;
  noResults: string;
  loading: string;
  typeToSearch: string;
  clearAll: string;
  popularAirports: string;
  searchResults: string;
}

const defaultTranslations: AirportComboboxTranslations = {
  selected: 'selected',
  noResults: 'No airports found',
  loading: 'Searching...',
  typeToSearch: 'Type to search airports...',
  clearAll: 'Clear all',
  popularAirports: 'Popular airports',
  searchResults: 'Search results',
};

// ----------------------------------------------------------------------------
// Debounce Hook
// ----------------------------------------------------------------------------

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ----------------------------------------------------------------------------
// Airport Item Component (memoized for performance)
// ----------------------------------------------------------------------------

interface AirportItemProps {
  airport: Airport;
  isSelected: boolean;
  onSelect: () => void;
}

const AirportItem = React.memo(function AirportItem({
  airport,
  isSelected,
  onSelect,
}: AirportItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150',
        'hover:bg-primary-50 dark:hover:bg-primary-500/10',
        isSelected && 'bg-primary-50 dark:bg-primary-500/20'
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
          isSelected
            ? 'border-primary-500 bg-primary-500 text-white'
            : 'border-neutral-300 dark:border-white/[0.1]'
        )}
      >
        {isSelected && <Check size={12} weight="bold" />}
      </div>

      {/* Airport Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-bold text-neutral-700 dark:bg-white/[0.04] dark:text-neutral-300">
            {airport.code}
          </span>
          <span className="truncate text-sm font-medium text-neutral-900 dark:text-white">
            {airport.city}
          </span>
        </div>
        <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {airport.name}
        </span>
      </div>

      {/* Country flag placeholder */}
      <span className="shrink-0 text-xs font-medium text-neutral-400 uppercase">
        {airport.country}
      </span>
    </button>
  );
});

// ----------------------------------------------------------------------------
// Selected Chips Component
// ----------------------------------------------------------------------------

interface SelectedChipsProps {
  selectedAirports: Airport[];
  onRemove: (code: string) => void;
  onClearAll: () => void;
  translations: AirportComboboxTranslations;
}

function SelectedChips({
  selectedAirports,
  onRemove,
  onClearAll,
  translations,
}: SelectedChipsProps) {
  if (selectedAirports.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {selectedAirports.map((airport: any) => (
        <span
          key={airport.code}
          className="group flex items-center gap-1.5 rounded-full bg-primary-100 py-1 pr-1 pl-2.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-200 dark:bg-primary-500/20 dark:text-primary-300 dark:hover:bg-primary-500/30"
        >
          <span className="font-bold">{airport.code}</span>
          <span className="max-w-[100px] truncate text-primary-600/70 dark:text-primary-400/70">
            {airport.city}
          </span>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              onRemove(airport.code);
            }}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-200 transition-colors hover:bg-primary-300 dark:bg-primary-500/40 dark:hover:bg-primary-500/60"
          >
            <X size={10} weight="bold" />
          </button>
        </span>
      ))}
      {selectedAirports.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]"
        >
          <X size={10} weight="bold" />
          {translations.clearAll}
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function AirportCombobox({
  value,
  onChange,
  placeholder = 'Select airports...',
  searchPlaceholder = 'Search by city, airport or code...',
  hint,
  initialAirports = [],
  searchAirports,
  className,
  disabled = false,
  maxSelections = 0,
  translations = defaultTranslations,
}: AirportComboboxProps) {
  const t = { ...defaultTranslations, ...translations };

  // State
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Airport[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query (300ms)
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Current display list (search results or initial airports)
  const displayList = useMemo(() => {
    // If we have search results from a search, show them
    if (searchResults.length > 0) {
      return searchResults;
    }
    // Otherwise show initial airports (only if no active search)
    if (debouncedQuery.length < 2) {
      return initialAirports;
    }
    // Active search with no results yet
    return [];
  }, [debouncedQuery, searchResults, initialAirports]);

  // Map of selected codes for O(1) lookup
  const selectedCodesSet = useMemo(() => new Set(value), [value]);

  // Selected airports with full data
  const selectedAirports = useMemo(() => {
    const allAirports = [...initialAirports, ...searchResults];
    const airportMap = new Map(allAirports.map((a: any) => [a.code, a]));
    return value.map((code: any) => airportMap.get(code)).filter((a): a is Airport => a !== undefined);
  }, [value, initialAirports, searchResults]);

  // Search effect
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const performSearch = async () => {
      try {
        const results = await searchAirports(debouncedQuery);
        if (!cancelled) {
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Airport search failed:', error);
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchAirports]);

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Handlers
  const handleSelect = useCallback(
    (code: string) => {
      if (selectedCodesSet.has(code)) {
        // Remove
        onChange(value.filter((c: any) => c !== code));
      } else {
        // Add (check max limit)
        if (maxSelections > 0 && value.length >= maxSelections) {
          return;
        }
        onChange([...value, code]);
      }
    },
    [value, onChange, selectedCodesSet, maxSelections]
  );

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleRemove = useCallback(
    (code: string) => {
      onChange(value.filter((c: any) => c !== code));
    },
    [value, onChange]
  );

  // Display label for trigger button
  const triggerLabel = useMemo(() => {
    if (value.length === 0) {
      return <span className="text-neutral-400">{placeholder}</span>;
    }
    // Optimization: If only 1 selected, show its Code and City
    if (value.length === 1 && selectedAirports[0]) {
      const airport = selectedAirports[0];
      return (
        <span className="flex items-center gap-2 text-neutral-900 dark:text-white">
          <span className="font-bold">{airport.code}</span>
          <span className="truncate opacity-80">{airport.city}</span>
        </span>
      );
    }
    return (
      <span className="text-neutral-900 dark:text-white">
        {value.length} {t.selected}
      </span>
    );
  }, [value.length, selectedAirports, placeholder, t.selected]);

  // List section title - based on current search state
  const sectionTitle = useMemo(() => {
    if (searchQuery.length >= 2) {
      return t.searchResults;
    }
    return t.popularAirports;
  }, [searchQuery, t.searchResults, t.popularAirports]);

  return (
    <div className={cn('w-full', className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'relative flex h-14 w-full items-center justify-between rounded-2xl border-2 bg-white/50 px-4 py-3 text-left text-sm font-medium backdrop-blur-md transition-all duration-200',
              'hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
              'dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30',
              open && 'border-primary-500/50 ring-2 ring-primary-500/20',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className="flex items-center gap-3">
              <Airplane className="h-5 w-5 text-primary-500" weight="duotone" />
              {triggerLabel}
            </div>
            <CaretDown
              className={cn(
                'h-4 w-4 text-neutral-400 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className={cn(
              'z-[9999] w-[var(--radix-popover-trigger-width)] max-w-[480px] min-w-[320px] overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/95 shadow-2xl backdrop-blur-xl',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'dark:border-white/[0.08] dark:bg-white/[0.10]'
            )}
          >
            {/* Search Input */}
            <div className="border-b border-neutral-100 p-3 dark:border-white/[0.06]">
              <div className="relative">
                <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'w-full rounded-xl border border-neutral-200/60 bg-white py-2.5 pr-10 pl-10 text-sm transition-colors',
                    'placeholder:text-neutral-400',
                    'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
                    'dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white'
                  )}
                />
                {isSearching && (
                  <SpinnerGap className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-primary-500" />
                )}
                {searchQuery && !isSearching && !isSearching && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/[0.08]"
                  >
                    <X size={14} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-2 dark:border-white/[0.06]">
              <MapPin className="h-3.5 w-3.5 text-neutral-400" weight="fill" />
              <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {sectionTitle}
              </span>
              <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400">
                {displayList.length}
              </span>
            </div>

            {/* Airport List */}
            <div className="max-h-[320px] overflow-y-auto p-2">
              {displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  {isSearching ? (
                    <>
                      <SpinnerGap className="mb-2 h-6 w-6 animate-spin text-primary-500" />
                      <p className="text-sm text-neutral-500">{t.loading}</p>
                    </>
                  ) : debouncedQuery.length >= 2 ? (
                    <>
                      <MagnifyingGlass className="mb-2 h-6 w-6 text-neutral-300" />
                      <p className="text-sm text-neutral-500">{t.noResults}</p>
                    </>
                  ) : (
                    <>
                      <Airplane className="mb-2 h-6 w-6 text-neutral-300" weight="duotone" />
                      <p className="text-sm text-neutral-500">{t.typeToSearch}</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {displayList.map((airport: any) => (
                    <AirportItem
                      key={airport.code}
                      airport={airport}
                      isSelected={selectedCodesSet.has(airport.code)}
                      onSelect={() => handleSelect(airport.code)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Selected Chips (outside popover) */}
      <SelectedChips
        selectedAirports={selectedAirports}
        onRemove={handleRemove}
        onClearAll={handleClearAll}
        translations={t}
      />

      {/* Hint */}
      {hint && (
        <p className="mt-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">{hint}</p>
      )}
    </div>
  );
}
