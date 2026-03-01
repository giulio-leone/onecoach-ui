/**
 * Food Selector Component
 *
 * Autocomplete con search BM25 per selezione alimenti
 * Usato per aggiungere alimenti ai piani nutrizionali
 * Integra risultati locali + OpenFoodFacts
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, X, Check, Globe } from 'lucide-react';
import type { FoodItem } from '@giulio-leone/types/nutrition';
import { logger } from '@giulio-leone/lib-shared';
import { useTranslations, useLocale } from 'next-intl';

interface FoodResultItem extends FoodItem {
  source?: 'local' | 'openfoodfacts';
}

export interface FoodSelectorProps {
  onSelect: (foodItem: FoodItem, quantity?: number) => void;
  placeholder?: string;
  className?: string;
  limit?: number;
}

export function FoodSelector({
  onSelect,
  placeholder,
  className = '',
  limit = 10,
}: FoodSelectorProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isImporting, setIsImporting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchFoods = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/food/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&locale=${encodeURIComponent(locale)}`
        );

        if (!response.ok) {
          throw new Error(t('food.searchError'));
        }

        const data = await response.json();
        setResults(data.data || []);
        setIsOpen(true);
      } catch (error: unknown) {
        logger.error(t('error'), error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, locale, t]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchFoods(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchFoods]);

  const importExternalFood = async (food: FoodResultItem): Promise<FoodItem | null> => {
    try {
      const metadataBrand = typeof food.metadata?.brand === 'string' ? food.metadata.brand : null;
      const response = await fetch('/api/food/import-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: food.metadata?.externalId ?? food.id.replace('off:', ''),
          name: food.name,
          barcode: food.barcode ?? null,
          macrosPer100g: food.macrosPer100g,
          servingSize: food.servingSize,
          unit: food.unit,
          imageUrl: food.imageUrl ?? null,
          brand: metadataBrand,
          source: 'openfoodfacts',
          locale,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.data ?? null;
    } catch (error) {
      logger.error('Import external food error', error);
      return null;
    }
  };

  const handleSelect = async (foodItem: FoodResultItem) => {
    // If it's an external item, import it first
    if (foodItem.source === 'openfoodfacts') {
      setIsImporting(true);
      try {
        const imported = await importExternalFood(foodItem);
        if (imported) {
          onSelect(imported);
        } else {
          // Fallback: pass the external item as-is
          onSelect(foodItem);
        }
      } finally {
        setIsImporting(false);
      }
    } else {
      onSelect(foodItem);
    }

    setQuery('');
    setResults([]);
    setIsOpen(false);
    searchRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selected = results[selectedIndex];
          if (selected) {
            handleSelect(selected);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        searchRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-600" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay to allow click events
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder || t('food.searchPlaceholder')}
          className="w-full rounded-xl border border-neutral-300 bg-white py-3 pr-10 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none dark:border-white/[0.1] dark:bg-zinc-950 dark:text-neutral-100 dark:text-neutral-600"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-neutral-200/60 bg-white shadow-lg dark:border-white/[0.08] dark:bg-zinc-950"
        >
          {isLoading || isImporting ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400 dark:text-neutral-600" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
              {t('empty.noFoods')}
            </div>
          ) : (
            <div className="py-2">
              {results.map((food, index) => (
                <button
                  key={food.id}
                  onClick={() => handleSelect(food)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary-50'
                      : 'hover:bg-neutral-50 dark:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                        {food.name}
                        {food.source === 'openfoodfacts' && (
                          <Globe className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                        )}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                        {food.macrosPer100g.calories} {t('common.food_selector.kcal_p')}
                        {food.macrosPer100g.protein}
                        {t('common.food_selector.g_c')}
                        {food.macrosPer100g.carbs}
                        {t('common.food_selector.g_f')}
                        {food.macrosPer100g.fats}g
                      </div>
                    </div>
                    {index === selectedIndex && <Check className="h-5 w-5 text-primary-600" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
