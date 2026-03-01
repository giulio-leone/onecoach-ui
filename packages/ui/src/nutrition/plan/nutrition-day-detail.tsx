'use client';

import { ChevronLeft, Flame, Droplets, Wheat, Beef, Utensils, Play } from 'lucide-react';
import { MealGroupModern } from '../live/v2/meal-group-modern';
import { Heading, Text, Button } from '@giulio-leone/ui';
import type { NutritionPlan, Meal, NutritionWeek, NutritionDay } from '@giulio-leone/types/nutrition';


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
  const week = plan.weeks?.find((w: NutritionWeek) => w.weekNumber === weekNumber);
  const day = week?.days?.find((d: NutritionDay) => d.dayNumber === dayNumber);

  if (!day) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <Heading level={2} size="xl" weight="bold" className="text-neutral-900 dark:text-white">Giorno non trovato</Heading>
          <Button variant="ghost" onClick={onBack} className="mt-4 text-emerald-600 hover:text-emerald-700 hover:no-underline hover:bg-transparent p-0">
            Torna al piano
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-4 pb-8 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white pl-0 hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Torna al piano
          </Button>

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
              <Heading level={1} size="3xl" weight="extrabold" className="text-white uppercase tracking-tight">
                Dettaglio Giornaliero
              </Heading>
            </div>

            <Button
              onClick={onTrack}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:shadow-emerald-500/50"
            >
              <Play className="h-4 w-4 fill-current" />
              Traccia questo giorno
            </Button>
          </div>
        </div>

        {/* Macro Summary Card */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 shadow-inner">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <Text size="xs" weight="bold" className="text-neutral-500 uppercase tracking-wider">Calorie</Text>
              <Heading level={3} size="2xl" weight="extrabold" className="text-white">
                {Math.round(day.totalMacros.calories)}
              </Heading>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
              <Beef className="h-6 w-6" />
            </div>
            <div>
              <Text size="xs" weight="bold" className="text-neutral-500 uppercase tracking-wider">Proteine</Text>
              <Heading level={3} size="2xl" weight="extrabold" className="text-white">
                {Math.round(day.totalMacros.protein)}g
              </Heading>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]">
              <Wheat className="h-6 w-6" />
            </div>
            <div>
              <Text size="xs" weight="bold" className="text-neutral-500 uppercase tracking-wider">
                Carboidrati
              </Text>
              <Heading level={3} size="2xl" weight="extrabold" className="text-white">
                {Math.round(day.totalMacros.carbs)}g
              </Heading>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <Text size="xs" weight="bold" className="text-neutral-500 uppercase tracking-wider">Grassi</Text>
              <Heading level={3} size="2xl" weight="extrabold" className="text-white">
                {Math.round(day.totalMacros.fats)}g
              </Heading>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-6">
          <Heading level={2} size="xl" weight="bold" className="flex items-center gap-2 text-white mb-6">
            <Utensils className="h-5 w-5 text-neutral-400" />
            Pasti del Giorno
          </Heading>

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
