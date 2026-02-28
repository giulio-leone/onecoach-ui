'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  Pause,
  Play,
  FastForward,
  X,
  Dumbbell,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card, Button } from '@giulio-leone/ui';

interface RestTimerProps {
  duration: number;
  timeRemaining: number;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStart: (duration?: number) => void;
  onPause: () => void;
  onAddTime: (seconds: number) => void;
  variant?: 'card' | 'fullscreen';
  nextExerciseName?: string;
  nextSetDetails?: string;
  className?: string; // Standard prop
}

export function RestTimer({
  duration,
  timeRemaining,
  isActive,
  onComplete,
  onSkip,
  onStart,
  onPause,
  onAddTime,
  variant = 'card',
  nextExerciseName,
  nextSetDetails,
  className = '',
}: RestTimerProps) {
  const t = useTranslations('workouts');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastTickRef = useRef(duration);

  // Audio Context (Client Side Only)
  const playBeep = (type: 'tick' | 'finish') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
          .webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else {
        // Double beep
        osc.frequency.value = 1760;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error('Audio play failed', e);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Ensure duration is > 0 to avoid division by zero
  const totalDuration = duration > 0 ? duration : 1;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeRemaining / totalDuration));
  const dashOffset = circumference * (1 - progress);

  // Determine Color Status
  const getStatusColor = () => {
    if (timeRemaining <= 5) return 'text-rose-500';
    if (progress < 0.2) return 'text-amber-500';
    return 'text-indigo-500';
  };

  const getStatusGlow = () => {
    if (timeRemaining <= 5) return 'bg-rose-500/30';
    if (progress < 0.2) return 'bg-amber-500/20';
    return 'bg-indigo-500/20';
  };

  // Handle Audio Cues
  useEffect(() => {
    if (!soundEnabled || !isActive) return;

    // Play beep on every second change for the last 3 seconds
    if (
      timeRemaining <= 3 &&
      timeRemaining > 0 &&
      Math.ceil(timeRemaining) < Math.ceil(lastTickRef.current)
    ) {
      playBeep('tick');
    }

    lastTickRef.current = timeRemaining;
  }, [timeRemaining, soundEnabled, isActive]);

  // Handle Completion
  useEffect(() => {
    if (timeRemaining <= 0) {
      if (soundEnabled) playBeep('finish');
      // Immediate execution to close
      onComplete();
    }
  }, [timeRemaining, onComplete, soundEnabled]);

  const content = (
    <div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-4">
      {/* Header: Title & Sound Toggle */}
      <div className="mb-8 flex w-full items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-200">
          <Timer className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-bold tracking-widest uppercase">Recupero</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      {/* Custom Glass Progress Ring */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Dynamic Glow Effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-3xl transition-colors duration-1000',
            getStatusGlow(),
            timeRemaining <= 5 && 'animate-pulse'
          )}
        />

        <svg className="h-64 w-64 -rotate-90 transform drop-shadow-2xl">
          {/* Background Track */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Track */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-1000 ease-linear',
              getStatusColor(),
              timeRemaining <= 0 && 'opacity-0'
            )}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          {timeRemaining > 0 ? (
            <>
              <span className="text-6xl font-bold tracking-tighter text-white tabular-nums">
                {formatDuration(timeRemaining)}
              </span>
              <span
                className={cn(
                  'mt-2 text-xs font-medium tracking-wider uppercase',
                  timeRemaining <= 5 ? 'text-rose-400' : 'text-indigo-300/70'
                )}
              >
                Rimanenti
              </span>
            </>
          ) : (
            <span className="animate-in zoom-in text-6xl font-black text-white duration-300">
              {t('rest_timer.go')}
            </span>
          )}
        </div>
      </div>

      {/* Optional: Next Set Preview */}
      {(nextExerciseName || nextSetDetails) && (
        <div className="animate-in slide-in-from-bottom-4 fade-in mb-8 w-full duration-700">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium tracking-wider text-white/40 uppercase">
                {t('rest_timer.prossima_serie')}
              </span>
              {nextExerciseName && (
                <span className="line-clamp-1 text-sm font-semibold text-white">
                  {nextExerciseName}
                </span>
              )}
              {nextSetDetails && <span className="text-xs text-indigo-200">{nextSetDetails}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex w-full items-center justify-center gap-4 sm:gap-6">
        {/* Subtract Time */}
        <Button
          onClick={() => onAddTime(-10)}
          variant="glass"
          className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 p-0 text-white backdrop-blur-md hover:bg-white/10 active:scale-95"
          title={t('rest_timer.10s')}
          aria-label={t('rest_timer.10s')}
        >
          <Minus className="h-5 w-5 opacity-70" />
        </Button>

        {/* Toggle Play/Pause */}
        <Button
          onClick={isActive ? onPause : () => onStart()}
          variant="default"
          className="h-16 w-16 rounded-2xl bg-white p-0 text-indigo-950 shadow-lg shadow-indigo-500/20 hover:scale-105 hover:bg-indigo-50 active:scale-95"
          aria-label={isActive ? 'Pause' : 'Play'}
        >
          {isActive ? (
            <Pause className="h-7 w-7 fill-current" />
          ) : (
            <Play className="ml-1 h-7 w-7 fill-current" />
          )}
        </Button>

        {/* Add Time */}
        <Button
          onClick={() => onAddTime(30)}
          variant="glass"
          className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 p-0 text-white backdrop-blur-md hover:bg-white/10 active:scale-95"
          title={t('rest_timer.30s')}
          aria-label={t('rest_timer.30s')}
        >
          <Plus className="h-5 w-5 opacity-70" />
        </Button>

        {/* Skip */}
        <Button
          onClick={onSkip}
          variant="glass"
          className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 p-0 text-rose-400 backdrop-blur-md hover:border-rose-500/30 hover:bg-rose-500/10 active:scale-95"
          title="Salta"
          aria-label="Salta"
        >
          <FastForward className="h-5 w-5 opacity-70" />
        </Button>
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="animate-in fade-in fixed inset-0 z-[60] flex items-center justify-center bg-[#020408]/95 backdrop-blur-xl duration-300">
        {/* Background Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-primary-600/10 blur-[100px]" />
        </div>

        {/* Close Absolute Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkip}
          className="absolute top-6 right-6 rounded-full bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-6 w-6" />
        </Button>

        {content}
      </div>
    );
  }

  return (
    <Card variant="glass" className={`flex items-center justify-center py-10 ${className}`}>
      {content}
    </Card>
  );
}
