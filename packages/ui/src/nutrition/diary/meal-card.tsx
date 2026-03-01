'use client';

import { useState } from 'react';
import {
  Coffee, Sun, Utensils, Moon, Dumbbell,
  ChevronDown, Check, SkipForward, Plus, Flame,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

export interface DiaryFood {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface DiaryMeal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
  time?: string;
  foods: DiaryFood[];
  status: 'pending' | 'done' | 'skipped';
}

export interface MealCardProps {
  meal: DiaryMeal;
  onToggleStatus: (mealId: string, status: DiaryMeal['status']) => void;
  onAddFood?: (mealId: string) => void;
  className?: string;
}

const MEAL_ICONS: Record<DiaryMeal['type'], typeof Coffee> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Utensils,
  snack: Moon,
  'pre-workout': Dumbbell,
  'post-workout': Dumbbell,
};

const MEAL_COLORS: Record<DiaryMeal['type'], string> = {
  breakfast: 'text-amber-400',
  lunch: 'text-orange-400',
  dinner: 'text-indigo-400',
  snack: 'text-emerald-400',
  'pre-workout': 'text-red-400',
  'post-workout': 'text-blue-400',
};

export function MealCard({ meal, onToggleStatus, onAddFood, className }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = MEAL_ICONS[meal.type] || Utensils;
  const color = MEAL_COLORS[meal.type] || 'text-neutral-400';

  const totalCalories = meal.foods.reduce((s, f) => s + f.macros.calories, 0);
  const totalProtein = meal.foods.reduce((s, f) => s + f.macros.protein, 0);

  const isDone = meal.status === 'done';
  const isSkipped = meal.status === 'skipped';

  return (
    <div
      className={cn(
        'rounded-xl border bg-neutral-900/80 backdrop-blur-sm transition-all',
        isDone ? 'border-emerald-800/50' : isSkipped ? 'border-neutral-800 opacity-60' : 'border-neutral-800',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', isDone ? 'bg-emerald-500/10' : 'bg-neutral-800')}>
          <Icon size={18} className={isDone ? 'text-emerald-400' : color} />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-semibold', isDone ? 'text-emerald-300' : 'text-white')}>
                {meal.name}
              </span>
              {meal.time && (
                <span className="text-xs text-neutral-500">{meal.time}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Flame size={10} className="text-orange-400" />
              <span>{Math.round(totalCalories)} kcal</span>
              <span className="text-neutral-600">·</span>
              <span>{Math.round(totalProtein)}g protein</span>
              <span className="text-neutral-600">·</span>
              <span>{meal.foods.length} items</span>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={cn('text-neutral-500 transition-transform', expanded && 'rotate-180')}
          />
        </button>

        {/* Status toggles */}
        <div className="flex gap-1">
          <button
            onClick={() => onToggleStatus(meal.id, isDone ? 'pending' : 'done')}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500 hover:text-emerald-400',
            )}
            title={isDone ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => onToggleStatus(meal.id, isSkipped ? 'pending' : 'skipped')}
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isSkipped ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300',
            )}
            title={isSkipped ? 'Unskip' : 'Skip meal'}
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>

      {/* Expanded food list */}
      {expanded && (
        <div className="border-t border-neutral-800 px-3 pb-3 pt-2">
          <div className="space-y-2">
            {meal.foods.map((food) => (
              <div key={food.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <span className="text-neutral-200">{food.name}</span>
                  <span className="ml-2 text-xs text-neutral-500">
                    {food.quantity}{food.unit}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-neutral-400">
                  <span>{Math.round(food.macros.calories)}</span>
                  <span className="text-red-400/60">{Math.round(food.macros.protein)}p</span>
                  <span className="text-yellow-400/60">{Math.round(food.macros.carbs)}c</span>
                  <span className="text-blue-400/60">{Math.round(food.macros.fats)}f</span>
                </div>
              </div>
            ))}
          </div>

          {onAddFood && (
            <button
              onClick={() => onAddFood(meal.id)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-700 p-2 text-xs text-neutral-400 transition-colors hover:border-primary-500/50 hover:text-primary-400"
            >
              <Plus size={12} />
              <span>Add food</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
