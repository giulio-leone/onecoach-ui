/**
 * MetadataMultiSelect
 *
 * Componente per selezione multipla di metadati (tipi esercizio, muscoli, parti del corpo, attrezzature, obiettivi workout)
 * Carica i dati dal database usando l'API /api/metadata
 */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Checkbox } from '@giulio-leone/ui';
import { useTranslations } from 'next-intl';

export type MetadataType = 'exerciseType' | 'muscle' | 'bodyPart' | 'equipment' | 'workoutGoal';

interface MetadataOption {
  id: string;
  name: string;
  localizedName: string;
}

interface MetadataMultiSelectProps {
  type: MetadataType;
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  multiple?: boolean;
  locale?: string;
  variant?: 'dropdown' | 'list';
  enableSearch?: boolean;
}

// Mappa dei nomi dei campi nella risposta API
const METADATA_FIELD_MAP: Record<MetadataType, string> = {
  exerciseType: 'exerciseTypes',
  muscle: 'muscles',
  bodyPart: 'bodyParts',
  equipment: 'equipment',
  workoutGoal: 'workoutGoals',
};

/**
 * Converte un array di metadata dalla risposta API in MetadataOption[]
 */
function mapMetadataOptions(
  items: Array<{ id: string; name: string; localizedName?: string }>
): MetadataOption[] {
  return items.map((item: { id: string; name: string; localizedName?: string }) => ({
    id: item.id,
    name: item.name,
    localizedName: item.localizedName ?? item.name,
  }));
}

/**
 * Estrae le opzioni metadata dalla risposta API in base al tipo
 */
function extractMetadataOptions(
  responseData: Record<string, unknown>,
  type: MetadataType
): MetadataOption[] {
  const fieldName = METADATA_FIELD_MAP[type];
  const data = responseData[fieldName];

  if (!Array.isArray(data)) {
    throw new Error(`Campo data.${fieldName} mancante o non valido`);
  }

  return mapMetadataOptions(data);
}

/**
 * Valida e normalizza il locale
 */
function normalizeLocale(locale?: string): string {
  if (!locale || locale.length === 0) return 'it';
  return locale.substring(0, 8);
}

export function MetadataMultiSelect({
  type,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
  multiple = true,
  locale = 'it',
  variant = 'dropdown',
  enableSearch = true,
}: MetadataMultiSelectProps) {
  const t = useTranslations('admin.metadata');

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<MetadataOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Carica i dati dal database
  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      const t = useTranslations('admin');
      if (cancelled) return;

      setIsLoading(true);
      setError(null);

      const validLocale = normalizeLocale(locale);

      try {
        const response = await fetch(`/api/metadata?locale=${validLocale}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data?.success || !data?.data || typeof data.data !== 'object') {
          throw new Error('Invalid API response');
        }

        const metadataOptions = extractMetadataOptions(data.data, type);

        if (metadataOptions.length === 0) {
          // Use generic message if translation interpolation is tricky here, or pre-calculated
          // Usually better to set a code and translate in render, but for now we set null and handle in render
          // Or just set a generic key
        }

        // We handle empty state in render, so no need to set error string here generally
        // But original code did, so let's keep logic but use simple string to indicate "empty"
        // actually let's just clear error if options found, if not found logic is handled in render
        if (metadataOptions.length === 0) {
          // For now keeping empty
        }

        if (!cancelled) {
          setOptions(metadataOptions);
          // If 0 options, we can set a specific error state or just let the UI show "No options"
        }
      } catch (_err: unknown) {
        const errorMessage = _err instanceof Error ? _err.message : t('error');

        if (!cancelled) {
          setError(errorMessage);
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [type, locale, t]); // Added t to dependency not strictly needed but good practice if locale changes

  // Filtra opzioni in base alla ricerca
  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();
    return options.filter((opt: any) =>
        opt.name.toLowerCase().includes(query) || opt.localizedName.toLowerCase().includes(query)
    );
  }, [options, searchQuery, enableSearch]);

  // Trova le opzioni selezionate
  const selectedOptions = useMemo(() => {
    return options.filter((opt: any) => value.includes(opt.id));
  }, [options, value]);

  const handleToggle = useCallback(
    (optionId: string) => {
      if (!multiple) {
        onChange(value.includes(optionId) ? [] : [optionId]);
        setIsOpen(false);
      } else {
        onChange(
          value.includes(optionId)
            ? value.filter((v: string) => v !== optionId)
            : [...value, optionId]
        );
      }
    },
    [multiple, value, onChange]
  );

  const handleRemove = useCallback(
    (optionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v: string) => v !== optionId));
    },
    [value, onChange]
  );

  const handleReload = useCallback(async () => {
    const t = useTranslations('admin');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/metadata?locale=${normalizeLocale(locale)}`);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Invalid response');

      const metadataOptions = extractMetadataOptions(data.data, type);
      setOptions(metadataOptions);

      if (metadataOptions.length === 0) {
        // Handled in UI
      } else {
        setError(null);
        if (variant === 'dropdown') setIsOpen(true);
      }
    } catch (_err: unknown) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  }, [type, locale, variant, t]);

  const handleFieldClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isLoading && options.length > 0) {
        setIsOpen(!isOpen);
      } else if (!isLoading && options.length === 0 && !error) {
        void handleReload();
      }
    },
    [isLoading, options.length, isOpen, error, handleReload]
  );

  // Variant: list (checkbox group inline)
  if (variant === 'list') {
    return (
      <div className="relative">
        <label className="mb-1 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>

        <div className="rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.04] dark:bg-zinc-950">
          {isLoading ? (
            <p className="px-1 py-2 text-sm text-neutral-500 dark:text-neutral-400">
              {t('loading')}
            </p>
          ) : error ? (
            <p className="px-1 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : options.length === 0 ? (
            <p className="px-1 py-2 text-sm text-neutral-500 dark:text-neutral-400">
              {t('noOptions')}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {options.map((opt: MetadataOption) => {
                const checked = value.includes(opt.id);
                return (
                  <Checkbox
                    key={opt.id}
                    label={opt.localizedName}
                    checked={checked}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(
                        e.target.checked
                          ? [...value, opt.id]
                          : value.filter((v: string) => v !== opt.id)
                      )
                    }
                    className="flex items-center gap-2"
                  />
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }

  // Default: dropdown
  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div
        onClick={handleFieldClick}
        onMouseDown={(e: React.MouseEvent) => {
          if (isOpen) e.preventDefault();
        }}
        className={`relative flex min-h-[42px] w-full items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm transition-all dark:border-white/[0.1] dark:bg-white/[0.04] dark:bg-zinc-950 ${
          isLoading
            ? 'cursor-wait opacity-60'
            : options.length === 0 && !error
              ? 'cursor-not-allowed opacity-50'
              : isOpen
                ? 'cursor-pointer border-primary-500 shadow-sm ring-2 ring-emerald-200 dark:border-emerald-400 dark:ring-emerald-800'
                : 'cursor-pointer hover:border-primary-400 hover:shadow-sm focus:border-primary-500 dark:hover:border-primary-500 dark:focus:border-primary-400'
        }`}
      >
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {selectedOptions.length === 0 ? (
            <span
              className={
                options.length > 0
                  ? 'text-neutral-600 dark:text-neutral-300'
                  : 'text-neutral-400 dark:text-neutral-500'
              }
            >
              {placeholder || t('placeholder')}
              {options.length > 0 && (
                <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t('available', { count: options.length })}
                </span>
              )}
            </span>
          ) : (
            selectedOptions.map((opt: MetadataOption) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
              >
                {opt.localizedName}
                {multiple && (
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent<HTMLElement>) => handleRemove(opt.id, e)}
                    className="rounded-full p-0.5 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-800"
                    aria-label={t('remove', { item: opt.localizedName })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 dark:text-neutral-500 dark:text-neutral-600 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
          />
          <div
            className="absolute z-[101] mt-1 w-full rounded-lg border border-neutral-200/60 bg-white shadow-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:bg-zinc-950"
            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
          >
            {enableSearch && (
              <div className="border-b border-neutral-200/60 p-2 dark:border-white/[0.08]">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-9 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.04] dark:bg-zinc-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-primary-400 dark:focus:ring-primary-800"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent dark:border-emerald-400"></div>
                  <p className="mt-2">{t('loading')}</p>
                </div>
              ) : error ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                  <button
                    type="button"
                    onClick={handleReload}
                    className="mt-2 text-xs text-emerald-600 underline transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    {t('retry')}
                  </button>
                </div>
              ) : options.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p>{t('noOptions')}</p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {t('contactAdmin', { type: t(`types.${type}`) })}
                  </p>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  {t('noResults', { query: searchQuery })}
                </div>
              ) : (
                filteredOptions.map((option: MetadataOption) => {
                  const isSelected = value.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggle(option.id)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:text-neutral-200 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{option.localizedName}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {error && !isOpen && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
    </div>
  );
}
