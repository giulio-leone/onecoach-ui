'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronLeft,
  Utensils,
  Flame,
  Droplets,
  Wheat,
  Beef,
  Play,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { getWeekAndDayFromDate } from '@giulio-leone/lib-shared';
import { Spinner, Heading, Text, Button } from '@giulio-leone/ui';
import type { NutritionPlan, Meal, NutritionDay } from '@giulio-leone/types/nutrition';

// --- HELPER COMPONENTS ---

function MacroPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'rose';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  };

  return (
    <div
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${colors[color]}`}
    >
      <span>{label}</span>
      <span>{Math.round(value)}g</span>
    </div>
  );
}

const DEFAULT_LABELS: NutritionDashboardLabels = {
  backToPlans: 'Torna ai piani',
  nutrition: 'Nutrizione',
  weeks: 'Settimane',
  shoppingList: 'Lista Spesa',
  delete: 'Elimina',
  todaysMenu: 'Menu di Oggi',
  day: 'Giorno',
  week: 'Settimana',
  protein: 'Proteine',
  carbs: 'Carboidrati',
  fats: 'Grassi',
  trackNow: 'TRACCIA ORA',
  foodPlan: 'Piano Alimentare',
  visibleDetails: 'Vedi dettagli',
  meals: 'Pasti',
  macroGoals: 'Obiettivi Macro',
  calories: 'Calorie',
  goals: 'Obiettivi',
  maintenance: 'Mantenimento',
  otherMeals: '+ altri {count} pasti',
};

export interface NutritionDashboardLabels {
  backToPlans: string;
  nutrition: string;
  weeks: string;
  shoppingList: string;
  delete: string;
  todaysMenu: string;
  day: string;
  week: string;
  protein: string;
  carbs: string;
  fats: string;
  trackNow: string;
  foodPlan: string;
  visibleDetails: string;
  meals: string;
  macroGoals: string;
  calories: string;
  goals: string;
  maintenance: string;
  otherMeals: string;
}

export interface NutritionPlanDashboardProps {
  plan: NutritionPlan;
  planId: string;
  onBack: () => void;
  onDelete: () => void;
  onTrack: () => void;
  className?: string;
  labels?: Partial<NutritionDashboardLabels>;
}

export function NutritionPlanDashboard({
  plan,
  planId,
  onBack,
  onDelete,
  onTrack,
  className = '',
  labels: labelsProp,
}: NutritionPlanDashboardProps) {
  const router = useRouter();
  const [isTracking, setIsTracking] = useState(false);
  const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelsProp }), [labelsProp]);

  // Determine "Today's" Meals (Simulated for dashboard view, or real if we had date logic here)
  const todayPreview = useMemo(() => {
    // ...
    const today = new Date();
    const weekDay = getWeekAndDayFromDate(plan, today); // Use shared helper
    if (weekDay && plan.weeks) {
      const week = plan.weeks.find((w: any) => w.weekNumber === weekDay.weekNumber);
      const day = week?.days?.find((d: any) => d.dayNumber === weekDay.dayNumber);
      if (day) return { day, ...weekDay, isToday: true };
    }
    // Fallback
    return plan.weeks?.[0]?.days?.[0]
      ? { day: plan.weeks[0].days[0], weekNumber: 1, dayNumber: 1, isToday: false }
      : null;
  }, [plan]);

  const handleTrackToday = () => {
    setIsTracking(true);
    // Logic to determine today's date is handled by the page or passed down,
    // but usually we just nav to /track with today's date
    onTrack();
    // We don't set isTracking false here because we navigate away
  };

  const handleDayClick = (day: NutritionDay, weekNumber: number) => {
    router.push(`/nutrition/${planId}/week/${weekNumber}/day/${day.dayNumber}`);
  };

  return (
    <div className={`min-h-screen bg-slate-950 ${className}`}>
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full px-4 pt-4 pb-8 lg:px-6">
        {/* --- Header Section --- */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-6 gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {labels.backToPlans}
            </Button>

            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                {labels.nutrition}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {plan.durationWeeks} {labels.weeks}
              </span>
            </div>

            <Heading level={1} size="4xl" weight="extrabold" className="tracking-tight text-white sm:text-5xl uppercase">
              {plan.name}
            </Heading>
            {plan.description && (
              <Text size="lg" className="mt-4 max-w-2xl leading-relaxed text-slate-300">
                {plan.description}
              </Text>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/nutrition/${planId}/shopping`)}
              className="h-10 gap-2 border-slate-800 bg-slate-900 text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <ShoppingCart className="h-4 w-4" />
              {labels.shoppingList}
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              className="h-10 gap-2 border-slate-800 bg-slate-900 text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10"
            >
              {labels.delete}
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* --- Left Column: Main Content (8 cols) --- */}
          <div className="space-y-8 lg:col-span-8">
            {/* Today's Overview Hero Card */}
            {todayPreview && (
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-1 shadow-2xl shadow-emerald-500/20 dark:shadow-black/50">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500 opacity-100" />

                <div className="relative overflow-hidden rounded-[22px] bg-neutral-950 p-6 sm:p-8">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

                  <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-emerald-400">
                        <Utensils className="h-5 w-5 fill-current" />
                        <span className="text-xs font-bold tracking-widest uppercase">
                          {labels.todaysMenu}
                        </span>
                      </div>

                      <Heading level={2} size="3xl" weight="bold" className="mb-2 text-white">
                        {labels.day} {todayPreview.dayNumber}
                      </Heading>
                      <Text className="text-neutral-400">
                        {labels.week} {todayPreview.weekNumber} •{' '}
                        {Math.round(todayPreview.day.totalMacros.calories)} kcal
                      </Text>

                      <div className="mt-4 flex gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {labels.protein}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {Math.round(todayPreview.day.totalMacros.protein)}g
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-800" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {labels.carbs}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {Math.round(todayPreview.day.totalMacros.carbs)}g
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-800" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {labels.fats}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {Math.round(todayPreview.day.totalMacros.fats)}g
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleTrackToday}
                      disabled={isTracking}
                      className="w-full justify-center gap-3 rounded-xl bg-emerald-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:shadow-emerald-500/50 sm:w-auto"
                    >
                      {isTracking ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        <>
                          <Play className="h-5 w-5 fill-current" />
                          {labels.trackNow}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Schedule */}
            <div className="space-y-6">
              <Heading level={3} size="xl" weight="bold" className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-slate-400" />
                {labels.foodPlan}
              </Heading>

              <div className="space-y-8">
                {(plan.weeks || []).map((week: any) => (
                  <div key={week.weekNumber} className="space-y-4">
                    {/* Week Header */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-slate-300">
                        {week.weekNumber}
                      </div>
                      <div>
                        <Heading level={4} size="sm" weight="bold" className="tracking-wide text-white uppercase">
                          {labels.week} {week.weekNumber}
                        </Heading>
                      </div>
                      <div className="h-px flex-1 bg-slate-800" />
                    </div>

                    {/* Days Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(week.days || []).map((day: any) => (
                        <div
                          key={day.dayNumber}
                          onClick={() => handleDayClick(day, week.weekNumber)}
                          className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
                        >
                          <div>
                            <div className="mb-3 flex items-start justify-between">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                                {day.dayNumber}
                              </span>
                              <span className="text-xs font-medium text-slate-400">
                                {Math.round(day.totalMacros.calories)} kcal
                              </span>
                            </div>

                            <Heading level={5} size="lg" weight="bold" className="mb-3 text-white">
                              {labels.day} {day.dayNumber}
                            </Heading>

                            <div className="mb-4 flex flex-wrap gap-2">
                              <MacroPill label="P" value={day.totalMacros.protein} color="blue" />
                              <MacroPill label="C" value={day.totalMacros.carbs} color="amber" />
                              <MacroPill label="F" value={day.totalMacros.fats} color="rose" />
                            </div>

                            <div className="space-y-1">
                              {(day.meals || []).slice(0, 2).map((meal: Meal, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-slate-400"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                                  <span className="truncate">{meal.name}</span>
                                </div>
                              ))}
                              {(day.meals?.length || 0) > 2 && (
                                <div className="pl-3.5 text-[10px] text-slate-500">
                                  {labels.otherMeals.replace(
                                    '{count}',
                                    ((day.meals?.length || 0) - 2).toString()
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                            <span className="text-xs font-medium text-slate-400">
                              {day.meals?.length || 0} {labels.meals}
                            </span>
                            <span className="text-xs font-bold text-transparent transition-colors group-hover:text-emerald-400">
                              {labels.visibleDetails}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Column: Sidebar (4 cols) --- */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Program Stats */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm backdrop-blur-xl">
                <Heading level={3} size="sm" weight="bold" className="mb-4 tracking-widest text-slate-400 uppercase">
                  {labels.macroGoals}
                </Heading>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <Flame className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        {labels.calories}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {Math.round(plan.targetMacros.calories)}
                    </span>
                  </div>

                  <div className="h-px bg-slate-800" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Beef className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        {labels.protein}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {Math.round(plan.targetMacros.protein)}g
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Wheat className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        {labels.carbs}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {Math.round(plan.targetMacros.carbs)}g
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Droplets className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        {labels.fats}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {Math.round(plan.targetMacros.fats)}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm backdrop-blur-xl">
                <Heading level={3} size="sm" weight="bold" className="mb-4 tracking-widest text-slate-400 uppercase">
                  {labels.goals}
                </Heading>
                <div className="flex flex-wrap gap-2">
                  {(plan.goals || [labels.maintenance]).map((goal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
