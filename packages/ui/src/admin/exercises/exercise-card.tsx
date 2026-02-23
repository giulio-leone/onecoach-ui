/**
 * ExerciseCard Component
 *
 * Card moderna e responsive per singolo esercizio.
 * Massive rewamp: design moderno, gerarchia visiva migliorata, mobile-first
 * Principi: KISS, SOLID, DRY
 */

'use client';

import { useTranslations } from 'next-intl';
import type { LocalizedExercise } from '@giulio-leone/one-workout';
import { ExerciseApprovalStatus } from '@giulio-leone/types/client';
import { ExerciseTags } from './exercise-tags';
import { ExerciseActionsMenu, type ExerciseAction } from './exercise-actions-menu';
import { STATUS_BADGE_STYLES, STATUS_LABELS } from './exercise-constants';
import { ShieldCheck, ShieldX, Edit3, ClipboardList, Trash2, Dumbbell } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Checkbox, Heading, Text } from '@giulio-leone/ui';

function getExerciseName(exercise: LocalizedExercise): string {
  return exercise.translations?.[0]?.name || exercise.slug || exercise.id;
}

interface ExerciseCardProps {
  exercise: LocalizedExercise;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onApprove: (id: string, status: ExerciseApprovalStatus) => void;
  onEdit: (exercise: LocalizedExercise) => void;
  onDetail: (exercise: LocalizedExercise) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ExerciseCard({
  exercise,
  isSelected,
  onSelect,
  onApprove,
  onEdit,
  onDetail,
  onDelete,
  isLoading = false,
}: ExerciseCardProps) {
  const t = useTranslations();
  const actions: ExerciseAction[] = [
    {
      id: 'approve',
      label: 'Approva',
      icon: ShieldCheck,
      variant: 'secondary',
      onClick: () => onApprove(exercise.id, ExerciseApprovalStatus.APPROVED),
      disabled: isLoading,
    },
    {
      id: 'reject',
      label: 'Rifiuta',
      icon: ShieldX,
      variant: 'ghost',
      onClick: () => onApprove(exercise.id, ExerciseApprovalStatus.REJECTED),
      disabled: isLoading,
    },
    {
      id: 'edit',
      label: t('common.actions.edit'),
      icon: Edit3,
      variant: 'ghost',
      onClick: () => onEdit(exercise),
      disabled: isLoading,
    },
    {
      id: 'detail',
      label: 'Dettagli',
      icon: ClipboardList,
      variant: 'ghost',
      onClick: () => onDetail(exercise),
      disabled: isLoading,
    },
    {
      id: 'delete',
      label: t('common.actions.delete'),
      icon: Trash2,
      variant: 'danger',
      onClick: () => onDelete(exercise.id),
      disabled: isLoading,
    },
  ];

  return (
    <div
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'border-t first:border-t-0',
        isSelected
          ? cn('bg-blue-50/50 dark:bg-blue-900/10', 'border-blue-200 dark:border-blue-800/50')
          : cn(
              'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
              'hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-neutral-950/30'
            )
      )}
    >
      {/* Mobile Layout: Design Moderno */}
      <div className="block lg:hidden">
        <div className="p-4 sm:p-5">
          {/* Header: Checkbox + Icona + Nome + Status */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-0.5">
              <Checkbox
                checked={isSelected}
                onChange={() => onSelect(exercise.id)}
                className="cursor-pointer"
              />
            </div>

            {/* Icona Esercizio */}
            <div
              className={cn(
                'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl',
                'bg-gradient-to-br from-blue-500 to-indigo-600',
                'dark:from-blue-600 dark:to-indigo-700',
                'shadow-md dark:shadow-lg dark:shadow-blue-950/30',
                'border border-blue-400/20 dark:border-blue-500/30'
              )}
            >
              <Dumbbell className="h-7 w-7 text-white" />
            </div>

            {/* Nome + Status */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-start gap-2">
                <h3
                  className={cn(
                    'text-base leading-tight font-bold break-words sm:text-lg',
                    'text-neutral-900 dark:text-neutral-100'
                  )}
                >
                  {getExerciseName(exercise)}
                </h3>
                <span
                  className={cn(
                    'inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                    'shadow-sm',
                    STATUS_BADGE_STYLES[exercise.approvalStatus as ExerciseApprovalStatus]
                  )}
                >
                  {STATUS_LABELS[exercise.approvalStatus as ExerciseApprovalStatus]}
                </span>
              </div>

              {/* Overview */}
              {exercise.overview && (
                <p
                  className={cn(
                    'line-clamp-2 text-sm leading-relaxed',
                    'text-neutral-600 dark:text-neutral-300'
                  )}
                >
                  {exercise.overview}
                </p>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="mt-4">
            <ExerciseTags exercise={exercise} />
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end border-t pt-4 dark:border-neutral-700">
            <ExerciseActionsMenu actions={actions} />
          </div>
        </div>
      </div>

      {/* Desktop Layout: Grid Moderno */}
      <div className="hidden lg:grid lg:grid-cols-[50px_80px_1fr_auto] lg:items-center lg:gap-4 lg:px-5 lg:py-4">
        {/* Checkbox */}
        <div className="flex items-center">
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(exercise.id)}
            className="cursor-pointer"
          />
        </div>

        {/* Icona Esercizio */}
        <div
          className={cn(
            'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl',
            'bg-gradient-to-br from-blue-500 to-indigo-600',
            'dark:from-blue-600 dark:to-indigo-700',
            'shadow-md dark:shadow-lg dark:shadow-blue-950/30',
            'border border-blue-400/20 dark:border-blue-500/30',
            'transition-transform group-hover:scale-105'
          )}
        >
          <Dumbbell className="h-8 w-8 text-white" />
        </div>

        {/* Info: Nome, Status, Overview, Tags */}
        <div className="min-w-0 space-y-2.5">
          {/* Nome + Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Heading
              level={3}
              weight="bold"
              size="sm"
              className="truncate text-neutral-900 sm:text-lg dark:text-neutral-100"
            >
              {getExerciseName(exercise)}
            </Heading>
            <span
              className={cn(
                'inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                'shadow-sm',
                STATUS_BADGE_STYLES[exercise.approvalStatus as ExerciseApprovalStatus]
              )}
            >
              {STATUS_LABELS[exercise.approvalStatus as ExerciseApprovalStatus]}
            </span>
          </div>

          {/* Overview */}
          {exercise.overview && (
            <Text
              className="line-clamp-1 leading-relaxed text-neutral-600 dark:text-neutral-300"
              size="sm"
            >
              {exercise.overview}
            </Text>
          )}

          {/* Tags */}
          <ExerciseTags exercise={exercise} maxVisible={6} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <ExerciseActionsMenu actions={actions} />
        </div>
      </div>
    </div>
  );
}
