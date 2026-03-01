'use client';

import { useState, useCallback } from 'react';
import { Card, Button, Input, Badge } from '@giulio-leone/ui';
import { Plus, Trash2, Clock, Flame, GripVertical } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { WarmupSection, WarmupExerciseItem } from '@giulio-leone/schemas';

// ============================================================================
// Types
// ============================================================================

interface WarmupEditorProps {
  warmup?: WarmupSection;
  onChange: (warmup: WarmupSection) => void;
  onRemove?: () => void;
  className?: string;
}

// ============================================================================
// WarmupEditor Component
// ============================================================================

/**
 * WarmupEditor - Form for configuring warmup sections
 *
 * Features:
 * - Duration slider (5-15 min)
 * - Dynamic exercise list with add/remove
 * - Per-exercise duration OR reps toggle
 * - Drag-to-reorder (visual feedback)
 * - Mobile-first responsive design
 */
export function WarmupEditor({ warmup, onChange, onRemove, className }: WarmupEditorProps) {
  const [exercises, setExercises] = useState<WarmupExerciseItem[]>(
    warmup?.exercises ?? [
      { name: 'Jumping Jacks', duration: 60 },
      { name: 'Arm Circles', reps: 20 },
      { name: 'Leg Swings', reps: 15 },
    ]
  );
  const [durationMinutes, setDurationMinutes] = useState(warmup?.durationMinutes ?? 10);
  const [name, setName] = useState(warmup?.name ?? 'Riscaldamento Dinamico');

  // Notify parent of changes
  const emitChange = useCallback(
    (newExercises?: WarmupExerciseItem[], newDuration?: number, newName?: string) => {
      onChange({
        id: warmup?.id ?? `warmup_${Math.random().toString(36).substring(2, 11)}`,
        type: 'warmup',
        name: newName ?? name,
        durationMinutes: newDuration ?? durationMinutes,
        exercises: newExercises ?? exercises,
      });
    },
    [warmup?.id, name, durationMinutes, exercises, onChange]
  );

  const handleAddExercise = useCallback(() => {
    const updated = [...exercises, { name: '', duration: 30 }];
    setExercises(updated);
    emitChange(updated);
  }, [exercises, emitChange]);

  const handleRemoveExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
    emitChange(updated);
  };

  const handleExerciseChange = (
    index: number,
    field: keyof WarmupExerciseItem,
    value: string | number
  ) => {
    const updated = exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex));
    setExercises(updated);
    emitChange(updated);
  };

  const toggleExerciseType = (index: number) => {
    const updated = exercises.map((ex, i) => {
      if (i !== index) return ex;
      // Toggle between duration and reps
      if (ex.duration !== undefined) {
        return { name: ex.name, reps: 15, notes: ex.notes };
      }
      return { name: ex.name, duration: 30, notes: ex.notes };
    });
    setExercises(updated);
    emitChange(updated);
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 p-4 md:p-6',
        'border-orange-500/30 transition-all hover:border-orange-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-orange-500/20 p-2">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                emitChange(undefined, undefined, e.target.value);
              }}
              className="h-auto border-none bg-transparent p-0 text-lg font-semibold focus:ring-0"
              placeholder="Nome riscaldamento"
            />
          </div>
        </div>
        <Badge variant="outline" className="bg-orange-500/20 text-orange-600">
          <Clock className="mr-1 h-3 w-3" />
          {durationMinutes} min
        </Badge>
      </div>

      {/* Duration Slider */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-2 block text-sm">Durata Totale</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={20}
            value={durationMinutes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = parseInt(e.target.value);
              setDurationMinutes(val);
              emitChange(undefined, val);
            }}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-orange-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md"
          />
          <span className="w-12 text-right text-sm font-medium">{durationMinutes} min</span>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
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
              className="bg-background/50 border-border/50 flex items-center gap-2 rounded-lg border p-2 transition-colors hover:border-orange-500/30"
            >
              <GripVertical className="text-muted-foreground/50 h-4 w-4 cursor-grab" />

              <Input
                value={exercise.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExerciseChange(index, 'name', e.target.value)}
                placeholder="Nome esercizio"
                className="h-8 flex-1 text-sm"
              />

              <button
                onClick={() => toggleExerciseType(index)}
                className="bg-muted hover:bg-muted/80 rounded px-2 py-1 text-xs transition-colors"
              >
                {exercise.duration !== undefined ? 'Tempo' : 'Reps'}
              </button>

              {exercise.duration !== undefined ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={exercise.duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleExerciseChange(index, 'duration', parseInt(e.target.value) || 0)
                    }
                    className="h-8 w-16 text-center text-sm"
                    min={0}
                  />
                  <span className="text-muted-foreground text-xs">s</span>
                </div>
              ) : (
                <Input
                  type="number"
                  value={exercise.reps}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)
                  }
                  className="h-8 w-16 text-center text-sm"
                  min={0}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveExercise(index)}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Exercise Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddExercise}
          className="mt-2 w-full border-dashed border-orange-500/30 text-orange-600 hover:border-orange-500/50 hover:bg-orange-500/10"
        >
          <Plus className="mr-1 h-4 w-4" />
          Aggiungi Esercizio
        </Button>
      </div>

      {/* Remove Section Button */}
      {onRemove && (
        <div className="border-border/50 mt-4 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive w-full"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Rimuovi Riscaldamento
          </Button>
        </div>
      )}
    </Card>
  );
}

export default WarmupEditor;
