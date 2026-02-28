'use client';

import { useTranslations } from 'next-intl';

import { DietType } from 'app/features/nutrition';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import type { NutritionFormData } from 'app/features/nutrition';
import { Leaf, Info, AlertCircle } from 'lucide-react';

interface PreferencesStepProps {
  formData: NutritionFormData;
  onChange: (data: Partial<NutritionFormData['restrictions']>) => void;
  onNotesChange: (notes: string) => void;
}

const dietTypes = [
  { id: DietType.OMNIVORE, label: 'Onnivoro', desc: 'Nessuna restrizione specifica' },
  { id: DietType.VEGETARIAN, label: 'Vegetariano', desc: 'No carne, sì derivati animali' },
  { id: DietType.VEGAN, label: 'Vegano', desc: 'Nessun prodotto animale' },
  { id: DietType.PESCATARIAN, label: 'Pescatariano', desc: 'Vegetariano + pesce' },
  { id: DietType.KETO, label: 'Chetogenica', desc: 'Alto grassi, carboidrati minimi' },
  { id: DietType.PALEO, label: 'Paleo', desc: 'Alimenti non processati' },
  { id: DietType.MEDITERRANEAN, label: 'Mediterranea', desc: 'Equilibrata e tradizionale' },
];

export function PreferencesStep({ formData, onChange, onNotesChange }: PreferencesStepProps) {
  const t = useTranslations('nutrition');

  const handleArrayChange = (field: 'allergies' | 'preferredFoods', value: string) => {
    const items = value
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    onChange({ ...formData.restrictions, [field]: items });
  };

  return (
    <div className="space-y-8">
      {/* Diet Type */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
          {t('nutrition.preferences_step.tipo_di_dieta')}
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dietTypes.map((type: any) => (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange({ dietType: type.id })}
              className={cn(
                'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all',
                formData.restrictions?.dietType === type.id
                  ? 'border-green-500 bg-green-50 ring-1 ring-green-500 dark:bg-green-900/20'
                  : 'border-neutral-200 hover:bg-neutral-50 dark:border-white/[0.08] dark:hover:bg-white/[0.06]'
              )}
            >
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {type.label}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{type.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Allergies & Preferences */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <AlertCircle className="h-4 w-4 text-red-500" />
            {t('nutrition.preferences_step.allergie_intolleranze')}
          </label>
          <textarea
            rows={3}
            placeholder={t('nutrition.preferences_step.es_lattosio_glutine_arachidi')}
            value={(formData.restrictions?.allergies || []).join(', ')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleArrayChange('allergies', e.target.value)
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
          />
          <p className="text-xs text-neutral-500">
            {t('nutrition.preferences_step.separa_gli_elementi_con_una_virgola')}
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Info className="h-4 w-4 text-primary-500" />
            {t('nutrition.preferences_step.cibi_preferiti')}
          </label>
          <textarea
            rows={3}
            placeholder={t('nutrition.preferences_step.es_salmone_avocado_avena')}
            value={(formData.restrictions?.preferredFoods || []).join(', ')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleArrayChange('preferredFoods', e.target.value)
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
          />
          <p className="text-xs text-neutral-500">
            {t('nutrition.preferences_step.l_ai_cerchera_di_includerli_nel_piano')}
          </p>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {t('nutrition.preferences_step.note_aggiuntive_per_l_ai')}
        </label>
        <textarea
          rows={3}
          placeholder={t('nutrition.preferences_step.qualsiasi_altra_informazione_utile_per_p')}
          value={formData.additionalNotes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
          className={cn(
            'w-full rounded-xl border-2 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:outline-none',
            darkModeClasses.input.base,
            'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
          )}
        />
      </div>
    </div>
  );
}
