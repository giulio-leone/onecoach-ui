'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@giulio-leone/ui';
import { Plus, Trash2, Clock, Link2, GripVertical } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { Superset, Exercise, ExerciseSet } from '@giulio-leone/schemas';

// ============================================================================
// Types & Converters
// ============================================================================

/** Simplified exercise for superset builder UI */
interface SupersetBuilderExercise extends Omit<Exercise, 'setGroups' | 'reps'> {
  // Builder-specific fields
  sets: number;
  reps: number;
  // Kept for compatibility but managed internally
  setGroups: Exercise['setGroups'];
}

/** Props for the editor */
interface SupersetEditorProps {
  superset?: Superset;
  onChange: (superset: Superset) => void;
  onRemove?: () => void;
  className?: string;
}

const DEFAULT_EXERCISE_DATA = {
  description: '',
  type: 'isolation' as const,
  category: 'strength' as const,
  setGroups: [],
};

// Converter: Schema Exercise -> UI Builder Exercise
const toBuilder = (ex: Exercise): SupersetBuilderExercise => {
  const group = ex.setGroups?.[0];
  return {
    ...ex,
    sets: group?.count ?? 3,
    // Safely handle reps string/number mismatch if relevant, or verify schema
    // Exercise schema says reps is string (optional display)
    // But sets have reps as number. We use the SET reps.
    reps: group?.baseSet.reps ?? 12,
    setGroups: ex.setGroups ?? [],
  };
};

// Converter: UI Builder Exercise -> Schema Exercise
// IMPORTANT: Preserve ALL original setGroups and their Max fields
const fromBuilder = (b: SupersetBuilderExercise): Exercise => {
  // Get original setGroups - preserve them ALL
  const originalSetGroups = b.setGroups ?? [];

  // Update only the first setGroup's count and reps (UI-editable fields)
  // Keep all other fields (weight, weightMax, repsMax, intensityPercent, rpe, rest, etc.)
  const updatedSetGroups =
    originalSetGroups.length > 0
      ? originalSetGroups.map((group, index) => {
          if (index === 0) {
            // Only update count and reps on first group, preserve everything else
            return {
              ...group,
              count: b.sets,
              baseSet: {
                ...group.baseSet,
                reps: b.reps,
                // Keep all Max fields and other properties intact
              },
            };
          }
          // Keep other setGroups completely unchanged
          return group;
        })
      : [
          {
            // Fallback: create new setGroup if none exist
            id: `sg_${Math.random().toString(36).substring(2, 11)}`,
            count: b.sets,
            baseSet: {
              reps: b.reps,
              rest: 60,
              weight: null,
              weightLbs: null,
              intensityPercent: null,
              rpe: null,
            } as ExerciseSet,
            sets: [],
          },
        ];

  // Remove builder-specific fields that aren't in Exercise schema
  const { sets: _sets, reps: _reps, ...rest } = b;

  return {
    ...rest,
    setGroups: updatedSetGroups,
  };
};

// ============================================================================
// SupersetEditor Component
// ============================================================================

export function SupersetEditor({ superset, onChange, onRemove, className }: SupersetEditorProps) {
  const [exercises, setExercises] = useState<SupersetBuilderExercise[]>(
    superset?.exercises?.map(toBuilder) ?? [
      {
        exerciseId: 'curl',
        name: 'Curl con Bilanciere',
        sets: 3,
        reps: 12,
        ...DEFAULT_EXERCISE_DATA,
      },
      { exerciseId: 'french', name: 'French Press', sets: 3, reps: 12, ...DEFAULT_EXERCISE_DATA },
    ]
  );

  const [restBetween, setRestBetween] = useState(superset?.restBetweenExercises ?? 0);
  const [restAfter, setRestAfter] = useState(superset?.restAfterSuperset ?? 90);
  const [rounds, setRounds] = useState(superset?.rounds ?? 1);
  const [name, setName] = useState(superset?.name ?? 'Superset');

  const emitChange = useCallback(
    (updates?: {
      exercises?: SupersetBuilderExercise[];
      name?: string;
      restBetweenExercises?: number;
      restAfterSuperset?: number;
      rounds?: number;
    }) => {
      // Current state values
      const currentName = updates?.name ?? name;
      const currentRestBetween = updates?.restBetweenExercises ?? restBetween;
      const currentRestAfter = updates?.restAfterSuperset ?? restAfter;
      const currentRounds = updates?.rounds ?? rounds;
      const currentExercises = updates?.exercises ?? exercises;

      onChange({
        id: superset?.id ?? `superset_${Math.random().toString(36).substring(2, 11)}`,
        type: 'superset',
        name: currentName,
        exercises: currentExercises.map(fromBuilder),
        restBetweenExercises: currentRestBetween,
        restAfterSuperset: currentRestAfter,
        rounds: currentRounds,
      });
    },
    [superset?.id, name, restBetween, restAfter, rounds, exercises, onChange]
  );

  // Update parent when scalar values change
  useEffect(() => {
    emitChange({});
  }, [restBetween, restAfter, rounds]);

  const handleAddExercise = useCallback(() => {
    if (exercises.length >= 4) return;
    const updated = [
      ...exercises,
      {
        exerciseId: `ex_${Math.random().toString(36).substring(2, 11)}`,
        name: '',
        sets: 3,
        reps: 10,
        ...DEFAULT_EXERCISE_DATA,
      },
    ];
    setExercises(updated);
    emitChange({ exercises: updated });
  }, [exercises, emitChange]);

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 2) return;
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  const handleExerciseChange = (
    index: number,
    field: keyof SupersetBuilderExercise,
    value: string | number
  ) => {
    const updated = exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex));
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-secondary-500/10 to-secondary-500/10 p-4 md:p-6',
        'border-secondary-500/30 transition-all hover:border-secondary-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-secondary-500/20 p-2">
            <Link2 className="h-5 w-5 text-secondary-500" />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                emitChange({ name: e.target.value });
              }}
              className="h-auto border-none bg-transparent p-0 text-lg font-semibold focus:ring-0"
              placeholder="Nome superset"
            />
          </div>
        </div>
        <Badge variant="outline" className="bg-secondary-500/20 text-secondary-600">
          {exercises.length} esercizi
        </Badge>
      </div>

      {/* Exercises with Visual Linking */}
      <div className="relative space-y-0">
        <div className="absolute top-8 bottom-8 left-6 hidden w-0.5 bg-gradient-to-b from-secondary-500 to-secondary-500 opacity-50 md:block" />

        <AnimatePresence mode="popLayout">
          {exercises.map((exercise, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  'bg-background/50 flex items-start gap-2 rounded-lg p-3',
                  'border-border/50 border transition-colors hover:border-secondary-500/30',
                  'relative ml-0 md:ml-8',
                  index > 0 && 'mt-2'
                )}
              >
                <div className="absolute top-1/2 -left-10 hidden -translate-y-1/2 items-center md:flex">
                  <div className="h-0.5 w-4 bg-secondary-500/50" />
                  <div className="h-2 w-2 rounded-full bg-secondary-500" />
                </div>

                <GripVertical className="text-muted-foreground/50 mt-2 h-4 w-4 flex-shrink-0 cursor-grab" />

                <div className="flex-1 space-y-2">
                  <Input
                    value={exercise.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExerciseChange(index, 'name', e.target.value)}
                    placeholder="Nome esercizio"
                    className="h-9"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-muted-foreground text-xs">Serie</label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)
                        }
                        className="h-8 text-center"
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-muted-foreground text-xs">Reps</label>
                      <Input
                        type="number"
                        value={exercise.reps}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)
                        }
                        className="h-8 text-center"
                        min={1}
                        max={50}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExercise(index)}
                  disabled={exercises.length <= 2}
                  className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {index < exercises.length - 1 && (
                <div className="text-muted-foreground flex items-center justify-center py-1 text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {restBetween}s riposo
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {exercises.length < 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddExercise}
            className="mt-3 ml-0 w-full border-dashed border-secondary-500/30 text-secondary-600 hover:border-secondary-500/50 hover:bg-secondary-500/10 md:ml-8"
          >
            <Plus className="mr-1 h-4 w-4" />
            Aggiungi Esercizio ({4 - exercises.length} rimanenti)
          </Button>
        )}
      </div>

      {/* Settings */}
      <div className="border-border/50 mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-3">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Riposo tra esercizi</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={15}
              value={restBetween}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = parseInt(e.target.value);
                setRestBetween(val);
                emitChange({ restBetweenExercises: val });
              }}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded bg-secondary-200 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary-500"
            />
            <span className="w-8 text-xs">{restBetween}s</span>
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Riposo dopo superset</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={30}
              max={180}
              step={15}
              value={restAfter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = parseInt(e.target.value);
                setRestAfter(val);
                emitChange({ restAfterSuperset: val });
              }}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded bg-secondary-200 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary-500"
            />
            <span className="w-8 text-xs">{restAfter}s</span>
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Round</label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const val = Math.max(1, rounds - 1);
                setRounds(val);
                emitChange({ rounds: val });
              }}
              disabled={rounds <= 1}
            >
              -
            </Button>
            <span className="flex-1 text-center font-medium">{rounds}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const val = Math.min(5, rounds + 1);
                setRounds(val);
                emitChange({ rounds: val });
              }}
              disabled={rounds >= 5}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {onRemove && (
        <div className="border-border/50 mt-4 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive w-full"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Rimuovi Superset
          </Button>
        </div>
      )}
    </Card>
  );
}

export default SupersetEditor;
