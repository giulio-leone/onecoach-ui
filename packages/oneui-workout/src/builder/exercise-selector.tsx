'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X, Dumbbell, Plus } from 'lucide-react';
import { getExercises } from '@/app/actions/workouts';

import { logger } from '@onecoach/lib-shared';
import type { Exercise } from '@onecoach/types-workout';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

/**
 * ExerciseSelector - Selettore esercizi dal catalogo
 *
 * Restituisce un Exercise con:
 * - id: ID temporaneo dell'istanza (generato)
 * - catalogExerciseId: ID dell'esercizio nel catalogo database (OBBLIGATORIO)
 *
 * Per i massimali (1RM), usare catalogExerciseId per il salvataggio.
 */
export function ExerciseSelector({ isOpen, onClose, onSelect }: ExerciseSelectorProps) {
  const t = useTranslations('workouts.builder.selector');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const data = await getExercises(searchQuery);
        setExercises(Array.isArray(data) ? (data as Exercise[]) : []);
      } catch (error: unknown) {
        logger.error('Failed to fetch exercises', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isOpen]);

  const filteredExercises = exercises.filter((ex: Exercise) => {
    const matchesMuscle = selectedMuscle
      ? ex.muscleGroups?.includes(selectedMuscle as import('@onecoach/types').MuscleGroup)
      : true;
    return matchesMuscle;
  });

  const handleSelect = (ex: Exercise) => {
    // Determina l'ID del catalogo
    const catalogId = ex.catalogExerciseId || ex.id;

    if (!catalogId) {
      logger.error('[ExerciseSelector] Impossibile determinare catalogExerciseId per:', ex);
      return;
    }

    const newExercise: Exercise = {
      id: `exercise_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, // ID istanza univoco
      catalogExerciseId: catalogId,
      name: ex.name!,
      description: '',
      category: ex.category,
      muscleGroups: ex.muscleGroups,
      setGroups: [
        {
          id: `setgroup_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          count: 3,
          baseSet: {
            reps: 10,
            weight: 0,
            weightLbs: 0,
            rest: 60,
            intensityPercent: 0,
            rpe: 8,
          },
          sets: [],
        },
      ],
      notes: '',
      typeLabel: '',
      repRange: '',
      formCues: [],
      equipment: ex.equipment || [],
    };
    onSelect(newExercise);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 pt-8 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-neutral-950 shadow-2xl ring-1 ring-neutral-800 sm:h-[82vh] sm:rounded-3xl">
        {/* Header */}
        <div className="border-b border-neutral-800 p-4 pb-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{t('title')}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label={t('close')}
            >
              <X size={24} className="text-neutral-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-neutral-900 p-2 ring-1 ring-transparent focus-within:ring-blue-500">
            <Search size={18} className="ml-2 text-neutral-500" />
            <input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
            />
          </div>

          <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
            {['chest', 'back', 'legs', 'shoulders', 'arms', 'core'].map((muscle: string) => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
                className={`rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors ${
                  selectedMuscle === muscle
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                <span className="text-sm capitalize">{t(`muscles.${muscle}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3 pb-16 sm:pb-8">
              {filteredExercises.map((ex: Exercise) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelect(ex)}
                  className="hover:bg-neutral-850 flex w-full items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-left transition-colors hover:border-blue-500/60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <Dumbbell size={24} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{ex.name}</div>
                    <div className="text-sm text-neutral-400 capitalize">
                      {ex.muscleGroups?.join(', ')}
                    </div>
                  </div>
                  <Plus size={20} className="text-blue-400" />
                </button>
              ))}
              {filteredExercises.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
                  <Dumbbell size={48} className="mb-4 opacity-40" />
                  <p>{t('noResults')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
