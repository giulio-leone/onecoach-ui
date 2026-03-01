'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Droplets } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { DailyMacroSummary } from './daily-macro-summary';
import type { MacroTarget } from './daily-macro-summary';
import { WeeklySummary } from './weekly-summary';
import type { DayData } from './weekly-summary';
import { MealCard } from './meal-card';
import type { DiaryMeal } from './meal-card';

export interface NutritionDiaryProps {
  /** Meals for the selected day */
  meals: DiaryMeal[];
  /** Target macros for the day */
  target: MacroTarget;
  /** Selected date ISO string */
  selectedDate: string;
  /** Weekly data for the chart */
  weekData?: DayData[];
  /** Water intake in ml */
  waterIntake?: number;
  /** Water target in ml */
  waterTarget?: number;
  /** Callbacks */
  onDateChange: (date: string) => void;
  onMealStatusChange: (mealId: string, status: DiaryMeal['status']) => void;
  onAddFood?: (mealId: string) => void;
  onLogWater?: (ml: number) => void;
  className?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function NutritionDiary({
  meals,
  target,
  selectedDate,
  weekData,
  waterIntake = 0,
  waterTarget = 2500,
  onDateChange,
  onMealStatusChange,
  onAddFood,
  onLogWater,
  className,
}: NutritionDiaryProps) {
  const [showWeekly, setShowWeekly] = useState(false);

  const consumed = useMemo<MacroTarget>(() => {
    const activeMeals = meals.filter((m) => m.status !== 'skipped');
    return {
      calories: activeMeals.reduce((s, m) => s + m.foods.reduce((fs, f) => fs + f.macros.calories, 0), 0),
      protein: activeMeals.reduce((s, m) => s + m.foods.reduce((fs, f) => fs + f.macros.protein, 0), 0),
      carbs: activeMeals.reduce((s, m) => s + m.foods.reduce((fs, f) => fs + f.macros.carbs, 0), 0),
      fats: activeMeals.reduce((s, m) => s + m.foods.reduce((fs, f) => fs + f.macros.fats, 0), 0),
    };
  }, [meals]);

  const adherence = useMemo(() => {
    const doneMeals = meals.filter((m) => m.status === 'done').length;
    const totalMeals = meals.length;
    return totalMeals > 0 ? Math.round((doneMeals / totalMeals) * 100) : 0;
  }, [meals]);

  const waterPct = waterTarget > 0 ? Math.min((waterIntake / waterTarget) * 100, 100) : 0;

  const handlePrevDay = useCallback(() => onDateChange(addDays(selectedDate, -1)), [selectedDate, onDateChange]);
  const handleNextDay = useCallback(() => onDateChange(addDays(selectedDate, 1)), [selectedDate, onDateChange]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 backdrop-blur-md">
        <button
          onClick={handlePrevDay}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>

        <button className="flex items-center gap-2 text-white">
          <Calendar size={16} className="text-primary-400" />
          <span className="text-sm font-semibold">{formatDate(selectedDate)}</span>
        </button>

        <button
          onClick={handleNextDay}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Macro Summary */}
      <DailyMacroSummary consumed={consumed} target={target} />

      {/* Adherence + Water row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Adherence */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 backdrop-blur-md">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs font-medium text-neutral-400">Adherence</span>
          </div>
          <div className="text-lg font-bold text-white">{adherence}%</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${adherence}%` }}
            />
          </div>
        </div>

        {/* Water */}
        <button
          onClick={() => onLogWater?.(250)}
          className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 text-left backdrop-blur-md transition-colors hover:border-blue-800/50"
        >
          <div className="mb-1 flex items-center gap-2">
            <Droplets size={14} className="text-blue-400" />
            <span className="text-xs font-medium text-neutral-400">Water</span>
          </div>
          <div className="text-lg font-bold text-white">
            {(waterIntake / 1000).toFixed(1)}
            <span className="text-xs text-neutral-500">/{(waterTarget / 1000).toFixed(1)}L</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            />
          </div>
        </button>
      </div>

      {/* Weekly toggle */}
      {weekData && weekData.length > 0 && (
        <>
          <button
            onClick={() => setShowWeekly(!showWeekly)}
            className="flex items-center justify-center gap-2 text-xs text-primary-400 transition-colors hover:text-primary-300"
          >
            <TrendingUp size={12} />
            {showWeekly ? 'Hide weekly overview' : 'Show weekly overview'}
          </button>
          {showWeekly && <WeeklySummary days={weekData} />}
        </>
      )}

      {/* Meals */}
      <div className="space-y-3">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onToggleStatus={onMealStatusChange}
            onAddFood={onAddFood}
          />
        ))}
      </div>
    </div>
  );
}
