'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AnalyticsFilters {
  dateRange: { start: string; end: string };
  period: '7d' | '30d' | '90d' | '1y' | 'custom';
  muscleGroups: string[];
  exercises: string[];
  metrics: ('weight' | 'volume' | 'reps' | '1rm' | 'rpe')[];
  groupBy: 'day' | 'week' | 'month';
}

export interface AnalyticsFiltersProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
  availableMuscleGroups?: string[];
  availableExercises?: { id: string; name: string }[];
  initialFilters?: Partial<AnalyticsFilters>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: AnalyticsFilters['period']; label: string }[] = [
  { value: '7d', label: '7 giorni' },
  { value: '30d', label: '30 giorni' },
  { value: '90d', label: '90 giorni' },
  { value: '1y', label: '1 anno' },
  { value: 'custom', label: 'Custom' },
];

const METRIC_OPTIONS: { value: AnalyticsFilters['metrics'][number]; label: string }[] = [
  { value: 'weight', label: 'Peso' },
  { value: 'volume', label: 'Volume' },
  { value: 'reps', label: 'Ripetizioni' },
  { value: '1rm', label: '1RM' },
  { value: 'rpe', label: 'RPE' },
];

const GROUP_OPTIONS: { value: AnalyticsFilters['groupBy']; label: string }[] = [
  { value: 'day', label: 'Giorno' },
  { value: 'week', label: 'Settimana' },
  { value: 'month', label: 'Mese' },
];

function defaultFilters(initial?: Partial<AnalyticsFilters>): AnalyticsFilters {
  return {
    dateRange: initial?.dateRange ?? { start: '', end: '' },
    period: initial?.period ?? '30d',
    muscleGroups: initial?.muscleGroups ?? [],
    exercises: initial?.exercises ?? [],
    metrics: initial?.metrics ?? ['volume', 'weight'],
    groupBy: initial?.groupBy ?? 'week',
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export function AdvancedFilters({
  onFilterChange,
  availableMuscleGroups = [],
  availableExercises = [],
  initialFilters,
}: AnalyticsFiltersProps) {
  const [filters, setFilters] = useState<AnalyticsFilters>(() =>
    defaultFilters(initialFilters)
  );
  const [expanded, setExpanded] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  const update = useCallback(
    (patch: Partial<AnalyticsFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
        onFilterChange(next);
        return next;
      });
    },
    [onFilterChange]
  );

  const toggleArrayItem = useCallback(
    <K extends 'muscleGroups' | 'exercises' | 'metrics'>(
      key: K,
      value: AnalyticsFilters[K][number]
    ) => {
      setFilters((prev) => {
        const arr = prev[key] as string[];
        const next = arr.includes(value as string)
          ? arr.filter((v) => v !== value)
          : [...arr, value as string];
        const updated = { ...prev, [key]: next } as AnalyticsFilters;
        onFilterChange(updated);
        return updated;
      });
    },
    [onFilterChange]
  );

  const resetFilters = useCallback(() => {
    const reset = defaultFilters();
    setFilters(reset);
    setExerciseSearch('');
    onFilterChange(reset);
  }, [onFilterChange]);

  const filteredExercises = useMemo(() => {
    if (!exerciseSearch) return availableExercises;
    const q = exerciseSearch.toLowerCase();
    return availableExercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [availableExercises, exerciseSearch]);

  const activeCount =
    filters.muscleGroups.length +
    filters.exercises.length +
    (filters.period !== '30d' ? 1 : 0);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/70 shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-neutral-900/60">
      {/* ── Compact header ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <Filter className="h-4 w-4" />
          <span>Filtri</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
              {activeCount}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        )}
      </button>

      {/* ── Period presets (always visible) ─────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-4 pb-4 pt-3 dark:border-neutral-800">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => update({ period: opt.value })}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              filters.period === opt.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Custom date range (shown when period === 'custom') ────── */}
      {filters.period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 px-4 pb-4 pt-3 dark:border-neutral-800">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) =>
              update({ dateRange: { ...filters.dateRange, start: e.target.value } })
            }
            className="rounded-lg border border-neutral-200 bg-transparent px-3 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          />
          <span className="text-xs text-neutral-400">—</span>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) =>
              update({ dateRange: { ...filters.dateRange, end: e.target.value } })
            }
            className="rounded-lg border border-neutral-200 bg-transparent px-3 py-1.5 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          />
        </div>
      )}

      {/* ── Expanded filters ────────────────────────────────────────── */}
      {expanded && (
        <div className="space-y-5 border-t border-neutral-100 px-4 pb-5 pt-4 dark:border-neutral-800">
          {/* Muscle groups */}
          {availableMuscleGroups.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                Gruppi muscolari
              </p>
              <div className="flex flex-wrap gap-2">
                {availableMuscleGroups.map((mg) => (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => toggleArrayItem('muscleGroups', mg)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      filters.muscleGroups.includes(mg)
                        ? 'bg-violet-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    )}
                  >
                    {mg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {availableExercises.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                Esercizi
              </p>
              <div className="relative mb-2">
                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="Cerca esercizio…"
                  className="w-full rounded-lg border border-neutral-200 bg-transparent py-1.5 pl-8 pr-3 text-xs text-neutral-700 placeholder:text-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
                />
              </div>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => toggleArrayItem('exercises', ex.id)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      filters.exercises.includes(ex.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    )}
                  >
                    {ex.name}
                    {filters.exercises.includes(ex.id) && <X className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Metriche
            </p>
            <div className="flex flex-wrap gap-2">
              {METRIC_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleArrayItem('metrics', m.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    filters.metrics.includes(m.value)
                      ? 'bg-amber-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group by */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Raggruppa per
            </p>
            <div className="flex gap-2">
              {GROUP_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => update({ groupBy: g.value })}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    filters.groupBy === g.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resetta filtri
          </button>
        </div>
      )}
    </div>
  );
}
