'use client';

import { useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  ArrowDown,
  ArrowUp,
  Minus,
  Dumbbell,
  Flame,
  Gauge,
  Trophy,
  Scale,
  Beef,
  Wheat,
  Droplets,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PeriodData {
  label: string;
  dateRange: { start: string; end: string };
  metrics: {
    totalWorkouts: number;
    totalVolume: number;
    averageRPE: number | null;
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    bodyWeight: { start: number; end: number } | null;
    prsAchieved: number;
  };
}

export interface PeriodComparisonProps {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  periodLabel?: { current: string; previous: string };
}

// ── Helpers ────────────────────────────────────────────────────────────────

interface MetricDef {
  key: string;
  label: string;
  current: number | null;
  previous: number | null;
  format: (v: number) => string;
  /** true = higher is better, false = lower is better */
  higherIsBetter: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function pct(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

function DeltaBadge({
  current,
  previous,
  higherIsBetter,
  format,
}: {
  current: number | null;
  previous: number | null;
  higherIsBetter: boolean;
  format: (v: number) => string;
}) {
  if (current === null || previous === null) {
    return <span className="text-xs text-neutral-400">—</span>;
  }
  const diff = current - previous;
  const pctVal = pct(current, previous);
  const isPositive = diff > 0;
  const isImproved = higherIsBetter ? isPositive : !isPositive;
  const isNeutral = diff === 0;

  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
        isNeutral && 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
        !isNeutral &&
          isImproved &&
          'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        !isNeutral &&
          !isImproved &&
          'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
      )}
    >
      <Icon className="h-3 w-3" />
      {format(Math.abs(diff))} ({pctVal >= 0 ? '+' : ''}
      {pctVal.toFixed(1)}%)
    </span>
  );
}

function MetricRow({ m }: { m: MetricDef }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
      <m.icon className="h-4 w-4 shrink-0 text-neutral-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {m.label}
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-sm font-bold text-neutral-900 dark:text-white">
            {m.current !== null ? m.format(m.current) : '—'}
          </span>
          <span className="text-xs text-neutral-400">
            vs {m.previous !== null ? m.format(m.previous) : '—'}
          </span>
        </div>
      </div>
      <DeltaBadge
        current={m.current}
        previous={m.previous}
        higherIsBetter={m.higherIsBetter}
        format={m.format}
      />
    </div>
  );
}

// ── Summary ────────────────────────────────────────────────────────────────

function SummaryCard({
  metrics,
}: {
  metrics: MetricDef[];
}) {
  const highlights = metrics
    .filter((m) => m.current !== null && m.previous !== null)
    .map((m) => {
      const p = pct(m.current!, m.previous!);
      return { label: m.label, pct: p, improved: m.higherIsBetter ? p > 0 : p < 0 };
    })
    .filter((h) => h.pct !== 0)
    .slice(0, 3);

  if (highlights.length === 0) return null;

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/5">
      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
        Riepilogo:{' '}
        {highlights.map((h, i) => (
          <span key={h.label}>
            {i > 0 && ', '}
            <span className={h.improved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
              {h.pct >= 0 ? '+' : ''}
              {h.pct.toFixed(0)}% {h.label.toLowerCase()}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}

// ── Bar visual ─────────────────────────────────────────────────────────────

function ComparisonBar({
  current,
  previous,
  label,
  format,
}: {
  current: number;
  previous: number;
  label: string;
  format: (v: number) => string;
}) {
  const max = Math.max(current, previous, 1);
  const curW = (current / max) * 100;
  const prevW = (previous / max) * 100;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${curW}%` }}
          />
        </div>
        <span className="w-16 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {format(current)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-neutral-400 transition-all dark:bg-neutral-600"
            style={{ width: `${prevW}%` }}
          />
        </div>
        <span className="w-16 text-right text-xs text-neutral-400">
          {format(previous)}
        </span>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function PeriodComparison({
  currentPeriod,
  previousPeriod,
  periodLabel,
}: PeriodComparisonProps) {
  const cur = currentPeriod.metrics;
  const prev = previousPeriod.metrics;

  const fmt = (v: number) => v.toLocaleString('it-IT');
  const fmtDec = (v: number) => v.toFixed(1);
  const fmtKg = (v: number) => `${v.toFixed(1)} kg`;

  const metrics: MetricDef[] = useMemo(
    () => [
      { key: 'workouts', label: 'Allenamenti', current: cur.totalWorkouts, previous: prev.totalWorkouts, format: fmt, higherIsBetter: true, icon: Dumbbell },
      { key: 'volume', label: 'Volume totale', current: cur.totalVolume, previous: prev.totalVolume, format: fmt, higherIsBetter: true, icon: Flame },
      { key: 'rpe', label: 'RPE medio', current: cur.averageRPE, previous: prev.averageRPE, format: fmtDec, higherIsBetter: false, icon: Gauge },
      { key: 'calories', label: 'Calorie medie', current: cur.avgCalories, previous: prev.avgCalories, format: fmt, higherIsBetter: true, icon: Flame },
      { key: 'protein', label: 'Proteine medie (g)', current: cur.avgProtein, previous: prev.avgProtein, format: fmtDec, higherIsBetter: true, icon: Beef },
      { key: 'carbs', label: 'Carboidrati medi (g)', current: cur.avgCarbs, previous: prev.avgCarbs, format: fmtDec, higherIsBetter: true, icon: Wheat },
      { key: 'fats', label: 'Grassi medi (g)', current: cur.avgFats, previous: prev.avgFats, format: fmtDec, higherIsBetter: true, icon: Droplets },
      {
        key: 'bodyweight',
        label: 'Peso corporeo',
        current: cur.bodyWeight?.end ?? null,
        previous: prev.bodyWeight?.end ?? null,
        format: fmtKg,
        higherIsBetter: false,
        icon: Scale,
      },
      { key: 'prs', label: 'PR raggiunti', current: cur.prsAchieved, previous: prev.prsAchieved, format: fmt, higherIsBetter: true, icon: Trophy },
    ],
    [cur, prev]
  );

  const curLabel = periodLabel?.current ?? currentPeriod.label;
  const prevLabel = periodLabel?.previous ?? previousPeriod.label;

  return (
    <div className="space-y-4">
      {/* Period labels */}
      <div className="flex items-center gap-3 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {curLabel}
        </span>
        <span className="text-neutral-400">vs</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          {prevLabel}
        </span>
      </div>

      {/* Summary */}
      <SummaryCard metrics={metrics} />

      {/* Bar comparisons for key metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics
          .filter((m) => m.current !== null && m.previous !== null)
          .slice(0, 4)
          .map((m) => (
            <ComparisonBar
              key={m.key}
              current={m.current!}
              previous={m.previous!}
              label={m.label}
              format={m.format}
            />
          ))}
      </div>

      {/* Detail rows */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <MetricRow key={m.key} m={m} />
        ))}
      </div>
    </div>
  );
}
