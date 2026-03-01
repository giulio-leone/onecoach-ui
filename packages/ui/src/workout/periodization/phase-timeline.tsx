'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card, Badge } from '@giulio-leone/ui';

// --- Local types mirroring domain types (UI decoupled) ---

export type PhaseName = 'accumulation' | 'intensification' | 'realization' | 'deload';

export interface PhaseConfig {
  phase: PhaseName;
  durationWeeks: number;
  volumeMultiplier: number;
  intensityMultiplier: number;
  rpeRange: [number, number];
  focusDescription?: string;
}

export interface MesocycleConfig {
  id: string;
  name: string;
  model: string;
  phases: PhaseConfig[];
  totalWeeks: number;
  deloadFrequency: number;
  autoDeloadEnabled: boolean;
  goal: string;
}

// --- Phase color mapping ---

const PHASE_STYLES: Record<
  PhaseName,
  { bg: string; border: string; text: string; indicator: string; badgeVariant: 'info' | 'warning' | 'error' | 'success' }
> = {
  accumulation: {
    bg: 'bg-primary-500/10 dark:bg-primary-500/20',
    border: 'border-primary-500/30',
    text: 'text-primary-700 dark:text-primary-300',
    indicator: 'bg-primary-500',
    badgeVariant: 'info',
  },
  intensification: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-700 dark:text-orange-300',
    indicator: 'bg-orange-500',
    badgeVariant: 'warning',
  },
  realization: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-700 dark:text-red-300',
    indicator: 'bg-red-500',
    badgeVariant: 'error',
  },
  deload: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    indicator: 'bg-emerald-500',
    badgeVariant: 'success',
  },
};

// --- Helpers ---

function getWeekRangeForPhase(phases: PhaseConfig[], phaseIndex: number): [number, number] {
  let start = 1;
  for (let i = 0; i < phaseIndex; i++) {
    start += (phases[i]?.durationWeeks ?? 0);
  }
  return [start, start + (phases[phaseIndex]?.durationWeeks ?? 0) - 1];
}

// --- Component ---

export interface PhaseTimelineProps {
  mesocycle: MesocycleConfig;
  currentWeek?: number;
  className?: string;
}

export function PhaseTimeline({ mesocycle, currentWeek, className }: PhaseTimelineProps) {
  const t = useTranslations();

  const phasesWithRange = useMemo(
    () =>
      mesocycle.phases.map((phase, idx) => ({
        ...phase,
        range: getWeekRangeForPhase(mesocycle.phases, idx),
      })),
    [mesocycle.phases]
  );

  const currentPhaseIndex = useMemo(() => {
    if (currentWeek == null) return -1;
    return phasesWithRange.findIndex(
      (p) => currentWeek >= p.range[0] && currentWeek <= p.range[1]
    );
  }, [currentWeek, phasesWithRange]);

  return (
    <Card variant="glass" className={cn('p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          {t('workout.periodization.phaseTimeline', { fallback: 'Phase Timeline' })}
        </h3>
        {currentWeek != null && (
          <Badge variant="info" size="sm">
            {t('workout.periodization.week', { fallback: 'Week' })} {currentWeek} / {mesocycle.totalWeeks}
          </Badge>
        )}
      </div>

      {/* Horizontal timeline (hidden on mobile) */}
      <div className="hidden sm:block">
        <div className="flex gap-1">
          {phasesWithRange.map((phase, idx) => {
            const widthPercent = (phase.durationWeeks / mesocycle.totalWeeks) * 100;
            const isCurrent = idx === currentPhaseIndex;
            const style = PHASE_STYLES[phase.phase];

            return (
              <div
                key={`${phase.phase}-${idx}`}
                className="relative flex flex-col"
                style={{ width: `${widthPercent}%`, minWidth: '60px' }}
              >
                {/* Phase block */}
                <div
                  className={cn(
                    'relative rounded-lg border p-3 transition-all',
                    style.bg,
                    style.border,
                    isCurrent && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#09090b]',
                    isCurrent && phase.phase === 'accumulation' && 'ring-primary-500',
                    isCurrent && phase.phase === 'intensification' && 'ring-orange-500',
                    isCurrent && phase.phase === 'realization' && 'ring-red-500',
                    isCurrent && phase.phase === 'deload' && 'ring-emerald-500'
                  )}
                >
                  {/* Current week indicator */}
                  {isCurrent && currentWeek != null && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <ChevronDown className={cn('h-4 w-4', style.text)} />
                    </div>
                  )}

                  <p className={cn('text-xs font-bold capitalize', style.text)}>
                    {phase.phase}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                    {phase.durationWeeks}w &middot; W{phase.range[0]}–{phase.range[1]}
                  </p>

                  {/* Multipliers */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                      <TrendingUp className="h-3 w-3" />
                      {(phase.volumeMultiplier * 100).toFixed(0)}%
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                      <TrendingDown className="h-3 w-3" />
                      {(phase.intensityMultiplier * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Week markers */}
        <div className="mt-2 flex gap-1">
          {phasesWithRange.map((phase, idx) => {
            const widthPercent = (phase.durationWeeks / mesocycle.totalWeeks) * 100;
            return (
              <div
                key={`marker-${idx}`}
                className="flex justify-between"
                style={{ width: `${widthPercent}%`, minWidth: '60px' }}
              >
                <span className="text-[9px] text-neutral-400">{phase.range[0]}</span>
                {idx === phasesWithRange.length - 1 && (
                  <span className="text-[9px] text-neutral-400">{phase.range[1]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical layout (mobile) */}
      <div className="space-y-3 sm:hidden">
        {phasesWithRange.map((phase, idx) => {
          const isCurrent = idx === currentPhaseIndex;
          const style = PHASE_STYLES[phase.phase];

          return (
            <div
              key={`mobile-${phase.phase}-${idx}`}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-all',
                style.bg,
                style.border,
                isCurrent && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#09090b]',
                isCurrent && phase.phase === 'accumulation' && 'ring-primary-500',
                isCurrent && phase.phase === 'intensification' && 'ring-orange-500',
                isCurrent && phase.phase === 'realization' && 'ring-red-500',
                isCurrent && phase.phase === 'deload' && 'ring-emerald-500'
              )}
            >
              {/* Phase indicator dot */}
              <div className={cn('h-3 w-3 flex-shrink-0 rounded-full', style.indicator)} />

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={cn('text-sm font-bold capitalize', style.text)}>
                    {phase.phase}
                  </p>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    W{phase.range[0]}–{phase.range[1]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {phase.durationWeeks} {t('workout.periodization.weeks', { fallback: 'weeks' })}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Vol {(phase.volumeMultiplier * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Int {(phase.intensityMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
                {phase.focusDescription && (
                  <p className="mt-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                    {phase.focusDescription}
                  </p>
                )}
              </div>

              {isCurrent && (
                <Badge variant={style.badgeVariant} size="sm">
                  {t('workout.periodization.current', { fallback: 'Current' })}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
