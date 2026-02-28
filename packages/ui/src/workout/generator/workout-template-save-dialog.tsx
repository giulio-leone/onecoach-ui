/**
 * WorkoutTemplateSaveDialog Component
 *
 * Dialog per salvare template workout (exercise, day, week)
 * Mobile-first bottom sheet design
 */

'use client';

import type React from 'react';
import { Button } from '@giulio-leone/ui';
import { Modal, ModalFooter } from '@giulio-leone/ui';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';
import type { WorkoutTemplateType } from '@giulio-leone/types/workout';

interface WorkoutTemplateSaveDialogProps {
  isOpen: boolean;
  templateType: WorkoutTemplateType | null;
  templateName: string;
  templateDescription: string;
  templateCategory: string;
  templateTags: string;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: string) => void;
  onTagsChange: (tags: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'push',
  'pull',
  'legs',
  'upper-body',
  'lower-body',
  'full-body',
  'cardio',
  'strength',
  'hypertrophy',
  'endurance',
  'mobility',
  'warmup',
  'cooldown',
];

type TemplateKind = WorkoutTemplateType | 'progression';

const TYPE_LABELS: Record<TemplateKind, string> = {
  exercise: 'Esercizio',
  day: 'Giorno',
  week: 'Settimana',
  progression: 'Progressione',
};

export function WorkoutTemplateSaveDialog({
  isOpen,
  templateType,
  templateName,
  templateDescription,
  templateCategory,
  templateTags,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onTagsChange,
  onSave,
  onCancel,
}: WorkoutTemplateSaveDialogProps) {
  const t = useTranslations();
  if (!isOpen || !templateType) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('common.actions.saveAsTemplate')} size="md">
      <div className="space-y-4">
        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            Tipo Template
          </label>
          <div
            className={cn(
              'mt-1 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm',
              darkModeClasses.border.base,
              darkModeClasses.bg.subtle,
              darkModeClasses.text.primary
            )}
          >
            {TYPE_LABELS[templateType]}
          </div>
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            Nome Template <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
            placeholder="Es: Push Day completo"
            className={cn(
              'mt-1 min-h-[44px] w-full touch-manipulation rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-500/30'
            )}
            autoFocus
          />
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            Descrizione (opzionale)
          </label>
          <textarea
            value={templateDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onDescriptionChange(e.target.value)
            }
            placeholder="Aggiungi una descrizione per questo template..."
            rows={3}
            className={cn(
              'mt-1 w-full touch-manipulation resize-none rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-500/30'
            )}
          />
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            Categoria (opzionale)
          </label>
          <select
            value={templateCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value)}
            className={cn(
              'mt-1 min-h-[44px] w-full touch-manipulation rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-500/30'
            )}
          >
            <option value="">{t('common.empty.noCategory')}</option>
            {CATEGORIES.map((cat: any) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            Tags (opzionale, separati da virgola, max 10)
          </label>
          <input
            type="text"
            value={templateTags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTagsChange(e.target.value)}
            placeholder="Es: petto, spalle, tricipiti"
            className={cn(
              'mt-1 min-h-[44px] w-full touch-manipulation rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-500/30'
            )}
          />
          <p className={cn('mt-1 text-xs', darkModeClasses.text.muted)}>
            Inserisci i tag separati da virgola (es: petto, spalle, tricipiti)
          </p>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Annulla
          </Button>
          <Button onClick={onSave} disabled={isSaving || !templateName.trim()}>
            {isSaving ? t('common.saving') : t('common.actions.saveTemplate')}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
