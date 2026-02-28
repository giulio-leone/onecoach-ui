/**
 * Workout Template Selector
 *
 * Componente unificato per selezionare template workout (Exercise, Day, Week)
 * Mobile-first, responsive, touch-friendly
 * Segue principi KISS, DRY, SOLID
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Loader2,
  Bookmark,
  Clock,
  X,
  Dumbbell,
  Calendar,
  CalendarDays,
  Filter,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from '@giulio-leone/ui';
import { useDebounce } from '@giulio-leone/hooks';
import type { WorkoutTemplate, WorkoutTemplateType } from '@giulio-leone/types/workout';

interface WorkoutTemplateSelectorProps {
  type?: WorkoutTemplateType; // Se specificato, filtra solo quel tipo
  onSelect: (template: WorkoutTemplate) => void;
  onClose: () => void;
  placeholder?: string;
  className?: string;
}

type TemplateKind = WorkoutTemplateType | 'progression';
type IconComponent = ComponentType<{ className?: string; size?: number }>;

const TYPE_ICONS: Record<TemplateKind, IconComponent> = {
  exercise: Dumbbell,
  day: Calendar,
  week: CalendarDays,
  progression: Bookmark,
};

const TYPE_LABELS: Record<TemplateKind, string> = {
  exercise: 'Esercizio',
  day: 'Giorno',
  week: 'Settimana',
  progression: 'Progressione',
};

export function WorkoutTemplateSelector({
  type,
  onSelect,
  onClose,
  placeholder = 'Cerca template...',
  className = '',
}: WorkoutTemplateSelectorProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<WorkoutTemplateType | 'all'>(type || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMouseInteracting, setIsMouseInteracting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/workout-templates/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (_error) {
        // Fallback to empty array
        setCategories([]);
      }
    };
    void loadCategories();
  }, []);

  // Carica template
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.set('type', selectedType);
      }
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (debouncedQuery.trim()) {
        params.set('search', debouncedQuery.trim());
      }
      params.set('sortBy', 'lastUsedAt');
      params.set('sortOrder', 'desc');

      const response = await fetch(`/api/workout-templates?${params.toString()}`);

      if (!response.ok) {
        throw new Error(t('common.errors.loadingTemplates'));
      }

      const data = await response.json();
      setTemplates(data.workoutTemplates || []);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errors.loadingError'));
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedType, selectedCategory]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < templates.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && templates[selectedIndex]) {
        e.preventDefault();
        handleSelect(templates[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // handleSelect is a stable callback and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, selectedIndex, onClose]);

  // Scroll to selected item
  useEffect(() => {
    if (listRef.current && templates.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, templates.length]);

  const handleSelect = (template: WorkoutTemplate) => {
    // Incrementa contatore utilizzi (non bloccante)
    void fetch(`/api/workout-templates/${template.id}/use`, { method: 'POST' }).catch(() => {});
    onSelect(template);
  };

  const getTypeIcon = (templateType: WorkoutTemplateType) => {
    const Icon = TYPE_ICONS[templateType as TemplateKind];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center ${className}`}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-selector-title"
    >
      <Card
        variant="glass"
        className="animate-slide-up w-full max-w-2xl overflow-hidden rounded-t-3xl p-0 shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
        onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/50 bg-white/80 px-4 py-5 backdrop-blur-md sm:px-6 dark:border-white/[0.08] dark:bg-neutral-900/80">
          <h3
            id="template-selector-title"
            className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-neutral-100"
          >
            Seleziona Template
          </h3>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-neutral-200"
            aria-label="Chiudi"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="border-b border-neutral-200/50 bg-neutral-50/50 px-4 py-4 backdrop-blur-sm sm:px-6 dark:border-white/[0.08] dark:bg-neutral-900/30">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-4 pl-10 text-sm text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-neutral-700 dark:bg-white/[0.04] dark:text-neutral-100 dark:focus:border-primary-400 dark:focus:ring-primary-500/30"
                autoFocus
              />
            </div>
          </div>

          {/* Type Filter */}
          {!type && (
            <div className="scrollbar-hide mb-2 flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="h-4 w-4 flex-shrink-0 text-neutral-400" />
              <button
                onClick={() => setSelectedType('all')}
                className={cn(
                  'h-9 flex-shrink-0 rounded-full px-4 text-xs font-semibold transition-all',
                  selectedType === 'all'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]'
                )}
                type="button"
              >
                Tutti
              </button>
              {(['exercise', 'day', 'week'] as const).map((t: any) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={cn(
                    'flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all',
                    selectedType === t
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]'
                  )}
                  type="button"
                >
                  {getTypeIcon(t)}
                  {(TYPE_LABELS as any)[t]}
                </button>
              ))}
            </div>
          )}

          {/* Category Filter */}
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'h-9 flex-shrink-0 rounded-full px-4 text-xs font-semibold transition-all',
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]'
              )}
              type="button"
            >
              Tutte le categorie
            </button>
            {categories.slice(0, 8).map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'h-9 flex-shrink-0 rounded-full px-4 text-xs font-semibold transition-all',
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]'
                )}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto bg-white/50 px-4 py-4 backdrop-blur-sm sm:px-6 dark:bg-neutral-900/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-500" />
              <span className="mt-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t('common.loadingTemplates')}
              </span>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/[0.04]">
                <Bookmark className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                  ? 'Nessun template trovato. Prova a modificare i filtri.'
                  : 'Nessun template salvato. Crea il tuo primo template!'}
              </p>
            </div>
          ) : (
            <div ref={listRef} className="space-y-3">
              {templates.map((template, index) => {
                const TypeIcon = TYPE_ICONS[template.type];
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    onMouseEnter={() => {
                      // Only update on hover if not in touch/click interaction
                      if (!isMouseInteracting) setSelectedIndex(index);
                    }}
                    onMouseDown={() => {
                      setIsMouseInteracting(true);
                      setSelectedIndex(index);
                    }}
                    onMouseUp={() => {
                      // Delay reset to avoid hover stealing selection on release
                      setTimeout(() => setIsMouseInteracting(false), 100);
                    }}
                    onTouchStart={() => {
                      setIsMouseInteracting(true);
                      setSelectedIndex(index);
                    }}
                    onTouchEnd={() => {
                      setTimeout(() => setIsMouseInteracting(false), 300);
                    }}
                    className={cn(
                      'group cursor-pointer rounded-xl border p-4 transition-all duration-200',
                      isSelected
                        ? 'border-primary-500 bg-primary-50/50 shadow-md dark:border-primary-500 dark:bg-primary-900/20'
                        : 'border-neutral-200 bg-white hover:border-primary-400 hover:bg-primary-50/30 dark:border-neutral-700 dark:bg-white/[0.04] dark:hover:border-primary-500 dark:hover:bg-primary-900/10'
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label={`Seleziona template ${template.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(template);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 rounded-xl p-3 transition-all duration-200',
                          isSelected
                            ? 'bg-primary-600 text-white dark:bg-primary-500'
                            : 'bg-primary-100 text-primary-700 group-hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:group-hover:bg-primary-900/40'
                        )}
                      >
                        {TypeIcon && <TypeIcon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                            {template.name}
                          </h4>
                          <span className="flex-shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400">
                            {TYPE_LABELS[template.type as keyof typeof TYPE_LABELS]}
                          </span>
                        </div>
                        {template.description && (
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {template.description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          {template.category && (
                            <span className="rounded-full bg-primary-100 px-2.5 py-1 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                              {template.category}
                            </span>
                          )}
                          {template.usageCount > 0 && (
                            <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 font-medium dark:bg-white/[0.04]">
                              <Clock className="h-3 w-3" />
                              {template.usageCount} usi
                            </span>
                          )}
                          {template.lastUsedAt && (
                            <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 font-medium dark:bg-white/[0.04]">
                              <Clock className="h-3 w-3" />
                              {new Date(template.lastUsedAt).toLocaleDateString('it-IT', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>
                        {template.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {template.tags.slice(0, 3).map((tag: any) => (
                              <span
                                key={tag}
                                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-neutral-200/50 bg-neutral-50/50 px-4 py-3 text-center text-xs font-medium text-neutral-500 backdrop-blur-sm sm:px-6 dark:border-white/[0.08] dark:bg-neutral-900/30 dark:text-neutral-400">
          <span className="hidden sm:inline">Usa ↑↓ per navigare, </span>
          <span>Invio per selezionare, Esc per chiudere</span>
        </div>
      </Card>
    </div>
  );
}
