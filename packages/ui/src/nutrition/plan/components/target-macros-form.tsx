/**
 * TargetMacrosForm Component
 *
 * Form per definire i macro target giornalieri
 * Include visualizzazione visiva opzionale
 */

'use client';
import { MacroDisplay } from '@giulio-leone/ui/nutrition';
import type { NutritionPlan, Macros } from "@giulio-leone/types/nutrition";

interface TargetMacrosFormProps {
  plan: NutritionPlan;
  onPlanChange: (plan: NutritionPlan) => void;
  showVisual?: boolean;
  className?: string;
}

export function TargetMacrosForm({
  plan,
  onPlanChange,
  showVisual: _showVisual = false,
  className = '',
}: TargetMacrosFormProps) {
  const updateTargetMacros = (updates: Partial<Macros>) => {
    onPlanChange({
      ...plan,
      targetMacros: {
        ...plan.targetMacros,
        ...updates,
      },
    });
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-white/[0.08] dark:bg-zinc-950 ${className}`}
    >
      <h3 className="mb-6 text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Macro Giornalieri Target
      </h3>
      <div className="mb-6">
        <MacroDisplay
          macros={plan.targetMacros}
          targetMacros={plan.targetMacros}
          variant="circular"
          size="md"
          showLabels={true}
        />
      </div>
      <div className="grid gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:bg-neutral-800/50">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Calorie
          </label>
          <input
            type="number"
            value={plan.targetMacros.calories}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateTargetMacros({ calories: Number(e.target.value) })
            }
            className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Proteine (g)
          </label>
          <input
            type="number"
            value={plan.targetMacros.protein}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateTargetMacros({ protein: Number(e.target.value) })
            }
            className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Carboidrati (g)
          </label>
          <input
            type="number"
            value={plan.targetMacros.carbs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateTargetMacros({ carbs: Number(e.target.value) })
            }
            className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Grassi (g)
          </label>
          <input
            type="number"
            value={plan.targetMacros.fats}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateTargetMacros({ fats: Number(e.target.value) })
            }
            className="mt-1 block min-h-[44px] w-full touch-manipulation rounded-lg border border-neutral-300 bg-white px-3 shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/[0.1] dark:bg-zinc-950"
          />
        </div>
      </div>
    </div>
  );
}
