'use client';

import { Card, SelectionCard, Input, Button } from '@giulio-leone/ui';
import { DifficultyLevel, Sex, WorkoutGoal } from '@giulio-leone/types/client';
import { Dumbbell, Target, User, Activity, Zap, AlertCircle, Settings } from 'lucide-react';
import type { WorkoutFormData, TierAI } from './types';
import { SPLIT_OPTIONS, TIER_OPTIONS } from './constants';
import { arrayFromCsv, csvFromArray } from './utils';

interface WorkoutFormProps {
  formData: WorkoutFormData;
  updateField: <K extends keyof WorkoutFormData>(
    section: K,
    value: Partial<WorkoutFormData[K]>
  ) => void;
  updateAdditionalNotes: (value: string) => void;
  updateTierAI: (value: TierAI) => void;
  generate: () => void;
  isGenerating: boolean;
}

export function WorkoutForm({
  formData,
  updateField,
  updateAdditionalNotes,
  updateTierAI,
  generate,
  isGenerating,
}: WorkoutFormProps) {
  return (
    <div className="space-y-8">
      {/* Parametri Personali */}
      <Card className="overflow-hidden border-neutral-200 bg-white/50 p-0 backdrop-blur-md dark:border-white/[0.08] dark:bg-neutral-900/50">
        <div className="border-b border-neutral-200 bg-primary-50/50 px-5 py-4 dark:border-white/[0.08] dark:bg-primary-900/10">
          <div className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <User size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Parametri Personali
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                I tuoi dati fisici per calcolare i carichi
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Età"
                value={formData.userProfile.age?.toString() || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('userProfile', { age: parseInt(e.target.value) || 0 })}
                type="number"
                placeholder="Anni"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Peso (kg)"
                value={formData.userProfile.weight?.toString() || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('userProfile', { weight: parseFloat(e.target.value) || 0 })
                }
                type="number"
                placeholder="kg"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Altezza (cm)"
                value={formData.userProfile.height?.toString() || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('userProfile', { height: parseFloat(e.target.value) || 0 })
                }
                type="number"
                placeholder="cm"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              Sesso Biologico
            </p>
            <div className="flex flex-row gap-3">
              <SelectionCard
                title="Uomo"
                selected={formData.userProfile.gender === Sex.MALE}
                onPress={() => updateField('userProfile', { gender: Sex.MALE })}
                icon={
                  <User
                    size={20}
                    className={
                      formData.userProfile.gender === Sex.MALE ? 'text-white' : 'text-neutral-500'
                    }
                  />
                }
                className="flex-1"
              />
              <SelectionCard
                title="Donna"
                selected={formData.userProfile.gender === Sex.FEMALE}
                onPress={() => updateField('userProfile', { gender: Sex.FEMALE })}
                icon={
                  <User
                    size={20}
                    className={
                      formData.userProfile.gender === Sex.FEMALE ? 'text-white' : 'text-neutral-500'
                    }
                  />
                }
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Livello Esperienza */}
      <Card className="overflow-hidden border-neutral-200 bg-white/50 p-0 backdrop-blur-md dark:border-white/[0.08] dark:bg-neutral-900/50">
        <div className="border-b border-neutral-200 bg-secondary-50/50 px-5 py-4 dark:border-white/[0.08] dark:bg-secondary-900/10">
          <div className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/30">
              <Activity size={20} className="text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Livello Esperienza
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Da quanto tempo ti alleni costantemente?
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-3 p-5">
          <SelectionCard
            title="Principiante"
            description="< 1 anno"
            selected={formData.userProfile.experienceLevel === DifficultyLevel.BEGINNER}
            onPress={() =>
              updateField('userProfile', { experienceLevel: DifficultyLevel.BEGINNER })
            }
            icon={
              <Zap
                size={24}
                className={
                  formData.userProfile.experienceLevel === DifficultyLevel.BEGINNER
                    ? 'text-white'
                    : 'text-neutral-500'
                }
              />
            }
            className="w-full sm:basis-[31%]"
            compact
          />
          <SelectionCard
            title="Intermedio"
            description="1-3 anni"
            selected={formData.userProfile.experienceLevel === DifficultyLevel.INTERMEDIATE}
            onPress={() =>
              updateField('userProfile', { experienceLevel: DifficultyLevel.INTERMEDIATE })
            }
            icon={
              <Zap
                size={24}
                className={
                  formData.userProfile.experienceLevel === DifficultyLevel.INTERMEDIATE
                    ? 'text-white'
                    : 'text-neutral-500'
                }
              />
            }
            className="w-full sm:basis-[31%]"
            compact
          />
          <SelectionCard
            title="Avanzato"
            description="> 3 anni"
            selected={formData.userProfile.experienceLevel === DifficultyLevel.ADVANCED}
            onPress={() =>
              updateField('userProfile', { experienceLevel: DifficultyLevel.ADVANCED })
            }
            icon={
              <Zap
                size={24}
                className={
                  formData.userProfile.experienceLevel === DifficultyLevel.ADVANCED
                    ? 'text-white'
                    : 'text-neutral-500'
                }
              />
            }
            className="w-full sm:basis-[31%]"
            compact
          />
        </div>
      </Card>

      {/* Obiettivi */}
      <Card className="overflow-hidden border-neutral-200 bg-white/50 p-0 backdrop-blur-md dark:border-white/[0.08] dark:bg-neutral-900/50">
        <div className="border-b border-neutral-200 bg-red-50/50 px-5 py-4 dark:border-white/[0.08] dark:bg-red-900/10">
          <div className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Target size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Obiettivo Principale
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Cosa vuoi ottenere da questo programma?
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="mb-6 flex flex-wrap gap-3">
            <SelectionCard
              title="Ipertrofia"
              selected={formData.goals.primaryGoal === WorkoutGoal.HYPERTROPHY}
              onPress={() => updateField('goals', { primaryGoal: WorkoutGoal.HYPERTROPHY })}
              icon={
                <Dumbbell
                  size={24}
                  className={
                    formData.goals.primaryGoal === WorkoutGoal.HYPERTROPHY
                      ? 'text-white'
                      : 'text-neutral-500'
                  }
                />
              }
              className="w-full sm:basis-[31%]"
              compact
            />
            <SelectionCard
              title="Forza"
              selected={formData.goals.primaryGoal === WorkoutGoal.STRENGTH}
              onPress={() => updateField('goals', { primaryGoal: WorkoutGoal.STRENGTH })}
              icon={
                <Activity
                  size={24}
                  className={
                    formData.goals.primaryGoal === WorkoutGoal.STRENGTH
                      ? 'text-white'
                      : 'text-neutral-500'
                  }
                />
              }
              className="w-full sm:basis-[31%]"
              compact
            />
            <SelectionCard
              title="Dimagrimento"
              selected={formData.goals.primaryGoal === WorkoutGoal.GENERAL_FITNESS}
              onPress={() => updateField('goals', { primaryGoal: WorkoutGoal.GENERAL_FITNESS })}
              icon={
                <Activity
                  size={24}
                  className={
                    formData.goals.primaryGoal === WorkoutGoal.GENERAL_FITNESS
                      ? 'text-white'
                      : 'text-neutral-500'
                  }
                />
              }
              className="w-full sm:basis-[31%]"
              compact
            />
          </div>

          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Giorni/Settimana"
                value={formData.goals.daysPerWeek.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('goals', { daysPerWeek: parseInt(e.target.value) || 0 })
                }
                type="number"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Durata (min)"
                value={formData.goals.sessionDurationMinutes.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField('goals', { sessionDurationMinutes: parseInt(e.target.value) || 0 })
                }
                type="number"
                className="bg-neutral-50 dark:bg-neutral-800/50"
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-neutral-700 dark:text-neutral-300">
              Split Preferita
            </p>
            <div className="flex flex-row flex-wrap gap-3">
              {SPLIT_OPTIONS.map((option: any) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  selected={formData.goals.splitType === option.value}
                  onPress={() => updateField('goals', { splitType: option.value })}
                  className="basis-[48%] sm:basis-[31%]"
                  compact
                  icon={
                    <Zap
                      size={20}
                      className={
                        formData.goals.splitType === option.value ? 'text-white' : 'text-neutral-500'
                      }
                    />
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Preferenze & Limitazioni */}
      <Card className="overflow-hidden border-neutral-200 bg-white/50 p-0 backdrop-blur-md dark:border-white/[0.08] dark:bg-neutral-900/50">
        <div className="border-b border-neutral-200 bg-orange-50/50 px-5 py-4 dark:border-white/[0.08] dark:bg-orange-900/10">
          <div className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Preferenze & Limitazioni
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Aiutaci a personalizzare l'esperienza
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <Input
            label="Infortuni / Limitazioni"
            value={csvFromArray(formData.constraints.injuriesLimitations)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('constraints', { injuriesLimitations: arrayFromCsv(e.target.value) })
            }
            placeholder="es. spalla dx, schiena..."
            className="bg-neutral-50 dark:bg-neutral-800/50"
          />
          <Input
            label="Attrezzatura Disponibile"
            value={csvFromArray(formData.constraints.availableEquipment)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('constraints', { availableEquipment: arrayFromCsv(e.target.value) })
            }
            placeholder="es. manubri, bilanciere, panca..."
            className="bg-neutral-50 dark:bg-neutral-800/50"
          />
          <Input
            label="Esercizi Preferiti"
            value={csvFromArray(formData.constraints.preferredExercises)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField('constraints', { preferredExercises: arrayFromCsv(e.target.value) })
            }
            placeholder="es. panca piana, squat..."
            className="bg-neutral-50 dark:bg-neutral-800/50"
          />
          <Input
            label="Note Aggiuntive"
            value={formData.additionalNotes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAdditionalNotes(e.target.value)}
            placeholder="Dettagli extra per il coach..."
            className="bg-neutral-50 dark:bg-neutral-800/50"
          />
        </div>
      </Card>

      {/* AI Settings */}
      <Card className="overflow-hidden border-neutral-200 bg-white/50 p-0 backdrop-blur-md dark:border-white/[0.08] dark:bg-neutral-900/50">
        <div className="border-b border-neutral-200 bg-gray-50/50 px-5 py-4 dark:border-white/[0.08] dark:bg-gray-900/10">
          <div className="flex flex-row items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Impostazioni AI
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Scegli il livello di creatività dell'AI
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-3 p-5">
          {TIER_OPTIONS.map((option: any) => (
            <SelectionCard
              key={option.value}
              title={option.label}
              selected={formData.tierAI === option.value}
              onPress={() => updateTierAI(option.value)}
              className="basis-[48%] sm:basis-[31%]"
              compact
              icon={
                <Zap
                  size={20}
                  className={formData.tierAI === option.value ? 'text-white' : 'text-neutral-500'}
                />
              }
            />
          ))}
        </div>
      </Card>

      <div className="pt-4">
        <Button
          variant="default"
          onClick={generate}
          disabled={isGenerating}
          className="h-12 w-full bg-primary-600 text-lg text-white shadow-xl shadow-primary-500/20 hover:bg-primary-700"
        >
          {isGenerating ? 'Generazione in corso...' : 'Genera Programma'}
        </Button>
      </div>
    </div>
  );
}
