'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Input,
  Modal,
  ModalFooter,
  Checkbox,
  LoadingIndicator,
  ErrorState,
} from '@onecoach/ui';
import { Save } from 'lucide-react';
import {
  useExercise,
  useCreateExercise,
  useUpdateExercise,
} from '@onecoach/features/exercise/hooks';
import { useForm } from '@onecoach/hooks';
import { ExerciseTypeCombobox } from './exercise-type-combobox';
import { MusclesMultiselect } from './muscles-multiselect';
import { BodyPartsMultiselect } from './body-parts-multiselect';
import { EquipmentsMultiselect } from './equipments-multiselect';
import type { AdminExercise } from './types';

interface ExerciseFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  exerciseId?: string;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

interface ExerciseFormValues {
  slug: string;
  englishName: string;
  italianName: string;
  videoUrl: string;
  imageUrl: string;
  keywords: string;
  isUserGenerated: boolean;
  autoApprove: boolean;
  exerciseTypeId?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  bodyParts: string[];
  equipments: string[];
}

export function ExerciseFormModal({
  isOpen,
  mode,
  exerciseId,
  onClose,
  onSuccess,
}: ExerciseFormModalProps) {
  const t = useTranslations();
  const tAdmin = useTranslations('admin');
  const {
    data: response,
    isLoading: isLoadingExercise,
    error: exerciseError,
  } = useExercise(mode === 'edit' && exerciseId ? exerciseId : null);

  const exercise = response?.exercise;

  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();

  const form = useForm<ExerciseFormValues>({
    initialValues: {
      slug: '',
      englishName: '',
      italianName: '',
      videoUrl: '',
      imageUrl: '',
      keywords: '',
      isUserGenerated: false,
      autoApprove: false,
      exerciseTypeId: '',
      primaryMuscles: [],
      secondaryMuscles: [],
      bodyParts: [],
      equipments: [],
    },
    onSubmit: async (values) => {
      // Manual Validation
      if (!values.englishName) throw new Error(tAdmin('common.errors.generic'));

      const payload = {
        slug: values.slug || undefined,
        name: values.englishName,
        translations: [
          { language: 'en', name: values.englishName, description: '' },
          { language: 'it', name: values.italianName, description: '' },
        ].filter((t) => t.name),
        exerciseTypeId: values.exerciseTypeId,
        videoUrl: values.videoUrl || undefined,
        imageUrl: values.imageUrl || undefined,
        muscles: [...values.primaryMuscles, ...values.secondaryMuscles], // Simplified mapping logic
        bodyParts: values.bodyParts,
        equipments: values.equipments,
        keywords: values.keywords ? values.keywords.split(',').map((k) => k.trim()) : [],
        metadata: {
          isUserGenerated: values.isUserGenerated,
          autoApprove: values.autoApprove,
        },
      };

      if (mode === 'create') {
        await createExercise.mutateAsync(payload);
      } else if (exerciseId) {
        await updateExercise.mutateAsync({ id: exerciseId, data: payload });
      }
      await onSuccess();
      onClose();
    },
    validateOnBlur: false,
  });

  const hasPrefilledRef = useRef<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && exercise) {
      const e = exercise as AdminExercise;

      if (hasPrefilledRef.current === e.id) return;
      hasPrefilledRef.current = e.id;

      // Use 'locale' not 'language' based on ExerciseTranslationView interface
      const en = e.translations?.find((t) => t.locale === 'en')?.name || e.name || '';
      const it = e.translations?.find((t) => t.locale === 'it')?.name || '';

      form.setValues({
        slug: e.slug || '',
        englishName: en,
        italianName: it,
        videoUrl: e.videoUrl || '',
        imageUrl: e.imageUrl || '',
        keywords: Array.isArray(e.keywords) ? e.keywords.join(', ') : (e.keywords as string) || '',
        isUserGenerated: e.metadata?.isUserGenerated || false,
        autoApprove: e.metadata?.autoApprove || false,
        exerciseTypeId: e.exerciseTypeId || '',
        primaryMuscles: e.muscles?.filter((m) => m.role === 'PRIMARY').map((m) => m.id) || [],
        secondaryMuscles: e.muscles?.filter((m) => m.role === 'SECONDARY').map((m) => m.id) || [],
        bodyParts: e.bodyParts?.map((b) => b.id) || [],
        equipments: e.equipments?.map((eq) => eq.id) || [],
      });
    } else if (mode === 'create') {
      hasPrefilledRef.current = null;
      form.reset();
    }
  }, [exercise, mode, form]);

  const isSubmitting = createExercise.isPending || updateExercise.isPending;
  const isLoading = mode === 'edit' && isLoadingExercise;

  const formError = exerciseError?.message;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('common.loading')} size="lg">
        <LoadingIndicator message={t('common.loadingExercise')} size="sm" />
      </Modal>
    );
  }

  if (exerciseError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('common.error')} size="lg">
        <ErrorState error={exerciseError} title={t('common.errors.loadingExercise')} />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? t('common.actions.create') : t('common.actions.edit')}
      size="lg"
    >
      <form onSubmit={form.handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <Input
              label={t('admin.exercise_form_modal.nome_en')}
              placeholder={t('admin.exercise_form_modal.barbell_bench_press')}
              value={form.values.englishName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('englishName', e.target.value)
              }
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="sm:col-span-1">
            <Input
              label={t('common.food.name') + ' (IT)'}
              placeholder={t('admin.exercise_form_modal.panca_piana')}
              value={form.values.italianName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('italianName', e.target.value)
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.category')}*
            </label>
            <ExerciseTypeCombobox
              value={form.values.exerciseTypeId}
              onChange={(id) => form.setValue('exerciseTypeId', id || undefined)}
            />
          </div>

          <div className="sm:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('admin.exercise_form_modal.video_url')}
                placeholder="https://..."
                value={form.values.videoUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('videoUrl', e.target.value)
                }
                disabled={isSubmitting}
              />
              <Input
                label={t('admin.exercise_form_modal.image_url')}
                placeholder="https://..."
                value={form.values.imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('imageUrl', e.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.workout.target')}
            </label>
            <MusclesMultiselect
              primary={form.values.primaryMuscles}
              secondary={form.values.secondaryMuscles}
              onChange={({ primary, secondary }) => {
                form.setValue('primaryMuscles', primary);
                form.setValue('secondaryMuscles', secondary);
              }}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admin.exercise_form_modal.body_parts')}
            </label>
            <BodyPartsMultiselect
              values={form.values.bodyParts}
              onChange={(ids) => form.setValue('bodyParts', ids)}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Equipments
            </label>
            <EquipmentsMultiselect
              values={form.values.equipments}
              onChange={(ids) => form.setValue('equipments', ids)}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label={t('admin.exercise_form_modal.keywords_csvs')}
              placeholder={t('admin.exercise_form_modal.chest_strength_compound')}
              value={form.values.keywords}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('keywords', e.target.value)
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-4 sm:col-span-2">
            <Checkbox
              label={t('admin.exercise_form_modal.user_generated')}
              checked={form.values.isUserGenerated}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('isUserGenerated', e.target.checked)
              }
            />
            <Checkbox
              label={t('admin.exercise_form_modal.auto_approve')}
              checked={form.values.autoApprove}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('autoApprove', e.target.checked)
              }
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {t('common.save')}
            </Button>
          </ModalFooter>
        </div>
      </form>
    </Modal>
  );
}
