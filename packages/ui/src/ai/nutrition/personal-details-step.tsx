'use client';

import { useTranslations } from 'next-intl';

import { Sex } from '@giulio-leone/types/client';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { NutritionFormData } from 'app/features/nutrition';

interface PersonalDetailsStepProps {
  formData: NutritionFormData;
  onChange: (data: Partial<NutritionFormData['userProfile']>) => void;
}

export function PersonalDetailsStep({ formData, onChange }: PersonalDetailsStepProps) {
  const t = useTranslations('nutrition');

  const updateProfile = (field: keyof NutritionFormData['userProfile'], value: unknown) => {
    onChange({ ...formData.userProfile, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Weight */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition.personal_details_step.peso_kg')}
          </label>
          <input
            type="number"
            value={formData.userProfile?.weight || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateProfile('weight', Number(e.target.value))
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
            placeholder="70"
            required
          />
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition.personal_details_step.altezza_cm')}
          </label>
          <input
            type="number"
            value={formData.userProfile?.height || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateProfile('height', Number(e.target.value))
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
            placeholder="175"
            required
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition.personal_details_step.eta')}
          </label>
          <input
            type="number"
            value={formData.userProfile?.age || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateProfile('age', Number(e.target.value))
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
            placeholder="30"
            required
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition.personal_details_step.sesso_biologico')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Uomo', value: Sex.MALE },
              { label: 'Donna', value: Sex.FEMALE },
            ].map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateProfile('gender', option.value)}
                className={cn(
                  'flex items-center justify-center rounded-xl border-2 p-3 transition-all',
                  formData.userProfile?.gender === option.value
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'border-neutral-200 hover:border-green-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-green-800 dark:hover:bg-neutral-800'
                )}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
