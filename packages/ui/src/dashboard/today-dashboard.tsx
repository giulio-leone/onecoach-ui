'use client';

import { cn } from '@giulio-leone/lib-design-system';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Utensils,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  Link2,
  Plus,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TodayDashboardProps {
  date: string;
  workout?: {
    programName: string;
    muscleGroups: string[];
    estimatedDuration: number;
    status: 'scheduled' | 'in_progress' | 'completed';
    completedInfo?: {
      actualDuration: number;
      exerciseCount: number;
      averageRPE: number;
    };
  };
  nutrition?: {
    targetCalories: number;
    targetMacros: { protein: number; carbs: number; fats: number };
    adjustedMacros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      adjustmentReason: string;
    };
    consumed: { calories: number; protein: number; carbs: number; fats: number };
  };
  onStartWorkout?: () => void;
  onLogMeal?: () => void;
  onDateChange?: (date: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function shiftDate(iso: string, delta: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
} as const;

function MacroBar({ label, consumed, target, color }: { label: string; consumed: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
          {consumed}g / {target}g
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TodayDashboard({
  date,
  workout,
  nutrition,
  onStartWorkout,
  onLogMeal,
  onDateChange,
}: TodayDashboardProps) {
  const isToday = date === new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* ── Date navigation ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onDateChange?.(shiftDate(date, -1))}
          className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {isToday ? 'Today' : formatDate(date)}
          </h2>
          {isToday && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{formatDate(date)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDateChange?.(shiftDate(date, 1))}
          className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Workout card ── */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-violet-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Workout
          </h3>
        </div>

        {workout ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-white">{workout.programName}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {workout.muscleGroups.join(' · ')}
                </p>
              </div>
              <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig[workout.status].color)}>
                {statusConfig[workout.status].label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {workout.estimatedDuration} min
              </span>
            </div>

            {workout.status === 'completed' && workout.completedInfo && (
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                <div className="text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Duration</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {workout.completedInfo.actualDuration}m
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Exercises</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {workout.completedInfo.exerciseCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Avg RPE</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {workout.completedInfo.averageRPE.toFixed(1)}
                  </p>
                </div>
              </div>
            )}

            {workout.status !== 'completed' && onStartWorkout && (
              <button
                type="button"
                onClick={onStartWorkout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                <Play className="h-4 w-4" />
                {workout.status === 'in_progress' ? 'Continue Workout' : 'Start Workout'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Rest day — no workout scheduled</p>
        )}
      </section>

      {/* ── Sync indicator ── */}
      {workout && nutrition && (
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <Link2 className="h-3.5 w-3.5" />
          <span>Nutrition adjusted based on workout</span>
        </div>
      )}

      {/* ── Nutrition card ── */}
      {nutrition && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Nutrition
            </h3>
          </div>

          {/* Calorie headline */}
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {nutrition.consumed.calories}
                <span className="text-base font-normal text-neutral-400"> / {nutrition.adjustedMacros.calories} kcal</span>
              </p>
            </div>
            <Flame className="h-5 w-5 text-orange-400" />
          </div>

          {/* Adjustment reason chip */}
          <span className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            {nutrition.adjustedMacros.adjustmentReason}
          </span>

          {/* Macro progress bars */}
          <div className="mt-4 space-y-3">
            <MacroBar
              label="Protein"
              consumed={nutrition.consumed.protein}
              target={nutrition.adjustedMacros.protein}
              color="bg-blue-500"
            />
            <MacroBar
              label="Carbs"
              consumed={nutrition.consumed.carbs}
              target={nutrition.adjustedMacros.carbs}
              color="bg-amber-500"
            />
            <MacroBar
              label="Fats"
              consumed={nutrition.consumed.fats}
              target={nutrition.adjustedMacros.fats}
              color="bg-rose-400"
            />
          </div>

          {/* Quick-log action */}
          {onLogMeal && (
            <button
              type="button"
              onClick={onLogMeal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4" />
              Log Meal
            </button>
          )}
        </section>
      )}
    </div>
  );
}
