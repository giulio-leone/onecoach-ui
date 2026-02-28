'use client';

import { useState } from 'react';
import {
  Droplets,
  Coffee,
  GlassWater,
  Plus,
  Minus,
  X,
  Clock,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface HydrationEntry {
  time: string;
  amount: number;
  type: 'water' | 'tea' | 'coffee' | 'other';
}

export interface HydrationTrackerProps {
  dailyGoal: number; // ml
  currentIntake: number; // ml
  entries: HydrationEntry[];
  onAddWater: (amount: number, type?: string) => void;
  onRemoveEntry?: (index: number) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [250, 500, 750] as const;

const DRINK_TYPES = [
  { key: 'water' as const, label: 'Water', Icon: Droplets },
  { key: 'tea' as const, label: 'Tea', Icon: GlassWater },
  { key: 'coffee' as const, label: 'Coffee', Icon: Coffee },
  { key: 'other' as const, label: 'Other', Icon: Plus },
] as const;

function formatMl(ml: number): string {
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`;
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return 'text-sky-500 dark:text-sky-400';
  if (pct > 60) return 'text-emerald-500 dark:text-emerald-400';
  if (pct > 30) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function getStrokeColor(pct: number): string {
  if (pct >= 100) return 'stroke-sky-500';
  if (pct > 60) return 'stroke-emerald-500';
  if (pct > 30) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function drinkIcon(type: HydrationEntry['type']) {
  switch (type) {
    case 'tea':
      return <GlassWater className="h-3.5 w-3.5" />;
    case 'coffee':
      return <Coffee className="h-3.5 w-3.5" />;
    case 'other':
      return <Plus className="h-3.5 w-3.5" />;
    default:
      return <Droplets className="h-3.5 w-3.5" />;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function HydrationTracker({
  dailyGoal,
  currentIntake,
  entries,
  onAddWater,
  onRemoveEntry,
}: HydrationTrackerProps) {
  const [drinkType, setDrinkType] = useState<HydrationEntry['type']>('water');
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const pct = dailyGoal > 0 ? Math.round((currentIntake / dailyGoal) * 100) : 0;
  const clampedPct = Math.min(pct, 100);

  // SVG ring calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPct / 100) * circumference;

  const handleCustomAdd = () => {
    const val = Number(customAmount);
    if (!val || val <= 0) return;
    onAddWater(val, drinkType);
    setCustomAmount('');
    setShowCustom(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Circular Progress Ring ───────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center">
          <svg width="180" height="180" className="-rotate-90">
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              strokeWidth="10"
              className="stroke-neutral-200 dark:stroke-neutral-800"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn('transition-all duration-500', getStrokeColor(pct))}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={cn('text-2xl font-bold', getProgressColor(pct))}>
              {formatMl(currentIntake)}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              / {formatMl(dailyGoal)}
            </span>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            pct >= 100
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
              : pct > 60
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : pct > 30
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
          )}
        >
          {pct}% of daily goal
        </span>
      </div>

      {/* ── Drink Type Selector ──────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-zinc-950">
        {DRINK_TYPES.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setDrinkType(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200',
              drinkType === key
                ? 'bg-white text-sky-600 shadow-sm dark:bg-white/[0.04] dark:text-sky-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Quick-Add Buttons ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => onAddWater(ml, drinkType)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-3 transition-all duration-200',
              'hover:border-sky-300 hover:bg-sky-50/50 active:scale-95',
              'dark:border-white/[0.08] dark:bg-zinc-950 dark:hover:border-sky-700 dark:hover:bg-sky-950/30'
            )}
          >
            <Droplets className="h-5 w-5 text-sky-500" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              +{formatMl(ml)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Custom Amount ────────────────────────────────────────────────── */}
      {!showCustom ? (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-500 transition-colors',
            'hover:border-sky-400 hover:text-sky-600',
            'dark:border-white/[0.08] dark:text-neutral-400 dark:hover:border-sky-600 dark:hover:text-sky-400'
          )}
        >
          <Plus className="h-4 w-4" />
          Custom Amount
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Amount (ml)"
              className={cn(
                'w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-12 text-sm outline-none transition-colors',
                'focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20',
                'dark:border-white/[0.08] dark:bg-zinc-950 dark:text-neutral-100 dark:focus:border-sky-500'
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">ml</span>
          </div>
          <button
            type="button"
            onClick={handleCustomAdd}
            disabled={!customAmount || Number(customAmount) <= 0}
            className={cn(
              'rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200',
              'hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed',
              'dark:bg-sky-500 dark:hover:bg-sky-600'
            )}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowCustom(false)}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      {entries.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Today
          </h3>
          <div className="flex flex-col gap-1">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className={cn(
                  'group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5 transition-colors',
                  'dark:border-white/[0.08] dark:bg-zinc-950'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
                    {drinkIcon(entry.type)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {formatMl(entry.amount)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {entry.time}
                    </span>
                  </div>
                </div>
                {onRemoveEntry && (
                  <button
                    type="button"
                    onClick={() => onRemoveEntry(idx)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-neutral-400 hover:text-red-500"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
