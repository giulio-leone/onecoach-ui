/**
 * NutritionTemplateSelector Component
 *
 * Componente per selezionare template di nutrizione (meal, day, week)
 * Include filtri avanzati, ricerca e cronologia
 */

// Fixed component with correct imports and logic
'use client';
import React, { useState } from 'react';
import { Search, Filter, Trash2, Calendar, Utensils, Sun, Moon, Coffee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@giulio-leone/ui';
import { SelectionActionBarWeb } from './selection-action-bar-web';
import { EmptyState } from '@giulio-leone/ui';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { logger } from '@giulio-leone/lib-shared';
import type { NutritionTemplate, NutritionTemplateType } from '@giulio-leone/types/nutrition';
import { format } from 'date-fns';

type NutritionTemplateSelectorProps = {
  type: NutritionTemplateType;
  onSelect: (template: NutritionTemplate) => void;
  onClose: () => void;
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  meal: Utensils,
  day: Sun,
  week: Calendar,
  snack: Coffee,
  dinner: Moon,
};

export function NutritionTemplateSelector({
  type,
  onSelect,
  // onClose, // Unused
}: NutritionTemplateSelectorProps) {
  const t = useTranslations('nutrition.templates');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMouseInteracting, setIsMouseInteracting] = useState(false);

  // Fetch templates
  const {
    data: templates = [],
    isLoading,
    refetch: loadTemplates,
  } = useQuery({
    queryKey: ['nutrition-templates', type],
    queryFn: async () => {
      const response = await fetch(`/api/nutrition-templates?type=${type}`);
      if (!response.ok) throw new Error('Failed to load templates');
      return response.json();
    },
  });

  // Filter logic
  const filteredTemplates = templates.filter((template: NutritionTemplate) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = true;
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesTags && matchesCategory;
  });

  // Selection logic
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
    if (newSet.size === 0) setSelectionMode(false);
  };

  const handleSelect = (template: NutritionTemplate) => {
    if (selectionMode) {
      toggleSelection(template.id);
    } else {
      onSelect(template);
    }
  };

  const startSelection = (id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const TypeIcon = TYPE_ICONS[type] || TYPE_ICONS.meal;

  return (
    <div className={cn('flex h-full flex-col', darkModeClasses.bg.base)}>
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Search & Filters Header */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={cn(
                  'w-full rounded-xl border py-2 pr-4 pl-9 text-sm transition-all outline-none focus:ring-2',
                  darkModeClasses.input.base,
                  darkModeClasses.input.focus
                )}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
              title={t('toggleFilters')}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div
              className={cn(
                'space-y-4 rounded-xl border p-4',
                darkModeClasses.bg.subtle,
                darkModeClasses.border.base
              )}
            >
              {/* Category Filter */}
              <div>
                <h5
                  className={cn(
                    'mb-2 text-xs font-semibold tracking-wider uppercase',
                    darkModeClasses.text.secondary
                  )}
                >
                  {t('form.category')}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {['colazione', 'pranzo', 'cena', 'snack'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        selectedCategory === cat
                          ? 'border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-neutral-500">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <EmptyState
              title={t('empty.title')}
              description={t('empty.description')}
              icon={TypeIcon}
              action={<Button onClick={() => {}}>{t('empty.action')}</Button>}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template: NutritionTemplate) => {
                const isSelected = selectedIds.has(template.id);
                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      if (!isMouseInteracting) handleSelect(template);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      startSelection(template.id);
                    }}
                    className={cn(
                      'group relative cursor-pointer touch-manipulation overflow-hidden rounded-xl border-2 p-4 transition-all duration-200',
                      darkModeClasses.card.base,
                      isSelected
                        ? selectionMode
                          ? 'border-blue-500 bg-blue-50/50 shadow-md dark:border-blue-500 dark:bg-blue-900/20'
                          : 'border-green-500 bg-green-50/50 shadow-md dark:border-green-500 dark:bg-green-900/20'
                        : 'border-neutral-200 hover:border-green-400 hover:bg-green-50/30 dark:border-neutral-700 dark:hover:border-green-500 dark:hover:bg-green-900/10',
                      darkModeClasses.interactive.button
                    )}
                    role="button"
                    tabIndex={0}
                    onMouseDown={() => setIsMouseInteracting(true)}
                    onMouseUp={() => setTimeout(() => setIsMouseInteracting(false), 100)}
                    onTouchStart={() => setIsMouseInteracting(true)}
                    onTouchEnd={() => setTimeout(() => setIsMouseInteracting(false), 300)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 rounded-xl p-3 transition-all duration-200',
                          isSelected
                            ? 'bg-green-600 text-white dark:bg-green-500'
                            : 'bg-green-100 text-green-700 group-hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:group-hover:bg-green-900/40'
                        )}
                      >
                        {TypeIcon && <TypeIcon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn('text-base font-bold', darkModeClasses.text.primary)}>
                            {template.name}
                          </h4>
                          <span
                            className={cn(
                              'flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                              darkModeClasses.bg.muted,
                              darkModeClasses.text.secondary
                            )}
                          >
                            {template.category || type}
                          </span>
                        </div>
                        {template.description && (
                          <p
                            className={cn(
                              'mt-1 line-clamp-2 text-sm',
                              darkModeClasses.text.tertiary
                            )}
                          >
                            {template.description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-500">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-neutral-400">
                          Last used:{' '}
                          {template.lastUsedAt
                            ? format(new Date(template.lastUsedAt), 'PPP')
                            : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selection Action Bar - simplified since original was app specific */}
      {selectionMode && (
        <SelectionActionBarWeb
          isVisible={selectionMode}
          selectedCount={selectedIds.size}
          onClose={exitSelectionMode}
          actions={[
            {
              id: 'delete',
              label: tCommon('actions.delete'),
              icon: Trash2,
              variant: 'danger',
              onPress: async () => {
                if (confirm(tCommon('confirmDeleteTemplates', { count: selectedIds.size }))) {
                  const ids = Array.from(selectedIds);
                  for (const id of ids) {
                    try {
                      await fetch(`/api/nutrition-templates/${id}`, { method: 'DELETE' });
                    } catch (e) {
                      logger.error('Failed to delete', id, e);
                    }
                  }
                  await loadTemplates();
                  exitSelectionMode();
                }
              },
            },
          ]}
        />
      )}
    </div>
  );
}
