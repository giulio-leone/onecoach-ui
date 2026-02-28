/**
 * TemplateSaveDialog Component
 *
 * Dialog per salvare template (meal, day, week)
 * Mobile-first bottom sheet design
 */

'use client';

import type React from 'react';
import { Button } from '@giulio-leone/ui';
import { Modal, ModalFooter } from '@giulio-leone/ui';
import { useTranslations } from 'next-intl';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { NutritionTemplateType } from "@giulio-leone/types/nutrition";

interface TemplateSaveDialogProps {
  isOpen: boolean;
  templateType: NutritionTemplateType | null;
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
  'colazione',
  'pranzo',
  'cena',
  'snack',
  'pre-workout',
  'post-workout',
  'cut',
  'bulk',
  'maintenance',
  'vegetariano',
  'vegano',
  'keto',
  'low-carb',
  'high-protein',
];

export function TemplateSaveDialog({
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
}: TemplateSaveDialogProps) {
  const t = useTranslations('nutrition.templates');
  const tCommon = useTranslations('common');

  if (!isOpen || !templateType) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={tCommon('actions.saveAsTemplate')} size="md">
      <div className="space-y-4">
        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            {t('form.type')}
          </label>
          <div
            className={cn(
              'mt-1 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm',
              darkModeClasses.border.strong,
              darkModeClasses.bg.subtle,
              darkModeClasses.text.secondary
            )}
          >
            {t(`type.${templateType}`)}
          </div>
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            {t('form.name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
            placeholder={t('form.placeholders.name')}
            className={cn(
              'mt-1 min-h-[44px] w-full touch-manipulation rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-orange-500 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-900/50'
            )}
            autoFocus
          />
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            {t('form.description')}
          </label>
          <textarea
            value={templateDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onDescriptionChange(e.target.value)
            }
            placeholder={t('form.placeholders.description')}
            rows={3}
            className="mt-1 w-full touch-manipulation resize-none rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            {t('form.category')}
          </label>
          <select
            value={templateCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value)}
            className={cn(
              'mt-1 min-h-[44px] w-full touch-manipulation rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-orange-500 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-900/50'
            )}
          >
            <option value="">{tCommon('empty.noCategory')}</option>
            {CATEGORIES.map((cat: any) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={cn('block text-sm font-semibold', darkModeClasses.text.secondary)}>
            {t('form.tags')}
          </label>
          <input
            type="text"
            value={templateTags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTagsChange(e.target.value)}
            placeholder={t('form.placeholders.tags')}
            className={cn(
              'mt-1 min-h-[44px] w-full touch-manipulation rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-orange-500 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-900/50'
            )}
          />
          <p className={cn('mt-1 text-xs', darkModeClasses.text.muted)}>{t('form.tagsHelp')}</p>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            {tCommon('actions.cancel')}
          </Button>
          <Button onClick={onSave} disabled={isSaving || !templateName.trim()}>
            {isSaving ? tCommon('saving') : tCommon('actions.saveTemplate')}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
