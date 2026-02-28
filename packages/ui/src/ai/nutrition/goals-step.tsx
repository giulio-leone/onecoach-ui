'use client';

import { useTranslations } from 'next-intl';

import type { Goal } from 'app/features/nutrition';
import { ActivityLevel } from '@giulio-leone/types/client';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { NutritionFormData } from 'app/features/nutrition';
import { Dumbbell, Scale, Zap, Trophy, Timer, Utensils } from 'lucide-react';

interface GoalsStepProps {
  formData: NutritionFormData;
  onGoalChange: (data: Partial<NutritionFormData['goals']>) => void;
  onActivityChange: (level: ActivityLevel) => void;
}

const goals = [
  {
    id: 'weight_loss',
    label: 'Dimagrimento',
    icon: Scale,
    description: 'Perdere grasso mantenendo muscolo',
  },
  {
    id: 'muscle_gain',
    label: 'Aumento Massa',
    icon: Dumbbell,
    description: 'Costruire tessuto muscolare magro',
  },
  {
    id: 'maintenance',
    label: 'Mantenimento',
    icon: Zap,
    description: 'Mantenere il peso e la composizione attuale',
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Trophy,
    description: 'Ottimizzare le prestazioni atletiche',
  },
  {
    id: 'body_recomposition',
    label: 'Ricomp. Corporea',
    icon: Scale,
    description: 'Perdere grasso e guadagnare muscolo simultaneamente',
  },
];

const activityLevels = [
  { id: ActivityLevel.SEDENTARY, label: 'Sedentario', desc: 'Poco o nessun esercizio' },
  { id: ActivityLevel.LIGHT, label: 'Leggero', desc: 'Esercizio leggero 1-3 gg/sett' },
  { id: ActivityLevel.MODERATE, label: 'Moderato', desc: 'Esercizio moderato 3-5 gg/sett' },
  { id: ActivityLevel.ACTIVE, label: 'Attivo', desc: 'Esercizio intenso 6-7 gg/sett' },
  {
    id: ActivityLevel.VERY_ACTIVE,
    label: 'Molto Attivo',
    desc: 'Esercizio molto intenso/lavoro fisico',
  },
];

export function GoalsStep({ formData, onGoalChange, onActivityChange }: GoalsStepProps) {
  const t = useTranslations('nutrition');

  return (
    <div className="space-y-8">
      {/* Goals Grid */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {t('nutrition.goals_step.obiettivo_principale')}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {goals.map((goal: any) => {
            const Icon = goal.icon;
            const isSelected = formData.goals?.goal === goal.id;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onGoalChange({ goal: goal.id as Goal })}
                className={cn(
                  'relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-neutral-200 hover:border-green-200 hover:bg-neutral-50 dark:border-white/[0.08] dark:hover:border-green-800 dark:hover:bg-white/[0.06]'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-white/[0.04] dark:text-neutral-400'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'font-semibold',
                      isSelected
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-neutral-900 dark:text-neutral-100'
                    )}
                  >
                    {goal.label}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {goal.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {t('nutrition.goals_step.livello_di_attivita')}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {activityLevels.map((level: any) => (
            <button
              key={level.id}
              type="button"
              onClick={() => onActivityChange(level.id)}
              className={cn(
                'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all',
                formData.userProfile?.activityLevel === level.id
                  ? 'border-green-500 bg-green-50 ring-1 ring-green-500 dark:bg-green-900/20'
                  : 'border-neutral-200 hover:bg-neutral-50 dark:border-white/[0.08] dark:hover:bg-white/[0.06]'
              )}
            >
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {level.label}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{level.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Utensils className="h-4 w-4" />
            {t('nutrition.goals_step.pasti_al_giorno')}
          </label>
          <select
            value={formData.goals?.mealsPerDay}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onGoalChange({ mealsPerDay: Number(e.target.value) })
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
          >
            {[3, 4, 5, 6].map((n: any) => (
              <option key={n} value={n}>
                {n} pasti
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Timer className="h-4 w-4" />
            {t('nutrition.goals_step.durata_settimane')}
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.goals?.durationWeeks || 4}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onGoalChange({ durationWeeks: Number(e.target.value) })
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
          />
        </div>
      </div>
    </div>
  );
}
