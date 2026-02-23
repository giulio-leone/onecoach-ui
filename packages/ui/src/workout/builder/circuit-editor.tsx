'use client';

import { useState, useCallback } from 'react';
import { Card, Button, Input, Badge } from '@giulio-leone/ui';
import { Plus, Trash2, Clock, RefreshCw, GripVertical } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { Circuit, CircuitExerciseItem } from '@giulio-leone/schemas';

// ============================================================================
// Types for Builder
// ============================================================================

interface CircuitEditorProps {
  circuit?: Partial<Circuit>;
  onChange: (circuit: Partial<Circuit>) => void;
  onRemove?: () => void;
  className?: string;
}

// ============================================================================
// CircuitEditor Component
// ============================================================================

export function CircuitEditor({ circuit, onChange, onRemove, className }: CircuitEditorProps) {
  const [exercises, setExercises] = useState<CircuitExerciseItem[]>(
    circuit?.exercises ?? [
      { exerciseId: 'burpees', name: 'Burpees', reps: 10 },
      { exerciseId: 'kb_swing', name: 'Kettlebell Swing', reps: 15 },
      { exerciseId: 'mtn_climbers', name: 'Mountain Climbers', duration: 30 },
      { exerciseId: 'plank', name: 'Plank', duration: 45 },
    ]
  );
  const [rounds, setRounds] = useState(circuit?.rounds ?? 3);
  const [restBetweenExercises, setRestBetweenEx] = useState(circuit?.restBetweenExercises ?? 10);
  const [restBetweenRounds, setRestBetweenRounds] = useState(circuit?.restBetweenRounds ?? 60);
  const [name, setName] = useState(circuit?.name ?? 'Circuito Full Body');

  const emitChange = useCallback(
    (updates?: Partial<Circuit>) => {
      onChange({
        id: circuit?.id ?? `circuit_${Math.random().toString(36).substr(2, 9)}`,
        type: 'circuit',
        name,
        exercises,
        rounds,
        restBetweenExercises,
        restBetweenRounds,
        ...updates,
      });
    },
    [circuit?.id, name, exercises, rounds, restBetweenExercises, restBetweenRounds, onChange]
  );

  const handleAddExercise = useCallback(() => {
    const updated = [
      ...exercises,
      { exerciseId: `ex_${Math.random().toString(36).substr(2, 9)}`, name: '', reps: 10 },
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
    field: keyof CircuitExerciseItem,
    value: string | number
  ) => {
    const updated = exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex));
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  const toggleExerciseType = (index: number) => {
    const updated = exercises.map((ex, i) => {
      if (i !== index) return ex;
      if (ex.duration !== undefined) {
        const { duration: _, ...rest } = ex;
        return { ...rest, reps: 10 };
      }
      const { reps: _, ...rest } = ex;
      return { ...rest, duration: 30 };
    });
    setExercises(updated);
    emitChange({ exercises: updated });
  };

  const estimatedDuration =
    exercises.reduce((sum, ex) => {
      return sum + (ex.duration ?? (ex.reps ?? 10) * 3);
    }, 0) *
      rounds +
    restBetweenExercises * (exercises.length - 1) * rounds +
    restBetweenRounds * (rounds - 1);
  const estimatedMinutes = Math.ceil(estimatedDuration / 60);

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 md:p-6',
        'border-green-500/30 transition-all hover:border-green-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-500/20 p-2">
            <RefreshCw className="h-5 w-5 text-green-500" />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                emitChange({ name: e.target.value });
              }}
              className="h-auto border-none bg-transparent p-0 text-lg font-semibold focus:ring-0"
              placeholder="Nome circuito"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/20 text-green-600">
            {rounds}x
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />~{estimatedMinutes} min
          </Badge>
        </div>
      </div>

      {/* Rounds Counter */}
      <div className="mb-4 flex items-center justify-center gap-4 rounded-lg bg-green-500/10 p-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => {
            const val = Math.max(1, rounds - 1);
            setRounds(val);
            emitChange({ rounds: val });
          }}
          disabled={rounds <= 1}
        >
          -
        </Button>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{rounds}</div>
          <div className="text-muted-foreground text-xs">Round</div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => {
            const val = Math.min(10, rounds + 1);
            setRounds(val);
            emitChange({ rounds: val });
          }}
          disabled={rounds >= 10}
        >
          +
        </Button>
      </div>

      {/* Visual Round Progress */}
      <div className="mb-4 flex justify-center gap-1">
        {Array.from({ length: rounds }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn('h-3 w-3 rounded-full', i === 0 ? 'bg-green-500' : 'bg-green-500/30')}
          />
        ))}
      </div>

      {/* Exercise List */}
      <div className="mb-4 space-y-2">
        <label className="text-muted-foreground text-sm">Esercizi ({exercises.length})</label>
        <AnimatePresence mode="popLayout">
          {exercises.map((exercise, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="bg-background/50 border-border/50 flex items-center gap-2 rounded-lg border p-2 transition-colors hover:border-green-500/30"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs font-medium text-green-600">
                {index + 1}
              </div>

              <GripVertical className="text-muted-foreground/50 h-4 w-4 cursor-grab" />

              <Input
                value={exercise.name}
                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                placeholder="Nome esercizio"
                className="h-8 flex-1 text-sm"
              />

              <button
                onClick={() => toggleExerciseType(index)}
                className={cn(
                  'rounded px-2 py-1 text-xs transition-colors',
                  exercise.duration !== undefined
                    ? 'bg-cyan-500/20 text-cyan-600'
                    : 'bg-purple-500/20 text-purple-600'
                )}
              >
                {exercise.duration !== undefined ? '⏱️ Tempo' : '🔢 Reps'}
              </button>

              {exercise.duration !== undefined ? (
                <Input
                  type="number"
                  value={exercise.duration}
                  onChange={(e) =>
                    handleExerciseChange(index, 'duration', parseInt(e.target.value) || 0)
                  }
                  className="h-8 w-16 text-center text-sm"
                  min={5}
                  max={120}
                />
              ) : (
                <Input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) =>
                    handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)
                  }
                  className="h-8 w-16 text-center text-sm"
                  min={1}
                  max={100}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveExercise(index)}
                disabled={exercises.length <= 2}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddExercise}
          className="mt-2 w-full border-dashed border-green-500/30 text-green-600 hover:border-green-500/50 hover:bg-green-500/10"
        >
          <Plus className="mr-1 h-4 w-4" />
          Aggiungi Esercizio
        </Button>
      </div>

      {/* Rest Settings */}
      <div className="bg-background/50 border-border/50 grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-2">
        <div>
          <label className="text-muted-foreground mb-2 block text-xs">
            Riposo tra esercizi: <span className="font-medium">{restBetweenExercises}s</span>
          </label>
          <input
            type="range"
            min={0}
            max={30}
            step={5}
            value={restBetweenExercises}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRestBetweenEx(val);
              emitChange({ restBetweenExercises: val });
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded bg-green-200 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-2 block text-xs">
            Riposo tra round: <span className="font-medium">{restBetweenRounds}s</span>
          </label>
          <input
            type="range"
            min={30}
            max={120}
            step={15}
            value={restBetweenRounds}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRestBetweenRounds(val);
              emitChange({ restBetweenRounds: val });
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded bg-green-200 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
          />
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
            Rimuovi Circuito
          </Button>
        </div>
      )}
    </Card>
  );
}

export default CircuitEditor;
