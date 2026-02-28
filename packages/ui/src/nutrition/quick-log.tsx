'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Coffee,
  Sun,
  Utensils,
  Moon,
  Plus,
  Flame,
  Beef,
  Wheat,
  Droplets,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QuickLogFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
}

export interface QuickLogPreset {
  id: string;
  name: string;
  items: { name: string; calories: number }[];
  totalCalories: number;
}

export interface QuickLogEntry {
  type: 'food' | 'meal' | 'quick_add';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items?: { foodId: string; servings: number }[];
  quickAdd?: {
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    label?: string;
  };
}

export interface QuickLogProps {
  onLog: (entry: QuickLogEntry) => void;
  recentFoods?: QuickLogFood[];
  mealPresets?: QuickLogPreset[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const MEAL_TYPES = [
  { key: 'breakfast' as const, label: 'Breakfast', Icon: Coffee },
  { key: 'lunch' as const, label: 'Lunch', Icon: Sun },
  { key: 'dinner' as const, label: 'Dinner', Icon: Utensils },
  { key: 'snack' as const, label: 'Snack', Icon: Moon },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function QuickLog({ onLog, recentFoods = [], mealPresets = [] }: QuickLogProps) {
  const [mealType, setMealType] = useState<QuickLogEntry['mealType']>('breakfast');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickCal, setQuickCal] = useState('');
  const [quickProtein, setQuickProtein] = useState('');
  const [quickCarbs, setQuickCarbs] = useState('');
  const [quickFats, setQuickFats] = useState('');
  const [quickLabel, setQuickLabel] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return recentFoods;
    const q = search.toLowerCase();
    return recentFoods.filter((f) => f.name.toLowerCase().includes(q));
  }, [search, recentFoods]);

  // Running total from selected foods
  const totals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    selected.forEach((servings, id) => {
      const food = recentFoods.find((f) => f.id === id);
      if (food) {
        calories += food.calories * servings;
        protein += food.protein * servings;
        carbs += food.carbs * servings;
        fats += food.fats * servings;
      }
    });
    return { calories, protein, carbs, fats };
  }, [selected, recentFoods]);

  const toggleFood = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  };

  const handleSubmitFoods = () => {
    if (selected.size === 0) return;
    const items = Array.from(selected.entries()).map(([foodId, servings]) => ({ foodId, servings }));
    onLog({ type: 'food', mealType, items });
    setSelected(new Map());
  };

  const handleLogPreset = (preset: QuickLogPreset) => {
    onLog({
      type: 'meal',
      mealType,
      quickAdd: { calories: preset.totalCalories, label: preset.name },
    });
  };

  const handleQuickAdd = () => {
    const cal = Number(quickCal);
    if (!cal || cal <= 0) return;
    onLog({
      type: 'quick_add',
      mealType,
      quickAdd: {
        calories: cal,
        protein: Number(quickProtein) || undefined,
        carbs: Number(quickCarbs) || undefined,
        fats: Number(quickFats) || undefined,
        label: quickLabel.trim() || undefined,
      },
    });
    setQuickCal('');
    setQuickProtein('');
    setQuickCarbs('');
    setQuickFats('');
    setQuickLabel('');
    setShowQuickAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Meal Type Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
        {MEAL_TYPES.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMealType(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200',
              mealType === key
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-neutral-800 dark:text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Search Bar ───────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search foods…"
          className={cn(
            'w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors',
            'placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20',
            'dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-primary-500'
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Recent Foods Grid ────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Recent Foods
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered.map((food) => {
              const isSelected = selected.has(food.id);
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => toggleFood(food.id)}
                  className={cn(
                    'relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200',
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
                  )}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {food.name}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                      <Flame className="h-3 w-3" />
                      {food.calories}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      <Beef className="h-3 w-3" />
                      {food.protein}g
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Meal Presets ──────────────────────────────────────────────────── */}
      {mealPresets.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Meal Presets
          </h3>
          <div className="flex flex-col gap-2">
            {mealPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLogPreset(preset)}
                className={cn(
                  'flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left transition-all duration-200',
                  'hover:border-primary-300 hover:bg-emerald-50/50',
                  'dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-700 dark:hover:bg-emerald-950/30'
                )}
              >
                <div>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {preset.name}
                  </span>
                  <span className="ml-2 text-xs text-neutral-400">
                    {preset.items.length} item{preset.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  <Flame className="h-3 w-3" />
                  {preset.totalCalories} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Add ────────────────────────────────────────────────────── */}
      {!showQuickAdd ? (
        <button
          type="button"
          onClick={() => setShowQuickAdd(true)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-500 transition-colors',
            'hover:border-primary-400 hover:text-emerald-600',
            'dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-primary-600 dark:hover:text-emerald-400'
          )}
        >
          <Plus className="h-4 w-4" />
          Quick Add Calories
        </button>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Quick Add</h3>
            <button type="button" onClick={() => setShowQuickAdd(false)} className="text-neutral-400 hover:text-neutral-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="text"
              value={quickLabel}
              onChange={(e) => setQuickLabel(e.target.value)}
              placeholder="Label (optional)"
              className="col-span-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              type="number"
              inputMode="numeric"
              value={quickCal}
              onChange={(e) => setQuickCal(e.target.value)}
              placeholder="Calories *"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              type="number"
              inputMode="numeric"
              value={quickProtein}
              onChange={(e) => setQuickProtein(e.target.value)}
              placeholder="Protein (g)"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              type="number"
              inputMode="numeric"
              value={quickCarbs}
              onChange={(e) => setQuickCarbs(e.target.value)}
              placeholder="Carbs (g)"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <input
              type="number"
              inputMode="numeric"
              value={quickFats}
              onChange={(e) => setQuickFats(e.target.value)}
              placeholder="Fats (g)"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!quickCal || Number(quickCal) <= 0}
            className={cn(
              'mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
              'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed',
              'dark:bg-emerald-500 dark:hover:bg-emerald-600'
            )}
          >
            Add
          </button>
        </div>
      )}

      {/* ── Running Total ────────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              {Math.round(totals.calories)} kcal
            </div>
            <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
              <Beef className="h-3.5 w-3.5" />
              {Math.round(totals.protein)}g
            </div>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Wheat className="h-3.5 w-3.5" />
              {Math.round(totals.carbs)}g
            </div>
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <Droplets className="h-3.5 w-3.5" />
              {Math.round(totals.fats)}g
            </div>
          </div>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <button
          type="button"
          onClick={handleSubmitFoods}
          className={cn(
            'w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-200',
            'bg-emerald-600 text-white hover:bg-emerald-700',
            'dark:bg-emerald-500 dark:hover:bg-emerald-600'
          )}
        >
          Log {MEAL_TYPES.find((m) => m.key === mealType)?.label}
        </button>
      )}
    </div>
  );
}
