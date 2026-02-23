'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Pause, Play, Square } from 'lucide-react';
import { Button, Heading, Text } from '@giulio-leone/ui';

interface LiveWorkoutHeaderProps {
  programName?: string;
  weekNumber?: number;
  dayNumber?: number;
  duration: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onBack: () => void;
}

export function LiveWorkoutHeader({
  programName,
  weekNumber,
  dayNumber,
  duration,
  isPaused,
  onPause,
  onResume,
  onStop,
  onBack,
}: LiveWorkoutHeaderProps) {
  const t = useTranslations('workouts');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sessionLabel =
    weekNumber !== undefined && dayNumber !== undefined
      ? `W${weekNumber} • Day ${dayNumber}`
      : weekNumber !== undefined
        ? `Week ${weekNumber}`
        : dayNumber !== undefined
          ? `Day ${dayNumber}`
          : null;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div>
            <Heading level={1} size="xl" weight="bold" className="leading-tight text-white">
              {programName || t('common.workout') || 'Training Session'}
            </Heading>
            {sessionLabel && (
              <Text size="xs" className="text-neutral-500">
                {sessionLabel}
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Right: Timer + Controls */}
      <div className="flex items-center gap-2">
        {/* Timer Display - Hidden on mobile for cleaner look, or show smaller */}
        <div
          className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs font-semibold sm:flex ${
            isPaused ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </span>
          {formatTime(duration)}
        </div>

        {/* Pause/Resume Button */}
        <Button
          size="icon"
          variant="ghost"
          className={`h-9 w-9 rounded-full transition-colors ${
            isPaused
              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
          }`}
          onClick={isPaused ? onResume : onPause}
        >
          {isPaused ? (
            <Play className="h-4 w-4 fill-current" />
          ) : (
            <Pause className="h-4 w-4 fill-current" />
          )}
        </Button>

        {/* Stop Button */}
        <Button
          size="icon"
          className="h-9 w-9 rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500"
          onClick={onStop}
        >
          <Square className="h-4 w-4 fill-current" />
        </Button>
      </div>
    </div>
  );
}
