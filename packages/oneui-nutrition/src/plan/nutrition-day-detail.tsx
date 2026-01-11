'use client';

import { ChevronLeft, Flame, Droplets, Wheat, Beef, Utensils, Play } from 'lucide-react';
import { MealGroupModern } from '../live/v2/meal-group-modern';
import type { NutritionPlan, Meal } from '@onecoach/types-nutrition';


// --- MAIN COMPONENT ---

export interface NutritionDayDetailProps {
  plan: NutritionPlan;
  weekNumber: number;
  dayNumber: number;
  onBack: () => void;
  onTrack: () => void;
}

export function NutritionDayDetail({
  plan,
  weekNumber,
  dayNumber,
  onBack,
  onTrack,
}: NutritionDayDetailProps) {
  // Find the specific day
  const week = plan.weeks?.find((w) => w.weekNumber === weekNumber);
  const day = week?.days?.find((d) => d.dayNumber === dayNumber);

  if (!day) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Giorno non trovato</h2>
          <button onClick={onBack} className="mt-4 text-emerald-600 hover:underline">
            Torna al piano
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-4 pb-8 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Torna al piano
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <span className="text-xs font-bold tracking-widest uppercase">
                  Settimana {weekNumber}
                </span>
                <span className="h-1 w-1 rounded-full bg-current" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Giorno {dayNumber}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                Dettaglio Giornaliero
              </h1>
            </div>

            <button
              onClick={onTrack}
              className="group relative flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:bg-emerald-500 hover:shadow-emerald-500/50 active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-current" />
              Traccia questo giorno
            </button>
          </div>
        </div>

        {/* Macro Summary Card */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400 shadow-inner">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calorie</p>
              <p className="text-2xl font-black text-white">
                {Math.round(day.totalMacros.calories)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
              <Beef className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proteine</p>
              <p className="text-2xl font-black text-white">
                {Math.round(day.totalMacros.protein)}g
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
              <Wheat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Carboidrati
              </p>
              <p className="text-2xl font-black text-white">
                {Math.round(day.totalMacros.carbs)}g
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grassi</p>
              <p className="text-2xl font-black text-white">
                {Math.round(day.totalMacros.fats)}g
              </p>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
            <Utensils className="h-5 w-5 text-slate-400" />
            Pasti del Giorno
          </h2>

          <div className="gap-6 grid">
            {day.meals?.map((meal: Meal, index: number) => (
              <MealGroupModern
                key={index}
                meal={meal}
                index={index}
                onToggleFood={() => {}}
                readOnly={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
