'use client';

import { useTranslations } from 'next-intl';
/**
 * ExerciseFilters Component
 *
 * Componente per filtri esercizi.
 * Rifattorizzato: usa GlassCard, mobile-first, semplificato
 */

import { Select, Card, Button } from '@giulio-leone/ui';
import { RotateCcw } from 'lucide-react';
import type { FilterStatus } from './exercise-constants';
import { STATUS_FILTERS } from './exercise-constants';
import { ExerciseTypeCombobox } from './exercise-type-combobox';
import { EquipmentsMultiselect } from './equipments-multiselect';
import { BodyPartsMultiselect } from './body-parts-multiselect';
import { MusclesMultiselect } from './muscles-multiselect';

interface ExerciseFiltersProps {
  statusFilter: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
  onTypeChange?: (id?: string) => void;
  onEquipmentsChange?: (ids: string[]) => void;
  onBodyPartsChange?: (ids: string[]) => void;
  onMusclesChange?: (val: { primary: string[]; secondary: string[] }) => void;
  muscleIds?: string[]; // Add muscleIds prop
  statusFilters?: typeof STATUS_FILTERS;
  onReset: () => void;
}

export function ExerciseFilters({
  statusFilter,
  onStatusChange,
  onTypeChange,
  onEquipmentsChange,
  onBodyPartsChange,
  onMusclesChange,
  muscleIds,
  statusFilters = STATUS_FILTERS,
  onReset,
}: ExerciseFiltersProps) {
  const t = useTranslations('admin');

  return (
    <Card variant="glass" className="mb-6 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {t('admin.exercise_filters.filtri_avanzati')}
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-3 w-3" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">Stato</label>
          <Select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onStatusChange(e.target.value as FilterStatus)
            }
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">Tipo</label>
          <ExerciseTypeCombobox onChange={onTypeChange || (() => {})} />
        </div>

        {/* Equipments */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">Attrezzature</label>
          <EquipmentsMultiselect values={[]} onChange={onEquipmentsChange || (() => {})} />
        </div>

        {/* Body Parts */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500">
            {t('admin.exercise_filters.parti_del_corpo')}
          </label>
          <BodyPartsMultiselect values={[]} onChange={onBodyPartsChange || (() => {})} />
        </div>

        {/* Muscles */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-neutral-500">Muscoli</label>
          <MusclesMultiselect
            primary={muscleIds || []}
            secondary={[]}
            onChange={onMusclesChange || (() => {})}
          />
        </div>
      </div>
    </Card>
  );
}
