'use client';

import { useTranslations } from 'next-intl';
/**
 * ExerciseTags Component
 *
 * Componente moderno per renderizzare tag esercizi.
 * Massive rewamp: design migliorato, dark mode ottimizzata
 * Principi: KISS, SOLID, DRY
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminExercise as LocalizedExercise } from './types';
import { cn } from '@giulio-leone/lib-design-system';

interface ExerciseTagsProps {
  exercise: LocalizedExercise;
  maxVisible?: number;
  className?: string;
}

export function ExerciseTags({ exercise, maxVisible = 8, className = '' }: ExerciseTagsProps) {
  const t = useTranslations('admin');

  const [isExpanded, setIsExpanded] = useState(false);

  const tags = useMemo(() => {
    const result: Array<{
      id: string;
      label: string;
      type: 'bodyPart' | 'muscle' | 'equipment' | 'version';
      color: string;
    }> = [];

    // Body parts (max 3)
    exercise.bodyParts!
      .slice(0, 3)
      .forEach((bodyPart: { id: string; name?: string; slug?: string }) => {
        result.push({
          id: `body-${bodyPart.slug ?? bodyPart.id}`,
          label: bodyPart.name ?? '',
          type: 'bodyPart',
          color: cn(
            'bg-emerald-50 dark:bg-emerald-900/40',
            'text-emerald-700 dark:text-emerald-300',
            'border border-emerald-200 dark:border-emerald-800'
          ),
        });
      });

    // Muscles (max 4)
    exercise.muscles!.slice(0, 4).forEach((muscle) => {
      result.push({
        id: `muscle-${muscle.slug ?? muscle.id}-${muscle.role}`,
        label: `${muscle.name} · ${muscle.role?.toLowerCase() ?? ''}`,
        type: 'muscle',
        color: cn(
          'bg-secondary-50 dark:bg-secondary-900/40',
          'text-secondary-700 dark:text-secondary-300',
          'border border-secondary-200 dark:border-secondary-800'
        ),
      });
    });

    // Equipments (max 3, o Bodyweight se vuoto)
    const equipments = exercise.equipment!.length
      ? exercise.equipment!.slice(0, 3)
      : [{ name: 'Bodyweight', slug: 'bodyweight' }];

    equipments.forEach((equipment) => {
      result.push({
        id: `equipment-${equipment.slug}`,
        label: equipment.name ?? '',
        type: 'equipment',
        color: cn(
          'bg-neutral-100 dark:bg-white/[0.04]',
          'text-neutral-700 dark:text-neutral-300',
          'border border-neutral-200/60 dark:border-white/[0.08]'
        ),
      });
    });

    // Version
    result.push({
      id: 'version',
      label: `v${exercise.version}`,
      type: 'version',
      color: cn(
        'bg-primary-50 dark:bg-primary-900/40',
        'text-primary-700 dark:text-primary-300',
        'border border-primary-200 dark:border-primary-800'
      ),
    });

    return result;
  }, [exercise]);

  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible);
  const hasMoreTags = tags.length > maxVisible;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {visibleTags.map((tag: any) => (
          <span
            key={tag.id}
            className={cn(
              'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
              'shadow-sm transition-all hover:shadow-md',
              tag.color
            )}
          >
            {tag.label}
          </span>
        ))}
      </div>
      {hasMoreTags && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-1 text-xs font-medium transition-colors',
            'min-h-[2.75rem] touch-manipulation rounded-lg px-2 py-1',
            'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              {t('admin.exercise_tags.mostra_meno')}
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              {t('admin.exercise_tags.mostra_altri')}
              {tags.length - maxVisible}
            </>
          )}
        </button>
      )}
    </div>
  );
}
