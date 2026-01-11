'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@onecoach/ui';
import { Plus, Trash2, Clock, RefreshCw, GripVertical } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { Circuit, CircuitExerciseItem } from '@onecoach/schemas';

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

export function CircuitEditor({ 
  circuit, 
  onChange, 
  onRemove,
  className 
}: CircuitEditorProps) {
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

  const emitChange = (updates?: Partial<Circuit>) => {
    onChange({
      id: circuit?.id ?? `circuit_${Date.now()}`,
      type: 'circuit',
      name,
      exercises,
      rounds,
      restBetweenExercises,
      restBetweenRounds,
      ...updates,
    });
  };

  const handleAddExercise = () => {
    const updated = [...exercises, { exerciseId: `ex_${Date.now()}`, name: '', reps: 10 }];
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
    field: keyof CircuitExerciseItem, 
    value: string | number
  ) => {
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
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

  const estimatedDuration = exercises.reduce((sum, ex) => {
    return sum + (ex.duration ?? (ex.reps ?? 10) * 3);
  }, 0) * rounds + restBetweenExercises * (exercises.length - 1) * rounds + restBetweenRounds * (rounds - 1);
  const estimatedMinutes = Math.ceil(estimatedDuration / 60);

  return (
    <Card className={cn(
      'p-4 md:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10',
      'border-green-500/30 hover:border-green-500/50 transition-all',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-500/20">
            <RefreshCw className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                emitChange({ name: e.target.value });
              }}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus:ring-0"
              placeholder="Nome circuito"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/20 text-green-600">
            {rounds}x
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            ~{estimatedMinutes} min
          </Badge>
        </div>
      </div>

      {/* Rounds Counter */}
      <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-green-500/10 mb-4">
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
          <div className="text-xs text-muted-foreground">Round</div>
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
      <div className="flex justify-center gap-1 mb-4">
        {Array.from({ length: rounds }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'w-3 h-3 rounded-full',
              i === 0 ? 'bg-green-500' : 'bg-green-500/30'
            )}
          />
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-muted-foreground">
          Esercizi ({exercises.length})
        </label>
        <AnimatePresence mode="popLayout">
          {exercises.map((exercise, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50 
                         border border-border/50 hover:border-green-500/30 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-600">
                {index + 1}
              </div>
              
              <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
              
              <Input
                value={exercise.name}
                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                placeholder="Nome esercizio"
                className="flex-1 h-8 text-sm"
              />

              <button
                onClick={() => toggleExerciseType(index)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
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
                  onChange={(e) => handleExerciseChange(index, 'duration', parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-sm text-center"
                  min={5}
                  max={120}
                />
              ) : (
                <Input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-sm text-center"
                  min={1}
                  max={100}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveExercise(index)}
                disabled={exercises.length <= 2}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddExercise}
          className="w-full mt-2 border-dashed border-green-500/30 text-green-600 
                     hover:bg-green-500/10 hover:border-green-500/50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Aggiungi Esercizio
        </Button>
      </div>

      {/* Rest Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
        <div>
          <label className="text-xs text-muted-foreground block mb-2">
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
            className="w-full h-1.5 bg-green-200 rounded appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-green-500"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground block mb-2">
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
            className="w-full h-1.5 bg-green-200 rounded appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-green-500"
          />
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
            Rimuovi Circuito
          </Button>
        </div>
      )}
    </Card>
  );
}

export default CircuitEditor;
