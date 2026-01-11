'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@onecoach/ui';
import { Plus, Trash2, Clock, Flame, GripVertical } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { motion, AnimatePresence } from 'framer-motion';
import type { WarmupSection, WarmupExerciseItem } from '@onecoach/schemas';

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
export function WarmupEditor({ 
  warmup, 
  onChange, 
  onRemove,
  className 
}: WarmupEditorProps) {
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
  const emitChange = (
    newExercises?: WarmupExerciseItem[],
    newDuration?: number,
    newName?: string
  ) => {
    onChange({
      id: warmup?.id ?? `warmup_${Date.now()}`,
      type: 'warmup',
      name: newName ?? name,
      durationMinutes: newDuration ?? durationMinutes,
      exercises: newExercises ?? exercises,
    });
  };

  const handleAddExercise = () => {
    const updated = [...exercises, { name: '', duration: 30 }];
    setExercises(updated);
    emitChange(updated);
  };

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
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
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
    <Card className={cn(
      'p-4 md:p-6 bg-gradient-to-br from-orange-500/10 to-yellow-500/10',
      'border-orange-500/30 hover:border-orange-500/50 transition-all',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                emitChange(undefined, undefined, e.target.value);
              }}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus:ring-0"
              placeholder="Nome riscaldamento"
            />
          </div>
        </div>
        <Badge variant="outline" className="bg-orange-500/20 text-orange-600">
          <Clock className="w-3 h-3 mr-1" />
          {durationMinutes} min
        </Badge>
      </div>

      {/* Duration Slider */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground block mb-2">
          Durata Totale
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={20}
            value={durationMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setDurationMinutes(val);
              emitChange(undefined, val);
            }}
            className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-orange-500
                       [&::-webkit-slider-thumb]:shadow-md
                       [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-sm font-medium w-12 text-right">
            {durationMinutes} min
          </span>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
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
                         border border-border/50 hover:border-orange-500/30 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
              
              <Input
                value={exercise.name}
                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                placeholder="Nome esercizio"
                className="flex-1 h-8 text-sm"
              />

              <button
                onClick={() => toggleExerciseType(index)}
                className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
              >
                {exercise.duration !== undefined ? 'Tempo' : 'Reps'}
              </button>

              {exercise.duration !== undefined ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={exercise.duration}
                    onChange={(e) => handleExerciseChange(index, 'duration', parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-sm text-center"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">s</span>
                </div>
              ) : (
                <Input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-sm text-center"
                  min={0}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveExercise(index)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Exercise Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddExercise}
          className="w-full mt-2 border-dashed border-orange-500/30 text-orange-600 
                     hover:bg-orange-500/10 hover:border-orange-500/50"
        >
          <Plus className="w-4 h-4 mr-1" />
          Aggiungi Esercizio
        </Button>
      </div>

      {/* Remove Section Button */}
      {onRemove && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Rimuovi Riscaldamento
          </Button>
        </div>
      )}
    </Card>
  );
}

export default WarmupEditor;
