'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Timer, Gauge, MapPin, Heart } from 'lucide-react';
import type { CardioExercise } from '@onecoach/schemas';
import { Card } from '@onecoach/ui';

export interface LiveCardioCardProps {
  cardio: CardioExercise;
  onComplete: (data: Partial<CardioExercise>) => void;
  className?: string;
}

// Machine icons mapping
const machineLabels: Record<string, string> = {
  treadmill: 'Tapis Roulant',
  bike: 'Cyclette',
  rower: 'Vogatore',
  elliptical: 'Ellittica',
  stairmaster: 'Stairmaster',
  jump_rope: 'Corda',
  other: 'Altro',
};

const intensityLabels: Record<string, { label: string; color: string }> = {
  low: { label: 'Bassa', color: 'text-emerald-500' },
  moderate: { label: 'Moderata', color: 'text-amber-500' },
  high: { label: 'Alta', color: 'text-red-500' },
  interval: { label: 'Intervalli', color: 'text-purple-500' },
};

/**
 * LiveCardioCard - Interactive cardio exercise for live workout
 *
 * Tracks duration, distance, heart rate during cardio session.
 */
export function LiveCardioCard({ cardio, onComplete, className = '' }: LiveCardioCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceDone, setDistanceDone] = useState(0);
  const [avgHeartRate, setAvgHeartRate] = useState<number | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);

  const targetDuration = cardio.duration; // in seconds

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isCompleted]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min((elapsedTime / targetDuration) * 100, 100);

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    onComplete({
      durationDone: elapsedTime,
      distanceDone: distanceDone || undefined,
      avgHeartRate: avgHeartRate,
    });
  };

  const intensityKey = cardio.intensity ?? 'moderate';
  const intensity = intensityLabels[intensityKey] ?? intensityLabels.moderate;

  return (
    <Card variant="glass" className={`overflow-hidden ${className}`} gradient={isCompleted}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-5 py-4 dark:from-blue-500/20 dark:to-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 dark:bg-blue-500/30">
              <Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase dark:bg-blue-500/20 dark:text-blue-400">
                  CARDIO
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    COMPLETATO
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{cardio.name}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {machineLabels[cardio.machine]} •{' '}
                <span className={intensity?.color}>{intensity?.label}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Timer */}
      <div className="px-5 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
            <span>Progresso</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-4 rounded-xl bg-neutral-100 px-6 py-4 dark:bg-neutral-800">
          <button
            onClick={() => setIsActive(!isActive)}
            disabled={isCompleted}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
              isCompleted
                ? 'cursor-not-allowed bg-neutral-300 text-neutral-500 dark:bg-neutral-600'
                : isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200'
            }`}
          >
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <span className="font-mono text-3xl font-bold text-neutral-900 dark:text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <p className="text-sm text-neutral-500">/ {formatTime(targetDuration)}</p>
          </div>
        </div>

        {/* Metrics Inputs */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Distance */}
          <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-500" />
              <span className="text-xs font-medium text-neutral-500 uppercase">Distanza</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={distanceDone || ''}
                onChange={(e) => setDistanceDone(parseFloat(e.target.value) || 0)}
                placeholder="0"
                disabled={isCompleted}
                className="w-full bg-transparent text-2xl font-bold text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-white"
              />
              <span className="text-sm text-neutral-500">km</span>
            </div>
            {cardio.distance && (
              <p className="mt-1 text-xs text-neutral-400">
                Target: {(cardio.distance / 1000).toFixed(1)} km
              </p>
            )}
          </div>

          {/* Heart Rate */}
          <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
            <div className="mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-neutral-500 uppercase">FC Media</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={avgHeartRate || ''}
                onChange={(e) => setAvgHeartRate(parseInt(e.target.value) || undefined)}
                placeholder="--"
                disabled={isCompleted}
                className="w-full bg-transparent text-2xl font-bold text-neutral-900 outline-none placeholder:text-neutral-300 dark:text-white"
              />
              <span className="text-sm text-neutral-500">bpm</span>
            </div>
            {cardio.targetHeartRate && (
              <p className="mt-1 text-xs text-neutral-400">Target: {cardio.targetHeartRate} bpm</p>
            )}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      {!isCompleted && (
        <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <button
            onClick={handleComplete}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/30"
          >
            Completa Cardio
          </button>
        </div>
      )}

      {/* Notes */}
      {cardio.notes && (
        <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{cardio.notes}</p>
        </div>
      )}
    </Card>
  );
}
