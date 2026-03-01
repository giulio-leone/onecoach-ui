/**
 * WeekCard Component
 *
 * Card per visualizzare e modificare una settimana
 * Include header con gradient, lista giorni, azioni
 */

'use client';

import { useMemo } from 'react';
import { Plus, Trash2, BookOpen, Bookmark, GripVertical } from 'lucide-react';
import { DayCard } from './day-card';
import { SortableList, SortableItem, type SortableItemRenderProps, Button } from '@giulio-leone/ui';
import { createNutritionDayDragId } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';
import type { NutritionWeek, NutritionDay } from "@giulio-leone/types/nutrition";
import type { FoodItem } from "@giulio-leone/types/nutrition";

interface WeekCardProps {
  week: NutritionWeek;
  isExpanded: boolean;
  onToggle: () => void;
  onAddDay: () => void;
  onAddDayFromTemplate?: () => void;
  onDayAddMeal: (dayNumber: number) => void;
  onDayAddMealFromTemplate?: () => void;
  onMealNameChange: (dayNumber: number, mealId: string, name: string) => void;
  onAddFood: (dayNumber: number, mealId: string) => void;
  onAddFoodFromCatalog: (dayNumber: number, mealId: string, foodItem: FoodItem) => void;
  onFoodQuantityChange: (
    dayNumber: number,
    mealId: string,
    foodId: string,
    quantity: number
  ) => void;
  onRemoveFood: (dayNumber: number, mealId: string, foodId: string) => void;
  onOpenFoodDetails?: (foodId: string) => void;
  onRemoveMeal: (dayNumber: number, mealId: string) => void;
  onSaveMealAsTemplate?: (dayNumber: number, mealId: string) => void;
  onSaveDayAsTemplate?: (dayNumber: number) => void;
  onRemoveDay: (dayNumber: number) => void;
  onRemoveWeek: () => void;
  onSaveWeekAsTemplate?: () => void;
  onCreateNewFood?: () => void;
  isAdmin?: boolean;
  expandedDays: Set<string>;
  expandedMeals: Set<string>;
  onToggleDay: (dayKey: string) => void;
  onToggleMeal: (mealKey: string) => void;
  enableDragDrop?: boolean;
  draggable?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
}

export function WeekCard({
  week,
  isExpanded,
  onToggle,
  onAddDay,
  onAddDayFromTemplate,
  onDayAddMeal,
  onDayAddMealFromTemplate,
  onMealNameChange,
  onAddFood,
  onAddFoodFromCatalog,
  onFoodQuantityChange,
  onRemoveFood,
  onOpenFoodDetails,
  onRemoveMeal,
  onSaveMealAsTemplate,
  onSaveDayAsTemplate,
  onRemoveDay,
  onRemoveWeek,
  onSaveWeekAsTemplate,
  onCreateNewFood,
  isAdmin = false,
  expandedDays,
  expandedMeals,
  onToggleDay,
  onToggleMeal,
  enableDragDrop = false,
  draggable = false,
  dragId,
  dragData,
}: WeekCardProps) {

  const t = useTranslations('nutrition');

  // Memoize day drag IDs
  const dayDragIds = useMemo(
    () => week.days?.map((day: NutritionDay) => createNutritionDayDragId(week.weekNumber, day.dayNumber)) || [],
    [week.days, week.weekNumber]
  );

  const renderCard = (dragProps?: SortableItemRenderProps) => {
    const isDragging = dragProps?.isDragging || false;

    return (
      <div
        ref={dragProps?.setNodeRef}
        style={dragProps?.style}
        className={cn(
          'overflow-hidden rounded-3xl border transition-all duration-300',
          'bg-neutral-900/30 backdrop-blur-sm',
          'border-neutral-800/50',
          'hover:border-neutral-700 hover:bg-neutral-900/40',
          isDragging ? 'scale-[0.97] rotate-1 opacity-60 shadow-md ring-2 ring-primary-500/30' : ''
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between',
            'border-neutral-800/50',
            'bg-neutral-900/50'
          )}
        >
          <div className="flex items-center gap-4">
            {draggable && (
              <div
                {...(dragProps?.attributes || {})}
                {...(dragProps?.listeners || {})}
                className={cn(
                  '-ml-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-lg transition-all duration-200 active:cursor-grabbing',
                  'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800'
                )}
                aria-label={t('ariaLabels.dragWeek')}
              >
                <GripVertical
                  className="h-6 w-6"
                />
              </div>
            )}
            <Button
              variant="ghost"
              onClick={onToggle}
              className={cn(
                '-mx-2 h-auto flex items-center gap-3 rounded-xl px-3 py-2 text-left text-lg font-bold transition-all hover:bg-neutral-800/50 group whitespace-normal'
              )}
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">{t('viewer.labels.week')}</span>
                <span className="text-3xl font-black text-white">{week.weekNumber}</span>
              </div>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onAddDay}
              className={cn(
                'min-h-[40px] px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 border border-emerald-500/20'
              )}
            >
              <Plus className="h-4 w-4 flex-shrink-0 mr-2" />
              <span>{t('viewer.labels.day')}</span>
            </Button>
            {onAddDayFromTemplate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddDayFromTemplate}
                className={cn(
                  'min-h-[40px] px-5 py-2 text-xs font-bold text-neutral-400 bg-neutral-800 border-neutral-700 hover:border-neutral-600 hover:text-white hover:bg-neutral-700'
                )}
                title={t('templates.title')}
              >
                <BookOpen className="h-4 w-4 flex-shrink-0 mr-2" />
                <span>Template</span>
              </Button>
            )}
            {week.days && week.days.length > 0 && onSaveWeekAsTemplate && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onSaveWeekAsTemplate();
                }}
                className={cn(
                  'min-h-[40px] w-10 text-neutral-400 bg-neutral-800 border-neutral-700 hover:border-neutral-600 hover:text-white hover:bg-neutral-700'
                )}
                title={t('saveAsTemplate.week')}
              >
                <Bookmark className="h-4 w-4 flex-shrink-0" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveWeek}
              className={cn(
                'min-h-[40px] min-w-[40px] text-neutral-600 hover:text-red-400 hover:bg-red-500/10'
              )}
              aria-label={t('ariaLabels.removeWeek')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className={cn('animate-in fade-in slide-in-from-top-2 space-y-3 p-4 duration-200')}>
            {!week.days || week.days.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
                <p className="text-neutral-500 font-medium">
                  {t('emptyStates.noDays')}
                </p>
                <div className="mt-4">
                  <span className="text-xs text-neutral-600">Start by adding a day to your plan</span>
                </div>
              </div>
            ) : enableDragDrop ? (
              <SortableList items={dayDragIds} strategy="vertical">
                {week.days.map((day, index) => {
                  const dayKey = `${week.weekNumber}-${day.dayNumber}`;
                  return (
                    <DayCard
                      key={dayKey}
                      day={day}
                      weekNumber={week.weekNumber}
                      isExpanded={expandedDays.has(dayKey)}
                      onToggle={() => onToggleDay(dayKey)}
                      onAddMeal={() => onDayAddMeal(day.dayNumber)}
                      onAddMealFromTemplate={onDayAddMealFromTemplate}
                      onMealNameChange={(mealId, name) =>
                        onMealNameChange(day.dayNumber, mealId, name)
                      }
                      onAddFood={(mealId) => onAddFood(day.dayNumber, mealId)}
                      onAddFoodFromCatalog={(mealId, foodItem) =>
                        onAddFoodFromCatalog(day.dayNumber, mealId, foodItem)
                      }
                      onFoodQuantityChange={(mealId, foodId, quantity) =>
                        onFoodQuantityChange(day.dayNumber, mealId, foodId, quantity)
                      }
                      onRemoveFood={(mealId, foodId) => onRemoveFood(day.dayNumber, mealId, foodId)}
                      onOpenFoodDetails={onOpenFoodDetails}
                      onRemoveMeal={(mealId) => onRemoveMeal(day.dayNumber, mealId)}
                      onSaveMealAsTemplate={
                        onSaveMealAsTemplate
                          ? (mealId) => onSaveMealAsTemplate(day.dayNumber, mealId)
                          : undefined
                      }
                      onSaveDayAsTemplate={
                        onSaveDayAsTemplate ? () => onSaveDayAsTemplate(day.dayNumber) : undefined
                      }
                      onRemoveDay={() => onRemoveDay(day.dayNumber)}
                      onCreateNewFood={onCreateNewFood}
                      isAdmin={isAdmin}
                      expandedMeals={expandedMeals}
                      onToggleMeal={onToggleMeal}
                      enableDragDrop={enableDragDrop}
                      draggable={enableDragDrop}
                      dragId={dayDragIds[index]}
                      dragData={{
                        weekNumber: week.weekNumber,
                        dayNumber: day.dayNumber,
                      }}
                    />
                  );
                })}
              </SortableList>
            ) : (
              week.days.map((day: NutritionDay) => {
                const dayKey = `${week.weekNumber}-${day.dayNumber}`;
                return (
                  <DayCard
                    key={dayKey}
                    day={day}
                    weekNumber={week.weekNumber}
                    isExpanded={expandedDays.has(dayKey)}
                    onToggle={() => onToggleDay(dayKey)}
                    onAddMeal={() => onDayAddMeal(day.dayNumber)}
                    onAddMealFromTemplate={onDayAddMealFromTemplate}
                    onMealNameChange={(mealId, name) =>
                      onMealNameChange(day.dayNumber, mealId, name)
                    }
                    onAddFood={(mealId) => onAddFood(day.dayNumber, mealId)}
                    onAddFoodFromCatalog={(mealId, foodItem) =>
                      onAddFoodFromCatalog(day.dayNumber, mealId, foodItem)
                    }
                    onFoodQuantityChange={(mealId, foodId, quantity) =>
                      onFoodQuantityChange(day.dayNumber, mealId, foodId, quantity)
                    }
                    onRemoveFood={(mealId, foodId) => onRemoveFood(day.dayNumber, mealId, foodId)}
                    onOpenFoodDetails={onOpenFoodDetails}
                    onRemoveMeal={(mealId) => onRemoveMeal(day.dayNumber, mealId)}
                    onSaveMealAsTemplate={
                      onSaveMealAsTemplate
                        ? (mealId) => onSaveMealAsTemplate(day.dayNumber, mealId)
                        : undefined
                    }
                    onSaveDayAsTemplate={
                      onSaveDayAsTemplate ? () => onSaveDayAsTemplate(day.dayNumber) : undefined
                    }
                    onRemoveDay={() => onRemoveDay(day.dayNumber)}
                    onCreateNewFood={onCreateNewFood}
                    isAdmin={isAdmin}
                    expandedMeals={expandedMeals}
                    onToggleMeal={onToggleMeal}
                    enableDragDrop={enableDragDrop}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // If draggable, wrap with SortableItem
  if (draggable && dragId) {
    return (
      <SortableItem id={dragId} data={dragData}>
        {(dragProps) => renderCard(dragProps)}
      </SortableItem>
    );
  }

  // Otherwise, render directly
  return renderCard();
}
