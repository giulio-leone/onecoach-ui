'use client';

import { useTranslations } from 'next-intl';
/**
 * FoodFilters
 *
 * Filtri compatti: brand, category, barcode, kcal range, reset.
 * Rifattorizzato: usa GlassCard, mobile-first, semplificato
 */
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button, Card, Input, Select } from '@giulio-leone/ui';
import { BrandCombobox } from './brand-combobox';
import { CategoriesMultiselect } from './categories-multiselect';
import { RotateCcw } from 'lucide-react';
export interface FoodFiltersValues {
  search?: string;
  brandId?: string;
  categoryIds?: string[];
  barcode?: string;
  kcalMin?: number;
  kcalMax?: number;
  macroDominant?: 'protein' | 'carbs' | 'fats';
  minProteinPct?: number;
  minCarbPct?: number;
  minFatPct?: number;
}
interface FoodFiltersProps {
  values: FoodFiltersValues;
  onChange: (values: FoodFiltersValues) => void;
  onReset: () => void;
}
export function FoodFilters({ values, onChange, onReset }: FoodFiltersProps) {
  const t = useTranslations('admin');

  const [local, setLocal] = useState<FoodFiltersValues>(values);
  useEffect(() => {
    setLocal(values);
  }, [values]);
  useEffect(() => {
    const id = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(id);
  }, [local, onChange]);
  return (
    <Card variant="glass" className="mb-6 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {t('food_filters.filtri_avanzati')}
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-3 w-3" />
          Reset
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">Brand</label>
          <BrandCombobox
            valueId={local.brandId}
            onChange={(val: { id?: string; name?: string } | null) =>
              setLocal((v: any) => ({ ...v, brandId: val?.id || undefined }))
            }
          />
        </div>
        {/* Categories */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">Categorie</label>
          <CategoriesMultiselect
            values={local.categoryIds || []}
            onChange={(ids: string[]) => setLocal((v: any) => ({ ...v, categoryIds: ids }))}
          />
        </div>
        {/* Barcode */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">Barcode</label>
          <Input
            value={local.barcode || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLocal((v: any) => ({ ...v, barcode: e.target.value || undefined }))
            }
            placeholder={t('food_filters.e_g_12345678')}
          />
        </div>
        {/* Kcal Range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">
            {t('food_filters.calorie_min_max')}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={local.kcalMin ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocal((v: any) => ({
                  ...v,
                  kcalMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="Min"
            />
            <Input
              type="number"
              value={local.kcalMax ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocal((v: any) => ({
                  ...v,
                  kcalMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              placeholder="Max"
            />
          </div>
        </div>
        {/* Macros */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-neutral-500">Macronutrienti</label>
          <div className="grid grid-cols-4 gap-2">
            <Select
              value={local.macroDominant || ''}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setLocal((v: any) => ({
                  ...v,
                  macroDominant: (e.target.value ||
                    undefined) as FoodFiltersValues['macroDominant'],
                }))
              }
            >
              <option value="">Dominanza</option>
              <option value="protein">Proteine</option>
              <option value="carbs">Carboidrati</option>
              <option value="fats">Grassi</option>
            </Select>
            <Input
              type="number"
              placeholder={t('food_filters.min_p')}
              value={local.minProteinPct ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocal((v: any) => ({
                  ...v,
                  minProteinPct: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <Input
              type="number"
              placeholder={t('food_filters.min_c')}
              value={local.minCarbPct ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocal((v: any) => ({
                  ...v,
                  minCarbPct: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <Input
              type="number"
              placeholder={t('food_filters.min_f')}
              value={local.minFatPct ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocal((v: any) => ({
                  ...v,
                  minFatPct: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
