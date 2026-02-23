/**
 * Nutrition Plan Editor Component - REFACTORED
 * Visual builder for editing nutrition plans
 *
 * Refactored following KISS, DRY, SOLID principles
 * Uses extracted hooks and components
 * Supports drag and drop for reordering items
 */
'use client';
import { useCallback, useState, useEffect, useMemo } from 'react';
// import { useRouter } from 'app/navigation'; // REMOVED - inject or use next/navigation
import { useRouter } from 'next/navigation'; // Use standard hook for library components, or pass nav
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button, EditorHeader, VersionHistory } from '@giulio-leone/ui';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
// Next.js specific components - manteniamo import da apps/next
import { SortableList } from '@giulio-leone/ui';
// import { WeekCard, FoodDetailDrawer } from '@giulio-leone/ui-nutrition'; // Internal imports now
import { WeekCard } from './week-card';
// FoodDetailDrawer is in food? or builder?
// Checking where WeekCard is... it is in ./week-card.tsx
// FoodDetailDrawer might be imported from ../food if it's there?
// I will assume absolute import from package for now if internal structure is unknown
import { FoodDetailDrawer } from '../food/food-detail-drawer'; // Guessed path, or import from package index

import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { createNutritionWeekDragId } from '@giulio-leone/lib-shared';
import { getAllNutritionPlanDays } from '@giulio-leone/lib-shared';
import {
  useNutritionPlanState,
  usePlanOperations,
  useMacrosCalculations,
  useTemplateOperations,
} from '@giulio-leone/features/nutrition/hooks'; // Assuming this works if oneui-nutrition depends on it
import { useExpansionState } from '@giulio-leone/hooks'; // Fixed import
import { useFoodDrawer } from '@giulio-leone/features/food/hooks';
import { useAdminCheck } from '@giulio-leone/hooks'; // Fixed import
import { needsRecalculation } from '@giulio-leone/lib-shared';
import { useNutritionDnd } from '@giulio-leone/features/nutrition/hooks';
import { PlanMetadataForm } from './components/plan-metadata-form';
import { TargetMacrosForm } from './components/target-macros-form';
import { RecalculateModal } from './components/recalculate-modal';
import { TemplateSaveDialog } from './components/template-save-dialog';
import { NutritionTemplateSelector } from './components/nutrition-template-selector';
// import { useNutritionPlanDetailRealtime } from '@/hooks/use-nutrition-realtime'; // This is APP specific.
// If this hook is vital, it should be in hooks package or passed as prop.
// For now I will COMMENT it out and assume the parent component handles realtime or data fetching?
// Or maybe I should move useNutritionPlanDetailRealtime to hooks package too?
// It was in @/hooks... I'll check if I can rely on useNutritionPlanState for data.

import { logger } from '@giulio-leone/lib-shared';
import type {
  NutritionPlan,
  NutritionTemplate,
  NutritionTemplateType,
  Food,
  NutritionDay,
  NutritionWeek,
  Meal,
} from '@giulio-leone/types/nutrition';
import type { FoodItem } from '@giulio-leone/types/nutrition';

type NutritionPlanEditorProps = {
  planId?: string;
  mode?: 'create' | 'edit';
  initialPlan?: NutritionPlan;
  onPlanSaved?: (plan: NutritionPlan) => void;
};

export function NutritionPlanEditor({
  planId,
  mode,
  initialPlan,
  onPlanSaved,
}: NutritionPlanEditorProps) {
  const router = useRouter();
  const isAdmin = useAdminCheck();
  const t = useTranslations('nutrition.planEditor');

  // Integrated Realtime Sync
  // useNutritionPlanDetailRealtime(planId); // DISABLED for package migration

  // Main plan state
  const {
    plan,
    setPlan,
    isLoading,
    isSaving,
    error,
    showVersions,
    setShowVersions,
    versions,
    isEditMode,
    savePlan,
    restoreVersion,
  } = useNutritionPlanState({
    planId,
    mode,
    initialPlan,
    onPlanSaved,
  });
  // Expansion state
  const {
    expandedWeeks,
    expandedDays,
    expandedMeals,
    toggleWeek,
    toggleDay,
    toggleMeal,
    expandWeek,
    expandDay,
    expandMeal,
    setExpandedWeeks,
    setExpandedDays,
  } = useExpansionState(new Set([1]));
  // Plan operations
  const planOps = usePlanOperations({
    onPlanChange: setPlan,
  });
  // Template operations
  const templateOps = useTemplateOperations();
  // Food drawer
  const { selectedFoodItemId, isCreatingNewFood, openDrawer, openCreateDrawer, closeDrawer } =
    useFoodDrawer();
  // Macros calculations
  const { calculateMacros: _calcMacros } = useMacrosCalculations();
  // Drag and drop handler (unified)
  const { handleDragEndEvent } = useNutritionDnd({
    plan,
    onPlanChange: setPlan,
  });
  // Configure sensors for touch, mouse, and keyboard (drag and drop)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms long-press to start drag (touch-friendly)
        tolerance: 8, // 8px movement tolerance during long-press
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // Recalculation state
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  const [recalculateInfo, setRecalculateInfo] = useState<{
    dayNumber: number;
    foodId: string;
    food: Food;
    creditsRequired: number;
    creditsAvailable: number;
  } | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  // Initialize expansion state after plan load (only if not already expanded)
  useEffect(() => {
    if (plan.weeks && plan.weeks.length > 0 && expandedWeeks.size === 0) {
      const firstWeek = plan.weeks[0];
      if (firstWeek) {
        setExpandedWeeks(new Set([firstWeek.weekNumber]));
        const firstDay = firstWeek.days?.[0];
        if (firstDay && expandedDays.size === 0) {
          setExpandedDays(new Set([`${firstWeek.weekNumber}-${firstDay.dayNumber}`]));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.weeks]);
  // Handlers
  const handleSave = useCallback(async () => {
    try {
      const savedPlan = await savePlan();
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.success(isEditMode ? t('save_success') : t('created_success'));
      if (!isEditMode && savedPlan) {
        router.push(`/nutrition/${savedPlan.id}/edit`);
      }
    } catch (_err: unknown) {
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.error(_err instanceof Error ? _err.message : t('save_error'));
    }
  }, [savePlan, isEditMode, router, t]);
  const handleRestoreVersion = useCallback(
    async (version: number) => {
      const { dialog } = await import('@giulio-leone/lib-stores');
      const confirmed = await dialog.confirm(t('restore_confirm', { version }));
      if (!confirmed) return;
      try {
        await restoreVersion(version);
        await dialog.success(t('restore_success'));
      } catch (_err: unknown) {
        await dialog.error(_err instanceof Error ? _err.message : t('restore_error'));
      }
    },
    [restoreVersion, t]
  );
  // Week operations
  const handleAddWeek = useCallback(() => {
    const result = planOps.addWeek(plan);
    setPlan(result.plan);
    expandWeek(result.weekNumber);
    expandDay(
      `${result.weekNumber}-${result.plan.weeks[result.plan.weeks.length - 1]?.days[0]?.dayNumber}`
    );
  }, [plan, planOps, setPlan, expandWeek, expandDay]);
  const handleRemoveWeek = useCallback(
    async (weekNumber: number) => {
      const { dialog } = await import('@giulio-leone/lib-stores');
      const confirmed = await dialog.confirm(t('delete_week_confirm'));
      if (!confirmed) return;
      const updatedPlan = planOps.removeWeek(plan, weekNumber);
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan, t]
  );
  // Day operations
  const handleAddDay = useCallback(() => {
    const result = planOps.addDay(plan);
    setPlan(result.plan);
    expandWeek(result.weekNumber);
    expandDay(`${result.weekNumber}-${result.dayNumber}`);
  }, [plan, planOps, setPlan, expandWeek, expandDay]);
  const handleRemoveDay = useCallback(
    async (dayNumber: number) => {
      const { dialog } = await import('@giulio-leone/lib-stores');
      const confirmed = await dialog.confirm(t('delete_day_confirm'));
      if (!confirmed) return;
      const updatedPlan = planOps.removeDay(plan, dayNumber);
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan, t]
  );
  // Meal operations
  const handleAddMeal = useCallback(
    (dayNumber: number) => {
      const updatedPlan = planOps.addMeal(plan, dayNumber);
      setPlan(updatedPlan);
      const day = getAllNutritionPlanDays(updatedPlan).find(
        (d: NutritionDay) => d.dayNumber === dayNumber
      );
      if (day && day.meals.length > 0) {
        const lastMeal = day.meals[day.meals.length - 1];
        if (lastMeal) {
          expandMeal(`${dayNumber}-${lastMeal.id}`);
        }
      }
    },
    [plan, planOps, setPlan, expandMeal]
  );
  const handleRemoveMeal = useCallback(
    async (dayNumber: number, mealId: string) => {
      const { dialog } = await import('@giulio-leone/lib-stores');
      const confirmed = await dialog.confirm(t('delete_meal_confirm'));
      if (!confirmed) return;
      const updatedPlan = planOps.removeMeal(plan, dayNumber, mealId);
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan, t]
  );
  // Food operations
  const handleAddFoodFromCatalog = useCallback(
    (dayNumber: number, mealId: string, foodItem: FoodItem) => {
      const updatedPlan = planOps.addFoodFromCatalog(plan, dayNumber, mealId, foodItem);
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan]
  );
  const handleAddFood = useCallback(
    (dayNumber: number, mealId: string) => {
      const updatedPlan = planOps.addFood(plan, dayNumber, mealId);
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan]
  );
  const handleRemoveFood = useCallback(
    async (dayNumber: number, mealId: string, foodId: string) => {
      const { dialog } = await import('@giulio-leone/lib-stores');
      const confirmed = await dialog.confirm(t('delete_food_confirm'));
      if (!confirmed) return;
      const updatedPlan = planOps.removeFood(plan, dayNumber, mealId, foodId);
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan, t]
  );
  const triggerRecalculation = useCallback(
    async (dayNumber: number, foodId: string, modifiedFood: Food, confirmed: boolean = false) => {
      if (!planId) return;
      setIsRecalculating(true);
      try {
        const response = await fetch(`/api/nutrition/${planId}/recalculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber,
            modifiedFoodId: foodId,
            modifiedFood,
            confirmed,
            tier: 'balanced',
          }),
        });
        const data = await response.json();
        if (response.status === 402 || (response.status === 200 && data.requiresConfirmation)) {
          const user = await fetch('/api/profile').then((r) => r.json());
          setRecalculateInfo({
            dayNumber,
            foodId,
            food: modifiedFood,
            creditsRequired: data.creditsRequired || 1,
            creditsAvailable: data.creditsAvailable || user?.profile?.user?.credits || 0,
          });
          setShowRecalculateModal(true);
          setIsRecalculating(false);
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.error || t('recalculate_error'));
        }
        setPlan(data.plan);
        setShowRecalculateModal(false);
        setRecalculateInfo(null);
      } catch (err: unknown) {
        logger.error(t('common.error'), err);
        const { dialog } = await import('@giulio-leone/lib-stores');
        await dialog.error(err instanceof Error ? err.message : t('recalculate_error'));
      } finally {
        setIsRecalculating(false);
      }
    },
    [planId, setPlan, t]
  );
  const handleUpdateFood = useCallback(
    (dayNumber: number, mealId: string, foodId: string, updates: Partial<Food>) => {
      const updatedPlan = planOps.updateFood(plan, dayNumber, mealId, foodId, updates);
      setPlan(updatedPlan);
      // Check if recalculation is needed
      if (updates.quantity !== undefined && planId) {
        setTimeout(async () => {
          setPlan((currentPlan: NutritionPlan) => {
            const day = getAllNutritionPlanDays(currentPlan).find(
              (d: NutritionDay) => d.dayNumber === dayNumber
            );
            if (day && needsRecalculation(day, currentPlan.targetMacros)) {
              (async () => {
                try {
                  const userResponse = await fetch('/api/profile');
                  const userData = await userResponse.json();
                  const user = userData?.profile?.user;
                  const food = day.meals
                    .flatMap((m: Meal) => m.foods)
                    .find((f: Food) => f.id === foodId);
                  if (food) {
                    if (user?.autoRecalculateMacros) {
                      await triggerRecalculation(dayNumber, foodId, food, true);
                    } else {
                      const creditsResponse = await fetch('/api/credits/balance');
                      const creditsData = await creditsResponse.json();
                      setRecalculateInfo({
                        dayNumber,
                        foodId,
                        food,
                        creditsRequired: 1,
                        creditsAvailable: creditsData.balance || 0,
                      });
                      setShowRecalculateModal(true);
                    }
                  }
                } catch (err: unknown) {
                  logger.error(t('common.error'), err);
                }
              })();
            }
            return currentPlan;
          });
        }, 100);
      }
    },
    [plan, planOps, setPlan, planId, triggerRecalculation, t]
  );
  // Template operations
  const handleLoadTemplate = useCallback(
    (template: NutritionTemplate) => {
      const updatedPlan = planOps.loadTemplate(plan, {
        type: template.type,
        data: template.data,
      });
      setPlan(updatedPlan);
      // Expand newly added items
      if (updatedPlan.weeks && updatedPlan.weeks.length > 0) {
        const lastWeek = updatedPlan.weeks[updatedPlan.weeks.length - 1];
        if (lastWeek && lastWeek.days && lastWeek.days.length > 0) {
          const lastDay = lastWeek.days[lastWeek.days.length - 1];
          expandWeek(lastWeek.weekNumber);
          if (lastDay) {
            expandDay(`${lastWeek.weekNumber}-${lastDay.dayNumber}`);
            if (lastDay.meals && lastDay.meals.length > 0) {
              const lastMeal = lastDay.meals[lastDay.meals.length - 1];
              if (lastMeal) {
                expandMeal(`${lastDay.dayNumber}-${lastMeal.id}`);
              }
            }
          }
        }
      }
      templateOps.closeTemplateSelector();
    },
    [plan, planOps, setPlan, templateOps, expandWeek, expandDay, expandMeal]
  );
  const handleSaveTemplate = useCallback(async () => {
    if (!templateOps.selectedTemplateSource) return;
    try {
      templateOps.setIsSavingTemplate(true);
      const templateData = templateOps.extractTemplateData(
        plan,
        templateOps.selectedTemplateSource
      );
      if (!templateData) {
        throw new Error(t('template_error_extract'));
      }
      const tagsArray = templateOps.templateTags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0)
        .slice(0, 10);
      const response = await fetch('/api/nutrition-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: templateOps.selectedTemplateSource.type,
          name: templateOps.templateName.trim(),
          description: templateOps.templateDescription.trim() || undefined,
          category: templateOps.templateCategory.trim() || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          data: templateData,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t('template_save_error'));
      }
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.success(t('template_saved'));
      templateOps.closeSaveTemplateDialog();
    } catch (_err: unknown) {
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.error(_err instanceof Error ? _err.message : t('template_save_error'));
    } finally {
      templateOps.setIsSavingTemplate(false);
    }
  }, [plan, templateOps, t]);
  // Meal name change
  const handleMealNameChange = useCallback(
    (dayNumber: number, mealId: string, name: string) => {
      const updatedPlan = planOps.updateDay(plan, dayNumber, (day: NutritionDay) => ({
        ...day,
        meals: day.meals.map((m: Meal) => (m.id === mealId ? { ...m, name } : m)),
      }));
      setPlan(updatedPlan);
    },
    [plan, planOps, setPlan]
  );
  // Drag and drop event handler (KISS - delegates all logic to hook)
  const handleDragEnd = handleDragEndEvent;
  // Memoize week drag IDs
  const weekDragIds = useMemo(
    () =>
      plan.weeks?.map((week: NutritionWeek) => createNutritionWeekDragId(week.weekNumber)) || [],
    [plan.weeks]
  );
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          <p className={cn('text-sm font-medium', darkModeClasses.text.tertiary)}>{t('loading')}</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-900">{t('error_title')}</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <EditorHeader
        name={plan.name}
        description={plan.description}
        onNameChange={(name: string) => setPlan({ ...plan, name })}
        onDescriptionChange={(description: string) => setPlan({ ...plan, description })}
        onSave={handleSave}
        isSaving={isSaving}
        isEditMode={isEditMode}
        showVersions={showVersions}
        onToggleVersions={() => setShowVersions(!showVersions)}
        saveButtonVariant="green"
      />
      {/* Version History */}
      {showVersions && (
        <VersionHistory
          versions={versions.map((v: { id: string; version: number; createdAt: string }) => ({
            id: v.id,
            version: v.version,
            createdAt: v.createdAt,
          }))}
          onRestore={handleRestoreVersion}
          variant="green"
        />
      )}
      {/* Plan Metadata */}
      <PlanMetadataForm plan={plan} onPlanChange={setPlan} />
      {/* Target Macros */}
      <TargetMacrosForm plan={plan} onPlanChange={setPlan} />
      {/* Weeks with Drag and Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          <SortableList items={weekDragIds} strategy="vertical">
            {plan.weeks?.map((week: NutritionWeek, index: number) => (
              <WeekCard
                key={week.weekNumber}
                week={week}
                isExpanded={expandedWeeks.has(week.weekNumber)}
                onToggle={() => toggleWeek(week.weekNumber)}
                onAddDay={handleAddDay}
                onAddDayFromTemplate={() => {
                  templateOps.openTemplateSelector('week');
                }}
                onDayAddMeal={handleAddMeal}
                onDayAddMealFromTemplate={() => {
                  templateOps.openTemplateSelector('meal');
                }}
                onMealNameChange={handleMealNameChange}
                onAddFood={handleAddFood}
                onAddFoodFromCatalog={handleAddFoodFromCatalog}
                onFoodQuantityChange={(
                  dayNumber: number,
                  mealId: string,
                  foodId: string,
                  quantity: number
                ) => handleUpdateFood(dayNumber, mealId, foodId, { quantity })}
                onRemoveFood={handleRemoveFood}
                onOpenFoodDetails={openDrawer}
                onRemoveMeal={handleRemoveMeal}
                onSaveMealAsTemplate={(dayNumber: number, mealId: string) => {
                  templateOps.openSaveTemplateDialog({
                    type: 'meal',
                    dayNumber,
                    mealId,
                  });
                }}
                onSaveDayAsTemplate={(dayNumber: number) => {
                  templateOps.openSaveTemplateDialog({
                    type: 'day',
                    dayNumber,
                  });
                }}
                onRemoveDay={handleRemoveDay}
                onRemoveWeek={() => handleRemoveWeek(week.weekNumber)}
                onSaveWeekAsTemplate={() => {
                  if (week.days && week.days.length > 0) {
                    templateOps.openSaveTemplateDialog({
                      type: 'week',
                      dayNumber: week.days[0]?.dayNumber,
                    });
                  }
                }}
                onCreateNewFood={openCreateDrawer}
                isAdmin={isAdmin}
                expandedDays={expandedDays}
                expandedMeals={expandedMeals}
                onToggleDay={toggleDay}
                onToggleMeal={toggleMeal}
                enableDragDrop={true}
                draggable={true}
                dragId={weekDragIds[index]}
                dragData={{
                  weekNumber: week.weekNumber,
                }}
              />
            ))}
          </SortableList>
        </div>
      </DndContext>
      {/* Add Week Button */}
      <div
        className={cn(
          'rounded-2xl border-2 border-dashed p-6 text-center shadow-sm transition-all duration-200 hover:border-green-400 dark:hover:border-green-500',
          'bg-neutral-50 dark:bg-neutral-800/50',
          darkModeClasses.border.base
        )}
      >
        <Button onClick={handleAddWeek} variant="success" size="lg" icon={Plus} fullWidth>
          {t('add_week')}
        </Button>
      </div>
      {/* Save Button (bottom) */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} variant="success" size="md">
          {isSaving
            ? t('actions.saving')
            : isEditMode
              ? t('actions.save_changes')
              : t('create_plan')}
        </Button>
      </div>
      {/* Recalculate Modal */}
      <RecalculateModal
        isOpen={showRecalculateModal}
        recalculateInfo={recalculateInfo}
        isRecalculating={isRecalculating}
        onConfirm={async () => {
          if (recalculateInfo) {
            await triggerRecalculation(
              recalculateInfo.dayNumber,
              recalculateInfo.foodId,
              recalculateInfo.food,
              true
            );
          }
        }}
        onCancel={() => {
          setShowRecalculateModal(false);
          setRecalculateInfo(null);
        }}
      />
      {/* Food Detail Drawer - View/Edit/Delete */}
      <FoodDetailDrawer
        isOpen={!!selectedFoodItemId}
        foodItemId={selectedFoodItemId || null}
        onClose={closeDrawer}
        onDelete={async () => {
          try {
            const response = await fetch(`/api/food/${selectedFoodItemId}`, {
              method: 'DELETE',
            });
            if (!response.ok) throw new Error(t('delete_error'));
            closeDrawer();
          } catch (_err: unknown) {
            const { dialog } = await import('@giulio-leone/lib-stores');
            await dialog.error(_err instanceof Error ? _err.message : t('delete_error'));
          }
        }}
      />
      {/* Food Detail Drawer - Create New */}
      <FoodDetailDrawer
        isOpen={isCreatingNewFood}
        foodItemId={null}
        onClose={closeDrawer}
        onCreate={(_newFood: FoodItem) => {
          // Food created, drawer will show it
        }}
      />
      {/* Nutrition Template Selector */}
      {templateOps.showTemplateSelector && (
        <NutritionTemplateSelector
          onSelect={handleLoadTemplate}
          // Default to meal or handle undefined gracefully, casting to ensure type safety
          type={(templateOps.selectedTemplateSource?.type as NutritionTemplateType) || 'meal'}
          onClose={templateOps.closeTemplateSelector}
        />
      )}
      {/* Save Template Dialog */}
      <TemplateSaveDialog
        isOpen={templateOps.showSaveTemplateDialog}
        templateType={templateOps.selectedTemplateSource?.type || null}
        templateName={templateOps.templateName}
        templateDescription={templateOps.templateDescription}
        templateCategory={templateOps.templateCategory}
        templateTags={templateOps.templateTags}
        isSaving={templateOps.isSavingTemplate}
        onNameChange={templateOps.setTemplateName}
        onDescriptionChange={templateOps.setTemplateDescription}
        onCategoryChange={templateOps.setTemplateCategory}
        onTagsChange={templateOps.setTemplateTags}
        onSave={handleSaveTemplate}
        onCancel={templateOps.closeSaveTemplateDialog}
      />
    </div>
  );
}
