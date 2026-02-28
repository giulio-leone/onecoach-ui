'use client';

import type { NutritionPlan, NutritionStatus } from "@giulio-leone/types/nutrition";

/**
 * PlanMetadataForm Component
 *
 * Form per metadati del piano (obiettivo, durata, stato)
 */

interface PlanMetadataFormProps {
  plan: NutritionPlan;
  onPlanChange: (plan: NutritionPlan) => void;
  className?: string;
}

const GOAL_OPTIONS = [
  { value: 'clx_ngoal_weightloss', label: 'Perdita Peso' },
  { value: 'clx_ngoal_musclegain', label: 'Aumento Massa' },
  { value: 'clx_ngoal_maintenance', label: 'Mantenimento' },
  { value: 'clx_ngoal_performance', label: 'Performance' },
];

const STATUS_OPTIONS: { value: NutritionStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Bozza' },
  { value: 'ACTIVE', label: 'Attivo' },
  { value: 'COMPLETED', label: 'Completato' },
  { value: 'ARCHIVED', label: 'Archiviato' },
];

export function PlanMetadataForm({ plan, onPlanChange, className = '' }: PlanMetadataFormProps) {
  return (
    <div
      className={`grid gap-4 overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl sm:grid-cols-2 lg:grid-cols-3 dark:border-white/[0.08] dark:bg-zinc-950 ${className}`}
    >
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Obiettivo
        </label>
        <select
          value={plan.goals && plan.goals.length > 0 ? plan.goals[0] : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onPlanChange({
              ...plan,
              goals: e.target.value ? [e.target.value] : [],
            })
          }
          className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
        >
          <option value="">Seleziona obiettivo</option>
          {GOAL_OPTIONS.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Durata (settimane)
        </label>
        <input
          type="number"
          value={plan.durationWeeks}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPlanChange({ ...plan, durationWeeks: Number(e.target.value || 0) })
          }
          className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
          min="1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Stato
        </label>
        <select
          value={plan.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onPlanChange({
              ...plan,
              status: e.target.value as NutritionStatus,
            })
          }
          className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
        >
          {STATUS_OPTIONS.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
