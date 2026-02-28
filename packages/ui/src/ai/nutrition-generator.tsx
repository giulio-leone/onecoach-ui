'use client';

import { useTranslations } from 'next-intl';
/**
 * Nutrition Generator Wizard
 *
 * Multi-step wizard for nutrition generation using Standard MeshWizard.
 * Implements KISS, SOLID, DRY principles.
 */

import { useMemo } from 'react';
import { useNutritionGeneration } from 'submodules/onecoach-ui/packages/hooks/src/use-nutrition-generation';
import type { NutritionGenerationInput } from 'submodules/onecoach-ui/packages/hooks/src/use-nutrition-generation';
import { cn, darkModeClasses } from '@giulio-leone/lib-design-system';
import { useProfile } from '@giulio-leone/lib-api/hooks';

import { Scale, Dumbbell, Zap, Trophy, Leaf } from 'lucide-react';
import { SelectionCard, WizardRadioGroup, WizardSlider } from '@giulio-leone/ui';
import {
  DietType as DietTypeConst,
  mapActivityLevel,
  mapDietType,
  mapGender,
} from 'app/features/nutrition';
import type { Goal } from 'app/features/nutrition';
import { Sex, ActivityLevel } from '@giulio-leone/types/client';

import type { DietType } from 'app/features/nutrition';

import { logger } from '@giulio-leone/lib-shared';
// Standard Mesh Wizard
import {
  MeshWizard,
  type MeshWizardStep,
  type MeshWizardStepProps,
} from '@/components/agent/mesh-wizard';
import type { GenerationLogEvent } from '@/components/domain/ai-elements/generation-log';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type NutritionFormDataState = {
  weight: number | undefined;
  height: number | undefined;
  age: number | undefined;
  gender: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  mealsPerDay: number;
  durationWeeks: number;
  patternsCount: number;
  dietType: DietType;
  allergies: string[];
  preferredFoods: string[];
  dislikedFoods: string[];
  additionalNotes: string;
};

const INITIAL_FORM_DATA: NutritionFormDataState = {
  weight: undefined,
  height: undefined,
  age: undefined,
  gender: Sex.OTHER,
  activityLevel: ActivityLevel.MODERATE,
  goal: 'maintenance',
  mealsPerDay: 4,
  durationWeeks: 4,
  patternsCount: 2,
  dietType: DietTypeConst.OMNIVORE,
  allergies: [],
  preferredFoods: [],
  dislikedFoods: [],
  additionalNotes: '',
};

// ----------------------------------------------------------------------------
// Steps Components
// ----------------------------------------------------------------------------

// Step 1: Personal Details
const StepOne = ({ formData, setFormData }: MeshWizardStepProps<NutritionFormDataState>) => {
  const t = useTranslations('common');

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Weight */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            {t('nutrition_generator.peso_kg')}
          </label>
          <input
            type="number"
            value={formData.weight || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: NutritionFormDataState) => ({
                ...prev,
                weight: Number(e.target.value) || undefined,
              }))
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
            placeholder="70"
          />
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition_generator.altezza_cm')}
          </label>
          <input
            type="number"
            value={formData.height || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: NutritionFormDataState) => ({
                ...prev,
                height: Number(e.target.value) || undefined,
              }))
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
            placeholder="175"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition_generator.eta')}
          </label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, age: Number(e.target.value) || undefined }))
            }
            className={cn(
              'w-full rounded-xl border-2 px-4 py-3 text-lg font-medium shadow-sm focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
            )}
            placeholder="30"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            {t('nutrition_generator.sesso_biologico')}
          </label>
          <WizardRadioGroup
            value={formData.gender}
            onChange={(val: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: NutritionFormDataState) => ({ ...prev, gender: val }))
            }
            options={[
              { id: Sex.MALE, label: 'Uomo' },
              { id: Sex.FEMALE, label: 'Donna' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// Step 2: Goals & Activity
const StepTwo = ({ formData, setFormData }: MeshWizardStepProps<NutritionFormDataState>) => {
  const t = useTranslations('common');
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
          {t('nutrition_generator.qual_e_il_tuo_obiettivo_principale')}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
          {[
            {
              id: 'weight_loss',
              label: 'Dimagrimento',
              icon: Scale,
              desc: 'Perdere grasso mantenendo muscolo',
            },
            {
              id: 'muscle_gain',
              label: 'Aumento Massa',
              icon: Dumbbell,
              desc: 'Costruire tessuto muscolare magro',
            },
            {
              id: 'maintenance',
              label: 'Mantenimento',
              icon: Zap,
              desc: 'Mantenere il peso e la composizione attuale',
            },
            {
              id: 'performance',
              label: 'Performance',
              icon: Trophy,
              desc: 'Ottimizzare le prestazioni atletiche',
            },
            {
              id: 'body_recomposition',
              label: 'Ricomp. Corporea',
              icon: Scale,
              desc: 'Perdere grasso e guadagnare muscolo simultaneamente',
            },
          ].map((option: any) => (
            <SelectionCard
              key={option.id}
              role="radio"
              title={option.label}
              description={option.desc}
              selected={formData.goal === option.id}
              compact={true}
              onPress={() => setFormData((prev) => ({ ...prev, goal: option.id as Goal }))}
              icon={<option.icon className="h-5 w-5" />}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
          {t('nutrition_generator.livello_di_attivita')}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
          {[
            { id: ActivityLevel.SEDENTARY, label: 'Sedentario', desc: 'Poco o nessun esercizio' },
            {
              id: ActivityLevel.LIGHT,
              label: 'Leggero',
              desc: 'Esercizio leggero 1-3 gg/sett',
            },
            {
              id: ActivityLevel.MODERATE,
              label: 'Moderato',
              desc: 'Esercizio moderato 3-5 gg/sett',
            },
            { id: ActivityLevel.ACTIVE, label: 'Attivo', desc: 'Esercizio intenso 6-7 gg/sett' },
            {
              id: ActivityLevel.VERY_ACTIVE,
              label: 'Molto Attivo',
              desc: 'Esercizio molto intenso/lavoro fisico',
            },
          ].map((option: any) => (
            <SelectionCard
              key={option.id}
              role="radio"
              title={option.label}
              description={option.desc}
              selected={formData.activityLevel === option.id}
              compact={true}
              onPress={() =>
                setFormData((prev: NutritionFormDataState) => ({
                  ...prev,
                  activityLevel: option.id,
                }))
              }
            />
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <WizardSlider
          label={t('nutrition_generator.pasti_al_giorno')}
          value={formData.mealsPerDay}
          min={3}
          max={6}
          onChange={(value: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, mealsPerDay: value }))}
          valueLabel="pasti"
          minLabel="3 pasti"
          maxLabel="6 pasti"
        />
        <WizardSlider
          label={t('nutrition_generator.durata_programma')}
          value={formData.durationWeeks}
          min={1}
          max={4}
          onChange={(value: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, durationWeeks: value }))}
          valueLabel="sett."
          minLabel="1 sett"
          maxLabel="4 sett"
        />
      </div>

      <WizardSlider
        label={t('nutrition_generator.pattern_giornalieri')}
        value={formData.patternsCount}
        min={1}
        max={3}
        onChange={(value: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, patternsCount: value }))}
        valueLabel="pattern"
        minLabel="1 pattern"
        maxLabel="3 pattern"
        description={t('nutrition_generator.generiamo_fino_a_3_pattern_diversi_a_b_c')}
      />
    </div>
  );
};

// Step 3: Preferences & Diet
const StepThree = ({ formData, setFormData }: MeshWizardStepProps<NutritionFormDataState>) => {
  const t = useTranslations('common');
  const handleArrayChange = (
    field: 'allergies' | 'preferredFoods' | 'dislikedFoods',
    value: string
  ) => {
    const items = value
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('nutrition_generator.tipo_di_dieta')}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              id: DietTypeConst.OMNIVORE,
              label: 'Onnivoro',
              desc: 'Nessuna restrizione specifica',
            },
            {
              id: DietTypeConst.VEGETARIAN,
              label: 'Vegetariano',
              desc: 'No carne, sì derivati animali',
            },
            { id: DietTypeConst.VEGAN, label: 'Vegano', desc: 'Nessun prodotto animale' },
            { id: DietTypeConst.PESCATARIAN, label: 'Pescatariano', desc: 'Vegetariano + pesce' },
            {
              id: DietTypeConst.KETO,
              label: 'Chetogenica',
              desc: 'Alto grassi, carboidrati minimi',
            },
            { id: DietTypeConst.PALEO, label: 'Paleo', desc: 'Alimenti non processati' },
            {
              id: DietTypeConst.MEDITERRANEAN,
              label: 'Mediterranea',
              desc: 'Equilibrata e tradizionale',
            },
          ].map((option: any) => (
            <SelectionCard
              key={option.id}
              role="radio"
              title={option.label}
              description={option.desc}
              selected={formData.dietType === option.id}
              onPress={() => setFormData((prev) => ({ ...prev, dietType: option.id }))}
              icon={<Leaf className="h-5 w-5" />}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition_generator.allergie_intolleranze')}
          </label>
          <textarea
            rows={3}
            placeholder={t('nutrition_generator.es_lattosio_glutine_arachidi')}
            value={formData.allergies.join(', ')}
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
            {t('nutrition_generator.separa_gli_elementi_con_una_virgola')}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('nutrition_generator.cibi_preferiti')}
          </label>
          <textarea
            rows={3}
            placeholder={t('nutrition_generator.es_salmone_avocado_avena')}
            value={formData.preferredFoods.join(', ')}
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
            {t('nutrition_generator.l_ai_cerchera_di_includerli_nel_piano')}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {t('nutrition_generator.cibi_da_evitare')}
        </label>
        <textarea
          rows={3}
          placeholder={t('nutrition_generator.es_broccoli_cavolfiore_cibi_piccanti')}
          value={formData.dislikedFoods.join(', ')}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleArrayChange('dislikedFoods', e.target.value)
          }
          className={cn(
            'w-full rounded-xl border-2 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:outline-none',
            darkModeClasses.input.base,
            'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
          )}
        />
        <p className="text-xs text-neutral-500">
          {t('nutrition_generator.l_ai_evitera_questi_cibi_nel_piano_nutri')}
        </p>
      </div>
    </div>
  );
};

// Step 4: Details & Notes
const StepFour = ({ formData, setFormData }: MeshWizardStepProps<NutritionFormDataState>) => {
  const t = useTranslations('common');
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('nutrition_generator.note_o_preferenze_aggiuntive')}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t('nutrition_generator.specifica_preferenze_alimentari_orari_de')}
        </p>
      </div>
      <textarea
        rows={5}
        placeholder={t('nutrition_generator.es_preferisco_colazione_abbondante_evito')}
        value={formData.additionalNotes}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))
        }
        className={cn(
          'w-full rounded-xl border-2 px-4 py-3 text-sm font-medium shadow-sm focus:ring-2 focus:outline-none',
          darkModeClasses.input.base,
          'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
        )}
      />
    </div>
  );
};

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function NutritionGenerator() {
  const t = useTranslations('common');
  const {
    isGenerating,
    isStreaming,
    progress,
    currentMessage,
    error,
    result,
    streamEvents,
    generateStream,
    reset,
  } = useNutritionGeneration({
    onProgress: () => {},
    onComplete: () => {},
    onError: () => {},
  });

  const { data: profileData, isLoading: isLoadingProfile } = useProfile();

  const initialFormData = useMemo<NutritionFormDataState>(() => {
    if (!profileData) {
      return INITIAL_FORM_DATA;
    }

    const mappedGender = profileData.sex ? mapGender(profileData.sex) : null;
    const mappedActivity = profileData.activityLevel
      ? mapActivityLevel(profileData.activityLevel)
      : null;
    const mappedDietType = profileData.dietType ? mapDietType(profileData.dietType) : null;

    // Map nutrition goal IDs from profile to form goal value
    const nutritionGoals = profileData.nutritionGoals ?? [];
    let goal: Goal = INITIAL_FORM_DATA.goal;

    if (nutritionGoals.includes('clx_ngoal_weightloss')) goal = 'weight_loss';
    else if (nutritionGoals.includes('clx_ngoal_musclegain')) goal = 'muscle_gain';
    else if (nutritionGoals.includes('clx_ngoal_maintenance')) goal = 'maintenance';
    else if (nutritionGoals.includes('clx_ngoal_performance')) goal = 'performance';

    return {
      ...INITIAL_FORM_DATA,
      weight: profileData.weightKg ?? undefined,
      height: profileData.heightCm ?? undefined,
      age: profileData.age ?? undefined,
      gender: mappedGender ?? INITIAL_FORM_DATA.gender,
      activityLevel: mappedActivity ?? INITIAL_FORM_DATA.activityLevel,
      dietType: mappedDietType ?? INITIAL_FORM_DATA.dietType,
      goal,
      allergies: profileData.dietaryRestrictions ?? INITIAL_FORM_DATA.allergies,
      preferredFoods: profileData.dietaryPreferences ?? INITIAL_FORM_DATA.preferredFoods,
      dislikedFoods: INITIAL_FORM_DATA.dislikedFoods,
      additionalNotes: profileData.healthNotes ?? INITIAL_FORM_DATA.additionalNotes,
    };
  }, [profileData]);

  const steps: MeshWizardStep<NutritionFormDataState>[] = [
    { title: 'Chi sei?', component: StepOne },
    { title: 'Obiettivi & Attività', component: StepTwo },
    { title: 'Preferenze', component: StepThree },
    { title: 'Dettagli & Review', component: StepFour },
  ];

  const handleGenerate = async (formData: NutritionFormDataState) => {
    const patternsCount = Math.min(Math.max(formData.patternsCount, 1), 3);
    const mealsPerDay = Math.min(Math.max(formData.mealsPerDay, 3), 6);
    const durationWeeks = Math.min(Math.max(formData.durationWeeks, 1), 16);

    // Map form goal to profile goal ID
    const nutritionGoalMap: Record<string, string> = {
      weight_loss: 'clx_ngoal_weightloss',
      muscle_gain: 'clx_ngoal_musclegain',
      maintenance: 'clx_ngoal_maintenance',
      performance: 'clx_ngoal_performance',
      body_recomposition: 'clx_ngoal_maintenance',
    };

    // Sync preferences to profile before generation
    try {
      await fetch('/api/profile/sync-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'nutrition_wizard',
          preferences: {
            nutritionGoals: [nutritionGoalMap[formData.goal] || formData.goal],
            activityLevel: formData.activityLevel.toLowerCase(),
            dietType: formData.dietType.toLowerCase(),
            dietaryRestrictions: formData.allergies,
            dietaryPreferences: formData.preferredFoods,
            healthNotes: formData.additionalNotes || undefined,
          },
        }),
      });
    } catch (e) {
      logger.warn('[NutritionGenerator] Failed to sync preferences:', e);
    }

    const input: NutritionGenerationInput = {
      userId: '', // Set by service
      userProfile: {
        weight: formData.weight ?? 75,
        height: formData.height ?? 175,
        age: formData.age ?? 30,
        gender:
          formData.gender === Sex.MALE
            ? 'male'
            : formData.gender === Sex.FEMALE
              ? 'female'
              : 'other',
        activityLevel: formData.activityLevel.toLowerCase() as
          | 'sedentary'
          | 'light'
          | 'moderate'
          | 'active'
          | 'very_active',
      },
      goals: {
        goal: formData.goal,
        durationWeeks,
        mealsPerDay,
        patternsCount,
      },
      restrictions: {
        dietType: formData.dietType.toLowerCase() as
          | 'omnivore'
          | 'vegetarian'
          | 'vegan'
          | 'pescatarian'
          | 'keto'
          | 'paleo'
          | 'mediterranean',
        allergies: formData.allergies,
        intolerances: [],
        dislikedFoods: formData.dislikedFoods,
        preferredFoods: formData.preferredFoods,
      },
      additionalNotes: formData.additionalNotes,
    };

    await generateStream(input);
  };

  if (isLoadingProfile && !result) {
    return (
      <div className="flex min-h-[400px] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <MeshWizard
        key={profileData?.id || 'new'}
        title={t('nutrition_generator.nutrition_generator')}
        steps={steps}
        initialData={initialFormData}
        onGenerate={handleGenerate}
        status={
          error ? 'error' : result ? 'success' : isGenerating || isStreaming ? 'generating' : 'idle'
        }
        progress={progress}
        currentMessage={currentMessage}
        logs={streamEvents as GenerationLogEvent[]}
        result={result}
        error={error}
        onReset={reset}
        successConfig={{
          title: 'Piano Nutrizionale Pronto',
          message: 'Il tuo piano nutrizionale personalizzato è stato generato.',
          actionLabel: 'Vai ai miei piani',
          onAction: () => (window.location.href = '/nutrition'),
          stats: (res: unknown) => {
            const r = res as Record<string, unknown> | null;
            const dayPatterns = r?.dayPatterns as unknown[] | undefined;
            return dayPatterns
              ? [
                  { label: 'Pattern', value: dayPatterns.length },
                  { label: 'Settimane', value: (r?.weeks as unknown[] | undefined)?.length || 0 },
                  { label: 'Obiettivo', value: (r?.goals as string[] | undefined)?.[0] || 'N/A' },
                ]
              : [];
          },
        }}
      />
    </div>
  );
}
