'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@onecoach/ui';
import { Plus, Trash2, Clock, Link2, GripVertical } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { Superset, Exercise, ExerciseSet } from '@onecoach/schemas';

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
    setGroups: ex.setGroups ?? []
  };
};

// Converter: UI Builder Exercise -> Schema Exercise
// IMPORTANT: Preserve ALL original setGroups and their Max fields
const fromBuilder = (b: SupersetBuilderExercise): Exercise => {
  // Get original setGroups - preserve them ALL
  const originalSetGroups = b.setGroups ?? [];
  
  // Update only the first setGroup's count and reps (UI-editable fields)
  // Keep all other fields (weight, weightMax, repsMax, intensityPercent, rpe, rest, etc.)
  const updatedSetGroups = originalSetGroups.length > 0
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
    : [{
        // Fallback: create new setGroup if none exist
        id: `sg_${Date.now()}_${Math.random()}`,
        count: b.sets,
        baseSet: {
          reps: b.reps,
          rest: 60,
          weight: null,
          weightLbs: null,
          intensityPercent: null,
          rpe: null,
        } as ExerciseSet,
        sets: []
      }];
  
  // Remove builder-specific fields that aren't in Exercise schema
  const { sets, reps, ...rest } = b;
  
  return {
    ...rest,
    setGroups: updatedSetGroups,
  };
};

// ============================================================================
// SupersetEditor Component
// ============================================================================

export function SupersetEditor({ 
  superset, 
  onChange, 
  onRemove,
  className 
}: SupersetEditorProps) {
  const [exercises, setExercises] = useState<SupersetBuilderExercise[]>(
    superset?.exercises?.map(toBuilder) ?? [
      { exerciseId: 'curl', name: 'Curl con Bilanciere', sets: 3, reps: 12, ...DEFAULT_EXERCISE_DATA },
      { exerciseId: 'french', name: 'French Press', sets: 3, reps: 12, ...DEFAULT_EXERCISE_DATA },
    ]
  );
  
  const [restBetween, setRestBetween] = useState(superset?.restBetweenExercises ?? 0);
  const [restAfter, setRestAfter] = useState(superset?.restAfterSuperset ?? 90);
  const [rounds, setRounds] = useState(superset?.rounds ?? 1);
  const [name, setName] = useState(superset?.name ?? 'Superset');

  const emitChange = (updates?: { exercises?: SupersetBuilderExercise[], name?: string, restBetweenExercises?: number, restAfterSuperset?: number, rounds?: number }) => {
    // Current state values
    const currentName = updates?.name ?? name;
    const currentRestBetween = updates?.restBetweenExercises ?? restBetween;
    const currentRestAfter = updates?.restAfterSuperset ?? restAfter;
    const currentRounds = updates?.rounds ?? rounds;
    const currentExercises = updates?.exercises ?? exercises;

    onChange({
      id: superset?.id ?? `superset_${Date.now()}`,
      type: 'superset',
      name: currentName,
      exercises: currentExercises.map(fromBuilder),
      restBetweenExercises: currentRestBetween,
      restAfterSuperset: currentRestAfter,
      rounds: currentRounds,
    });
  };

  // Update parent when scalar values change
  useEffect(() => {
    emitChange({});
  }, [restBetween, restAfter, rounds]);

  const handleAddExercise = () => {
    if (exercises.length >= 4) return;
    const updated = [...exercises, { exerciseId: `ex_${Date.now()}`, name: '', sets: 3, reps: 10, ...DEFAULT_EXERCISE_DATA }];
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 2) return;
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  const handleExerciseChange = (
    index: number, 
    field: keyof SupersetBuilderExercise, 
    value: any
  ) => {
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  return (
    <Card className={cn(
      'p-4 md:p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10',
      'border-purple-500/30 hover:border-purple-500/50 transition-all',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Link2 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                emitChange({ name: e.target.value });
              }}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus:ring-0"
              placeholder="Nome superset"
            />
          </div>
        </div>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-600">
          {exercises.length} esercizi
        </Badge>
      </div>

      {/* Exercises with Visual Linking */}
      <div className="space-y-0 relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 opacity-50 hidden md:block" />
        
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
              <div className={cn(
                'flex items-start gap-2 p-3 rounded-lg bg-background/50',
                'border border-border/50 hover:border-purple-500/30 transition-colors',
                'relative ml-0 md:ml-8',
                index > 0 && 'mt-2'
              )}>
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 hidden md:flex items-center">
                  <div className="w-4 h-0.5 bg-purple-500/50" />
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                </div>

                <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab flex-shrink-0 mt-2" />
                
                <div className="flex-1 space-y-2">
                  <Input
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    placeholder="Nome esercizio"
                    className="h-9"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Serie</label>
                      <Input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                        className="h-8 text-center"
                        min={1}
                        max={10}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Reps</label>
                      <Input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
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
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {index < exercises.length - 1 && (
                <div className="flex items-center justify-center py-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
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
            className="w-full mt-3 border-dashed border-purple-500/30 text-purple-600 
                       hover:bg-purple-500/10 hover:border-purple-500/50 ml-0 md:ml-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Aggiungi Esercizio ({4 - exercises.length} rimanenti)
          </Button>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Riposo tra esercizi
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={15}
              value={restBetween}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setRestBetween(val);
                emitChange({ restBetweenExercises: val });
              }}
              className="flex-1 h-1.5 bg-purple-200 rounded appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <span className="text-xs w-8">{restBetween}s</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Riposo dopo superset
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={30}
              max={180}
              step={15}
              value={restAfter}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setRestAfter(val);
                emitChange({ restAfterSuperset: val });
              }}
              className="flex-1 h-1.5 bg-purple-200 rounded appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <span className="text-xs w-8">{restAfter}s</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Round
          </label>
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
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Rimuovi Superset
          </Button>
        </div>
      )}
    </Card>
  );
}

export default SupersetEditor;
