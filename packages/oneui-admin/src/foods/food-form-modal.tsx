/**
 * FoodFormModal
 *
 * Modal per creare/modificare un alimento con validazione Zod.
 * Aggiornato per allinearsi al nuovo schema dati con campi obbligatori:
 * - servingSize (REQUIRED)
 * - description (REQUIRED) - verrà tradotta automaticamente in 10 lingue
 * - imageUrl (Optional) - default placeholder se non fornito
 * - brandId (Optional) - default "Generic" se non fornito
 * - mainMacro, proteinPct, carbPct, fatPct (calcolati automaticamente)
 */
'use client';
import { useEffect, useMemo, useRef } from 'react';
import { createFoodSchema } from '@giulio-leone/schemas';
import { Button, Input, Modal, ModalFooter } from '@giulio-leone/ui';
import { Save } from 'lucide-react';
import { BrandCombobox } from './brand-combobox';
import { CategoriesMultiselect } from './categories-multiselect';
import { useFood, useCreateFood, useUpdateFood } from '@giulio-leone/features/food/hooks';
import { useForm } from '@giulio-leone/hooks';
import { LoadingState, ErrorState } from '@giulio-leone/ui/components';
import { useTranslations } from 'next-intl';
import {
  calculateMainMacro,
  getMainMacroDescription,
  getMainMacroEmoji,
} from '@giulio-leone/lib-shared';
import type { FoodItem } from '@giulio-leone/types/nutrition';
import type { Macros } from '@giulio-leone/types/nutrition';

type Mode = 'create' | 'edit';
interface FoodFormModalProps {
  isOpen: boolean;
  mode: Mode;
  foodId?: string;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}
interface FoodFormValues extends Record<string, unknown> {
  name: string;
  brand: string;
  description: string;
  barcode: string;
  calories: number | '';
  protein: number | '';
  carbs: number | '';
  fats: number | '';
  servingSize: number | '';
  unit: string;
  imageUrl: string;
  brandId: string | undefined;
  brandName: string;
  categoryIds: string[];
}
export function FoodFormModal({ isOpen, mode, foodId, onClose, onSuccess }: FoodFormModalProps) {
  const t = useTranslations();
  const {
    data: foodData,
    isLoading: isLoadingFood,
    error: foodError,
  } = useFood(mode === 'edit' && foodId ? foodId : null);
  const createFood = useCreateFood();
  const updateFood = useUpdateFood();
  const form = useForm({
    initialValues: {
      name: '',
      brand: '',
      description: '',
      barcode: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      servingSize: '',
      unit: 'g',
      imageUrl: '',
      brandId: undefined,
      brandName: '',
      categoryIds: [],
    },
    onSubmit: async (values: FoodFormValues) => {
      // Validazione campi obbligatori
      if (
        !values.servingSize ||
        (typeof values.servingSize === 'number' && values.servingSize <= 0)
      ) {
        throw new Error('La porzione standard è obbligatoria');
      }
      if (!values.description || values.description.trim() === '') {
        throw new Error('La descrizione è obbligatoria');
      }
      const payload = {
        name: values.name,
        description: values.description.trim(), // REQUIRED
        macrosPer100g: {
          calories: Number(values.calories || 0),
          protein: Number(values.protein || 0),
          carbs: Number(values.carbs || 0),
          fats: Number(values.fats || 0),
        },
        servingSize: Number(values.servingSize), // REQUIRED
        unit: values.unit,
        barcode: values.barcode?.trim() || undefined, // Optional
        metadata: values.brand ? { brand: values.brand } : undefined,
        imageUrl: values.imageUrl?.trim() || undefined, // Optional
        brandId: values.brandId || undefined, // Optional
        brandName: values.brandName || undefined, // Optional
        categoryIds: values.categoryIds.length ? values.categoryIds : undefined,
      };
      const parsed = createFoodSchema.safeParse(payload);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        throw new Error(first?.message || 'Dati non validi');
      }
      if (mode === 'create') {
        await createFood.mutateAsync(payload);
      } else if (foodId) {
        await updateFood.mutateAsync({ id: foodId, data: payload });
      }
      await onSuccess();
      onClose();
    },
    validateOnBlur: false,
  });
  // Prefill form when food data loads
  // Usa useRef per tracciare se i dati sono già stati caricati per evitare loop infiniti
  const hasPrefilledRef = useRef<string | null>(null);
  useEffect(() => {
    if (foodData?.foodItem) {
      const f = foodData.foodItem as FoodItem;
      // Evita di ri-prefillare se i dati sono già stati caricati per questo food
      if (hasPrefilledRef.current === f.id) {
        return;
      }
      hasPrefilledRef.current = f.id;
      // Extract brandId from metadata or raw data (null-safe)
      const rawBrandId = (f as FoodItem & { brand?: { id: string; name: string } }).brand?.id;
      // Extract categoryIds from metadata.categories (null-safe)
      const categories = f.metadata?.categories as
        | Array<{ id: string; name: string; slug: string }>
        | undefined;
      const categoryIds = categories?.map((c) => c.id) ?? [];
      // Extract description from first translation (if available)
      const firstTranslation = (f as FoodItem & { translations?: Array<{ description: string }> })
        .translations?.[0];
      const description =
        firstTranslation?.description || (f.metadata?.description as string) || '';
      const macros = f.macrosPer100g as Macros;
      const servingSizeValue =
        typeof f.servingSize === 'number' ? f.servingSize : Number(f.servingSize) || 100;
      form.setValues({
        name: f.name ?? '',
        brand: (f.metadata?.brand as string) ?? '',
        description: description || '',
        barcode: f.barcode ?? '',
        calories: Number(macros?.calories ?? 0),
        protein: Number(macros?.protein ?? 0),
        carbs: Number(macros?.carbs ?? 0),
        fats: Number(macros?.fats ?? 0),
        servingSize: typeof servingSizeValue === 'number' ? servingSizeValue : '',
        unit: f.unit ?? 'g',
        imageUrl: f.imageUrl ?? '',
        brandId: rawBrandId,
        brandName: (f.metadata?.brand as string) ?? '',
        categoryIds,
      });
    } else if (!foodData && mode === 'create') {
      // Reset ref quando si passa in modalità create
      hasPrefilledRef.current = null;
    }
  }, [foodData, mode, form]); // form.setValues è stabile ma form stesso può cambiare
  // Calcola valori derivati dai macros in tempo reale
  // IMPORTANT: Questo hook deve essere chiamato PRIMA di qualsiasi early return
  const calculatedValues = useMemo(() => {
    const macros: Macros = {
      calories: Number(form.values.calories || 0),
      protein: Number(form.values.protein || 0),
      carbs: Number(form.values.carbs || 0),
      fats: Number(form.values.fats || 0),
    };
    const totalKcal = Math.max(1, macros.calories || 0);
    const proteinPct = Math.min(100, Math.max(0, ((macros.protein || 0) * 4 * 100) / totalKcal));
    const carbPct = Math.min(100, Math.max(0, ((macros.carbs || 0) * 4 * 100) / totalKcal));
    const fatPct = Math.min(100, Math.max(0, ((macros.fats || 0) * 9 * 100) / totalKcal));
    const mainMacro = calculateMainMacro(macros);
    return {
      proteinPct: Number.isNaN(proteinPct) ? 0 : Number(proteinPct.toFixed(2)),
      carbPct: Number.isNaN(carbPct) ? 0 : Number(carbPct.toFixed(2)),
      fatPct: Number.isNaN(fatPct) ? 0 : Number(fatPct.toFixed(2)),
      mainMacro,
    };
  }, [form.values.calories, form.values.protein, form.values.carbs, form.values.fats]);
  // Tutti gli hooks devono essere chiamati prima degli early returns
  const formError = (form.errors as Record<string, string>)?._form as string | undefined;
  const isSubmitting = createFood.isPending || updateFood.isPending;
  const isLoading = mode === 'edit' && isLoadingFood;
  // Early returns DOPO tutti gli hooks
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('common.loading')} size="lg">
        <LoadingState message={t('common.loadingFood')} size="sm" />
      </Modal>
    );
  }
  if (foodError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('common.error')} size="lg">
        <ErrorState error={foodError} title={t('common.errors.loadingFood')} />
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              placeholder={t('common.food.name') + ' *'}
              value={form.values.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('name', e.target.value)
              }
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <textarea
              placeholder={t('common.food.description') + ' *'}
              value={form.values.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                form.setValue('description', e.target.value)
              }
              disabled={isSubmitting}
              required
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-900"
            />
          </div>
          <Input
            placeholder={t('common.food.barcode')}
            value={form.values.barcode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('barcode', e.target.value)
            }
            disabled={isSubmitting}
          />
          <Input
            placeholder={t('common.food.brand')}
            value={form.values.brand}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('brand', e.target.value)
            }
            disabled={isSubmitting}
          />
          <Input
            placeholder={t('common.food.image')}
            value={form.values.imageUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('imageUrl', e.target.value)
            }
            disabled={isSubmitting}
            type="url"
          />
          <Input
            type="number"
            placeholder={t('common.food.calories') + ' *'}
            value={form.values.calories}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('calories', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={isSubmitting}
            required
            min="0"
            step="0.1"
          />
          <Input
            type="number"
            placeholder={t('common.food.protein') + ' *'}
            value={form.values.protein}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('protein', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={isSubmitting}
            required
            min="0"
            step="0.1"
          />
          <Input
            type="number"
            placeholder={t('common.food.carbs') + ' *'}
            value={form.values.carbs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('carbs', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={isSubmitting}
            required
            min="0"
            step="0.1"
          />
          <Input
            type="number"
            placeholder={t('common.food.fats') + ' *'}
            value={form.values.fats}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('fats', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={isSubmitting}
            required
            min="0"
            step="0.1"
          />
          <Input
            type="number"
            placeholder={t('common.food.servingSizeTitle') + ' *'}
            value={form.values.servingSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('servingSize', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={isSubmitting}
            required
            min="1"
            step="0.1"
          />
          <Input
            placeholder={t('common.food.unit') + ' *'}
            value={form.values.unit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('unit', e.target.value)
            }
            disabled={isSubmitting}
            required
          />
          {/* Brand combobox con autocomplete/crea-mentre-scrivi - Optional */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.food.brand')}
            </label>
            <BrandCombobox
              valueId={form.values.brandId}
              valueName={form.values.brandName}
              onChange={(v: { id?: string; name?: string } | null) => {
                form.setValue('brandId', v?.id);
                form.setValue('brandName', v?.name || '');
              }}
            />
          </div>
          {/* Multiselect categorie */}
          <div className="sm:col-span-2">
            <CategoriesMultiselect
              values={form.values.categoryIds}
              onChange={(ids: string[]) => form.setValue('categoryIds', ids)}
            />
          </div>
          {/* Sezione valori calcolati (read-only) */}
          {(form.values.calories ||
            form.values.protein ||
            form.values.carbs ||
            form.values.fats) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:col-span-2 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('common.food.calculatedValues')}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('common.food.mainMacro')}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm font-medium">
                    <span>{getMainMacroEmoji(calculatedValues.mainMacro)}</span>
                    <span>{getMainMacroDescription(calculatedValues.mainMacro)}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {calculatedValues.mainMacro.percentage.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('admin.food_form_modal.proteine')}
                  </div>
                  <div className="mt-1 text-sm font-medium">{calculatedValues.proteinPct}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('admin.food_form_modal.carboidrati')}
                  </div>
                  <div className="mt-1 text-sm font-medium">{calculatedValues.carbPct}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('admin.food_form_modal.grassi')}
                  </div>
                  <div className="mt-1 text-sm font-medium">{calculatedValues.fatPct}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.isValid}>
            <Save className="mr-2 h-4 w-4" />
            {t('common.save')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
