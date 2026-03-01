'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus, Sparkles, ChefHat, ArrowRight, Calendar, Utensils, Play } from 'lucide-react';
import { useNutritionPlans } from '@giulio-leone/features/nutrition';
import { getAllNutritionPlanDays } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';
import { Card, Heading, Text, Button } from '@giulio-leone/ui';
import { NutritionHeader } from './nutrition-header';
import { SavedNutritionPlans } from './saved-plans';
import type { NutritionPlan } from "@giulio-leone/types/nutrition";


export function NutritionDashboard() {
  const t = useTranslations('nutrition');
  const { data, isLoading: _isLoading } = useNutritionPlans();

  const activePlan = useMemo(() => {
    const currentPlans = data || [];
    return currentPlans.find((p: NutritionPlan) => p.status === 'ACTIVE') || currentPlans[0];
  }, [data]);

  const todayPreview = useMemo(() => {
    if (!activePlan) return null;
    const days = getAllNutritionPlanDays(activePlan);
    // For now, just show the first day or find today if we had date logic
    return days[0];
  }, [activePlan]);

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 dark:bg-[#09090b]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NutritionHeader
          title={t('title')}
          subtitle={t('subtitle')}
          actions={
            <Link
              href="/nutrition/create"
              className={cn(
                'group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200',
                'border border-neutral-200/60 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                'dark:border-white/[0.08] dark:bg-zinc-950 dark:text-neutral-200 dark:hover:bg-white/[0.06]'
              )}
            >
              <Plus className="h-4 w-4 text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200" />
              <span className="hidden sm:inline">{t('layoutLabels.createManually')}</span>
              <span className="sm:hidden">{t('layoutLabels.createManuallyShort')}</span>
            </Link>
          }
        />

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Active Plan & Generator (8 cols) */}
          <div className="space-y-8 lg:col-span-8">
            {/* Generator Call-to-Action Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white shadow-xl dark:from-green-700 dark:to-emerald-800">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <Sparkles className="h-3 w-3" />
                  {t('nutrition.nutrition_dashboard.ai_powered')}
                </div>
                <Heading level={2} size="3xl" weight="bold" className="mb-3">
                  {t('cta.title')}
                </Heading>
                <Text size="lg" className="mb-8 max-w-xl text-green-100">
                  {t('cta.description')}
                </Text>

                <Link href="/nutrition/generate">
                  <Button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-600 shadow-lg transition-transform hover:scale-105 hover:bg-green-50 active:scale-95 h-auto">
                    {t('generator.startGeneration')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Active Plan Preview */}
            {activePlan && todayPreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Heading level={2} size="xl" weight="bold" className="flex items-center gap-2 text-neutral-900 dark:text-white">
                    <Utensils className="h-5 w-5 text-emerald-500" />
                    {t('dashboard.activePlan')}: {activePlan.name}
                  </Heading>
                  <Link
                    href={`/nutrition/${activePlan.id}`}
                  >
                    <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-0 hover:bg-transparent">
                      {t('dashboard.viewAll')} →
                    </Button>
                  </Link>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-1 shadow-2xl shadow-emerald-500/20 dark:shadow-black/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500 opacity-100" />
                  <div className="relative overflow-hidden rounded-[22px] bg-neutral-950 p-6 sm:p-8">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-emerald-400">
                          <Calendar className="h-5 w-5 fill-current" />
                          <span className="text-xs font-bold tracking-widest uppercase">
                            {t('dashboard.day')} {todayPreview.dayNumber}
                          </span>
                        </div>

                        <Heading level={3} size="3xl" weight="bold" className="mb-2 text-white">
                          {Math.round(todayPreview.totalMacros.calories)} kcal
                        </Heading>
                        
                        <div className="mt-4 flex gap-4">
                          <div className="flex flex-col">
                            <Text size="xs" weight="bold" className="text-neutral-500 uppercase">
                              {t('sharedMacros.protein')}
                            </Text>
                            <Text size="lg" weight="bold" className="text-white">
                              {Math.round(todayPreview.totalMacros.protein)}g
                            </Text>
                          </div>
                          <div className="h-8 w-px bg-neutral-800" />
                          <div className="flex flex-col">
                            <Text size="xs" weight="bold" className="text-neutral-500 uppercase">
                              {t('sharedMacros.carbs')}
                            </Text>
                            <Text size="lg" weight="bold" className="text-white">
                              {Math.round(todayPreview.totalMacros.carbs)}g
                            </Text>
                          </div>
                          <div className="h-8 w-px bg-neutral-800" />
                          <div className="flex flex-col">
                            <Text size="xs" weight="bold" className="text-neutral-500 uppercase">
                              {t('sharedMacros.fats')}
                            </Text>
                            <Text size="lg" weight="bold" className="text-white">
                              {Math.round(todayPreview.totalMacros.fats)}g
                            </Text>
                          </div>
                        </div>
                      </div>

                      <Link href={`/nutrition/${activePlan.id}/track`}>
                        <Button 
                          className="w-full justify-center gap-3 rounded-xl bg-emerald-600 px-8 py-6 text-base font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:shadow-emerald-500/50 sm:w-auto"
                        >
                          <Play className="h-5 w-5 fill-current" />
                          {t('dashboard.trackNow')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Plans List */}
            <div className="mt-12">
              <SavedNutritionPlans />
            </div>
          </div>

          {/* Right Column: Info & Features (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            <Card variant="glass" className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <Heading level={3} size="lg" weight="semibold" className="text-neutral-900 dark:text-neutral-100">
                {t('features.ai.title')}
              </Heading>
              <Text size="sm" className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t('features.ai.description')}
              </Text>
            </Card>

            <Card variant="glass" className="p-6">
              <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <ChefHat className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Heading level={3} size="lg" weight="semibold" className="text-neutral-900 dark:text-neutral-100">
                {t('features.scientific.title')}
              </Heading>
              <Text size="sm" className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t('features.scientific.description')}
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
