'use client';

import { useState } from 'react';
import { Card } from '../../card';
import { Button } from '../../button';
import { Input } from '../../input';
import { Badge } from '../../badge';
import { Trash2, Clock, Activity, Route, Heart, Zap } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { motion } from 'framer-motion';
import type { CardioExercise, CardioMachine, CardioIntensity } from '@giulio-leone/schemas';

// ============================================================================
// Types for Builder
// ============================================================================

interface CardioEditorProps {
  cardio?: Partial<CardioExercise>;
  onChange: (cardio: Partial<CardioExercise>) => void;
  onRemove?: () => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const MACHINE_OPTIONS: { value: CardioMachine; label: string; icon: string }[] = [
  { value: 'treadmill', label: 'Tapis Roulant', icon: '🏃' },
  { value: 'bike', label: 'Cyclette', icon: '🚴' },
  { value: 'rower', label: 'Vogatore', icon: '🚣' },
  { value: 'elliptical', label: 'Ellittica', icon: '⭕' },
  { value: 'stairmaster', label: 'Stairmaster', icon: '🪜' },
  { value: 'jump_rope', label: 'Corda', icon: '🤸' },
  { value: 'other', label: 'Altro', icon: '💪' },
];

const INTENSITY_OPTIONS: { value: CardioIntensity; label: string; color: string }[] = [
  { value: 'low', label: 'Bassa', color: 'bg-green-500' },
  { value: 'moderate', label: 'Moderata', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'interval', label: 'Intervalli', color: 'bg-red-500' },
];

// ============================================================================
// CardioEditor Component
// ============================================================================

export function CardioEditor({ cardio, onChange, onRemove, className }: CardioEditorProps) {
  const [machine, setMachine] = useState<CardioMachine>(cardio?.machine ?? 'treadmill');
  const [duration, setDuration] = useState(cardio?.duration ?? 1200);
  const [intensity, setIntensity] = useState<CardioIntensity>(cardio?.intensity ?? 'moderate');
  const [name, setName] = useState(cardio?.name ?? 'Cardio Session');
  const [targetHR, setTargetHR] = useState(cardio?.targetHeartRate);
  const [distance, setDistance] = useState(cardio?.distance);
  const [speed, setSpeed] = useState(cardio?.speed);
  const [incline, setIncline] = useState(cardio?.incline);
  const [notes, setNotes] = useState(cardio?.notes ?? '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const durationMinutes = Math.round(duration / 60);

  const emitChange = (updates?: Partial<CardioExercise>) => {
    onChange({
      id: cardio?.id ?? `cardio_${Date.now()}`,
      type: 'cardio',
      name,
      machine,
      duration,
      intensity,
      targetHeartRate: targetHR,
      distance,
      speed,
      incline,
      notes: notes || undefined,
      ...updates,
    });
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 md:p-6',
        'border-cyan-500/30 transition-all hover:border-cyan-500/50',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-500/20 p-2">
            <Activity className="h-5 w-5 text-cyan-500" />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                emitChange({ name: e.target.value });
              }}
              className="h-auto border-none bg-transparent p-0 text-lg font-semibold focus:ring-0"
              placeholder="Nome sessione cardio"
            />
          </div>
        </div>
        <Badge variant="outline" className="bg-cyan-500/20 text-cyan-600">
          <Clock className="mr-1 h-3 w-3" />
          {durationMinutes} min
        </Badge>
      </div>

      {/* Machine Selector */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-2 block text-sm">Macchina</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {MACHINE_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMachine(option.value);
                emitChange({ machine: option.value });
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 p-2 transition-all',
                machine === option.value
                  ? 'border-cyan-500 bg-cyan-500/20 shadow-md'
                  : 'border-border/50 hover:border-cyan-500/30'
              )}
            >
              <span className="mb-1 text-xl">{option.icon}</span>
              <span className="text-center text-[10px] leading-tight">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Duration Slider */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-2 block text-sm">
          Durata: <span className="text-foreground font-medium">{durationMinutes} minuti</span>
        </label>
        <input
          type="range"
          min={300}
          max={3600}
          step={60}
          value={duration}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setDuration(val);
            emitChange({ duration: val });
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-cyan-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-md"
        />
        <div className="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>5 min</span>
          <span>30 min</span>
          <span>60 min</span>
        </div>
      </div>

      {/* Intensity Selector */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-2 block text-sm">Intensità</label>
        <div className="grid grid-cols-4 gap-2">
          {INTENSITY_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIntensity(option.value);
                emitChange({ intensity: option.value });
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg border-2 p-2 transition-all',
                intensity === option.value
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-sm'
                  : 'border-border/50 hover:border-cyan-500/30'
              )}
            >
              <div className={cn('h-2 w-2 rounded-full', option.color)} />
              <span className="text-xs font-medium">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-muted-foreground mb-3 w-full"
      >
        <Zap className="mr-1 h-4 w-4" />
        {showAdvanced ? 'Nascondi' : 'Mostra'} impostazioni avanzate
      </Button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-background/50 border-border/50 mb-4 grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-4"
        >
          <div>
            <label className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
              <Heart className="h-3 w-3" /> FC Target
            </label>
            <Input
              type="number"
              value={targetHR ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : undefined;
                setTargetHR(val);
                emitChange({ targetHeartRate: val });
              }}
              placeholder="bpm"
              className="h-8 text-sm"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
              <Route className="h-3 w-3" /> Distanza
            </label>
            <Input
              type="number"
              value={distance ? distance / 1000 : ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) * 1000 : undefined;
                setDistance(val);
                emitChange({ distance: val });
              }}
              placeholder="km"
              className="h-8 text-sm"
              step={0.5}
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs">Velocità</label>
            <Input
              type="number"
              value={speed ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                setSpeed(val);
                emitChange({ speed: val });
              }}
              placeholder="km/h"
              className="h-8 text-sm"
              step={0.5}
            />
          </div>

          {machine === 'treadmill' && (
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">Inclinazione</label>
              <Input
                type="number"
                value={incline ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                  setIncline(val);
                  emitChange({ incline: val });
                }}
                placeholder="%"
                className="h-8 text-sm"
                step={0.5}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Notes */}
      <div className="mb-4">
        <Input
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            emitChange({ notes: e.target.value });
          }}
          placeholder="Note (es. intervalli 30s sprint / 60s camminata)"
          className="text-sm"
        />
      </div>

      {onRemove && (
        <div className="border-border/50 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive w-full"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Rimuovi Cardio
          </Button>
        </div>
      )}
    </Card>
  );
}

export default CardioEditor;
