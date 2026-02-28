/**
 * ExerciseCombobox - Reusable autocomplete combobox for exercise selection
 *
 * Features:
 * - Real-time autocomplete with BM25 ranking
 * - Locale detection and prioritization (user locale → English fallback)
 * - Debounced search for performance
 * - Keyboard navigation support
 * - Selection restricted to catalog exercises only
 *
 * Best practices: KISS, DRY, SOLID principles
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Search, Loader2, X, Check } from 'lucide-react';
import type { LocalizedExercise } from '@giulio-leone/one-workout';
import { useDebounce } from '@giulio-leone/hooks';
import { useTranslations } from 'next-intl';

import { logger } from '@giulio-leone/lib-shared';

interface ExerciseComboboxProps {
  // Modalità select (default)
  onSelect?: (exercise: LocalizedExercise) => void;
  // Modalità search
  mode?: 'select' | 'search';
  onSearch?: (query: string) => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  includeUnapproved?: boolean;
  // Props comuni
  placeholder?: string;
  locale?: string;
  filters?: {
    muscleIds?: string[]; // IDs muscoli
    bodyParts?: string[];
    bodyPartIds?: string[];
    equipments?: string[];
    equipmentIds?: string[];
  };
  className?: string;
  autoFocus?: boolean;
  noResultsMessage?: string;
}

/**
 * Detect user's preferred locale from browser
 */
function detectBrowserLocale(): string {
  if (typeof navigator === 'undefined') return 'en';

  const browserLocale = navigator.language || navigator.languages?.[0];
  return (browserLocale ?? 'en').toLowerCase().split('-')[0] ?? 'en'; // Extract language code only
}

export function ExerciseCombobox({
  mode = 'select',
  onSelect,
  onSearch,
  onSearchChange,
  searchValue,
  includeUnapproved = false,
  placeholder,
  locale,
  filters,
  className = '',
  autoFocus = false,
  noResultsMessage,
}: ExerciseComboboxProps) {
  const t = useTranslations('workout.exercises');
  const tCommon = useTranslations('common');

  // Defaults using translations
  const effectivePlaceholder = placeholder || t('search');
  const effectiveNoResults = noResultsMessage || t('notFound');

  // In modalità search, usa searchValue controllato se fornito, altrimenti stato locale
  const [internalValue, setInternalValue] = useState('');
  const inputValue = mode === 'search' && searchValue !== undefined ? searchValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LocalizedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(inputValue, 300); // 300ms debounce

  // Detect locale from browser if not provided
  const detectedLocale = locale || detectBrowserLocale();

  // Gestione cambio valore
  const handleInputChange = (value: string) => {
    if (mode === 'search' && onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalValue(value);
    }
  };

  /**
   * Fetch autocomplete results from API
   * Follows SOLID: Single Responsibility Principle
   */
  const fetchResults = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      let endpoint = '/api/exercises/autocomplete';
      try {
        const params = new URLSearchParams();

        if (includeUnapproved) {
          // Usa endpoint exercises per includere non approvati
          endpoint = '/api/exercises';
          params.set('search', query);
          params.set('locale', detectedLocale);
          params.set('page', '1');
          params.set('pageSize', '10');
          params.set('includeUnapproved', 'true');
        } else {
          // Usa endpoint autocomplete standard
          params.set('q', query);
          params.set('locale', detectedLocale);
          params.set('limit', '10');
        }

        // Aggiungi filtri opzionali
        if (filters?.muscleIds?.length) {
          params.set('muscleIds', filters.muscleIds.join(','));
        }
        if (filters?.bodyPartIds?.length) {
          params.set('bodyPartIds', filters.bodyPartIds.join(','));
        } else if (filters?.bodyParts?.length) {
          params.set('bodyParts', filters.bodyParts.join(','));
        }
        if (filters?.equipmentIds?.length) {
          params.set('equipmentIds', filters.equipmentIds.join(','));
        } else if (filters?.equipments?.length) {
          params.set('equipments', filters.equipments.join(','));
        }

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
          // Determine error message using translations
          let errorMessage = tCommon('errors.generic');
          if (response.status === 401) errorMessage = tCommon('errors.auth');
          else if (response.status === 403) errorMessage = tCommon('errors.accessDenied');
          else if (response.status === 500) errorMessage = tCommon('errors.server');

          logger.error('[ExerciseCombobox] API error:', {
            status: response.status,
            statusText: response.statusText,
            endpoint,
            query,
            errorMessage,
          });
          throw new Error(errorMessage);
        }

        let data;
        try {
          data = await response.json();
        } catch (_parseError: unknown) {
          logger.error('[ExerciseCombobox] JSON parse error:', _parseError);
          throw new Error(tCommon('errors.invalidResponse'));
        }

        // Gestisci formato diverso: autocomplete restituisce {data}, exercises restituisce {data: exercises[]}
        const exercises = Array.isArray(data.data) ? data.data : data.data || [];
        if (!Array.isArray(exercises)) {
          logger.warn('[ExerciseCombobox] Unexpected data format:', data);
          setResults([]);
          setIsOpen(false);
          return;
        }

        setResults(exercises);
        setIsOpen(true);
        setSelectedIndex(0);
        setError(null); // Reset error on success
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : err instanceof TypeError && err.message.includes('fetch')
              ? tCommon('errors.connection')
              : tCommon('errors.generic');

        logger.error('[ExerciseCombobox] Search error:', {
          error: err,
          message: errorMessage,
          query,
          endpoint,
        });

        setError(errorMessage);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [detectedLocale, filters, includeUnapproved, tCommon]
  );

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      void fetchResults(debouncedQuery);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, fetchResults]);

  /**
   * Handle exercise selection
   * Follows KISS: Keep It Simple
   */
  const handleSelect = (exercise: LocalizedExercise) => {
    const ex = exercise as any;
    if (mode === 'search') {
      // In modalità search, usa sempre lo slug per garantire ricerca affidabile
      // Lo slug è univoco e indipendente dalla lingua
      const searchQuery = ex.slug;
      if (onSearch) {
        onSearch(searchQuery);
      }
      if (onSearchChange) {
        onSearchChange(searchQuery);
      }
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(0);
    } else {
      // Modalità select originale
      if (onSelect) {
        onSelect(exercise);
      }
      handleInputChange('');
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(0);
    }
  };

  /**
   * Handle keyboard navigation
   * Follows best UX practices
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // In modalità search, Enter sempre triggera la ricerca
      if (mode === 'search' && onSearch && inputValue.trim()) {
        event.preventDefault();
        onSearch(inputValue.trim());
        setIsOpen(false);
        return;
      }

      // In modalità select, Enter seleziona il suggerimento se presente
      if (isOpen && results.length > 0 && results[selectedIndex]) {
        event.preventDefault();
        handleSelect(results[selectedIndex]);
        return;
      }
    }

    if (!isOpen || results.length === 0) {
      // In modalità search, permettere Enter anche senza suggerimenti
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      // Only call scrollIntoView if it exists (may not be available in test environment)
      if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-600" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={effectivePlaceholder}
          autoFocus={autoFocus}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-9 pl-9 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none dark:border-neutral-600"
          aria-label={t('search')}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="exercise-listbox"
          role="combobox"
        />
        {isLoading && (
          <Loader2 className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400 dark:text-neutral-600" />
        )}
        {!isLoading && inputValue && (
          <button
            onClick={() => {
              handleInputChange('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:text-neutral-600"
            aria-label={t('clear')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={listRef}
          id="exercise-listbox"
          role="listbox"
          className="absolute z-50 mt-1 max-h-[320px] w-full overflow-x-hidden overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {results.map((exercise: any, index) => (
            <button
              key={exercise.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(exercise)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left transition-colors last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-neutral-900 hover:bg-neutral-50 dark:bg-neutral-800/50 dark:text-neutral-100'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {exercise.translation?.name || exercise.slug}
                  </span>
                  {exercise.fallbackLocale && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                      ({exercise.fallbackLocale})
                    </span>
                  )}
                </div>
                {exercise.muscles.length > 0 && (
                  <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    {exercise.muscles
                      .slice(0, 3)
                      .map((m: { name: string }) => m.name)
                      .join(' · ')}
                  </div>
                )}
                {exercise.equipments.length > 0 && (
                  <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                    {exercise.equipments.map((e: { name: string }) => e.name).join(', ')}
                  </div>
                )}
              </div>
              {index === selectedIndex && <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isOpen && debouncedQuery.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
          {effectiveNoResults}
        </div>
      )}
    </div>
  );
}
