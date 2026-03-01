/**
 * DayCard Component
 *
 * Card per visualizzare e modificare un giorno
 * Include header, lista pasti, azioni
 */

'use client';

import { useMemo } from 'react';
import { Trash2, GripVertical, Plus, BookOpen, Bookmark } from 'lucide-react';
import { MealCard } from './meal-card';
import { SortableList, SortableItem, type SortableItemRenderProps, Button } from '@giulio-leone/ui';
import { createMealDragId } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';
import type { NutritionDay, Meal } from "@giulio-leone/types/nutrition";
import type { FoodItem } from "@giulio-leone/types/nutrition";

interface DayCardProps {
  day: NutritionDay;
  weekNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  onAddMeal: () => void;
  onAddMealFromTemplate?: () => void;
  onMealNameChange: (mealId: string, name: string) => void;
  onAddFood: (mealId: string) => void;
  onAddFoodFromCatalog: (mealId: string, foodItem: FoodItem) => void;
  onFoodQuantityChange: (mealId: string, foodId: string, quantity: number) => void;
  onRemoveFood: (mealId: string, foodId: string) => void;
  onOpenFoodDetails?: (foodId: string) => void;
  onRemoveMeal: (mealId: string) => void;
  onSaveMealAsTemplate?: (mealId: string) => void;
  onSaveDayAsTemplate?: () => void;
  onRemoveDay: () => void;
  onCreateNewFood?: () => void;
  isAdmin?: boolean;
  expandedMeals: Set<string>;
  onToggleMeal: (mealKey: string) => void;
  enableDragDrop?: boolean;
  draggable?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
}

export function DayCard({
  day,
  weekNumber: _weekNumber,
  isExpanded,
  onToggle,
  onAddMeal,
  onAddMealFromTemplate,
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
  onCreateNewFood,
  isAdmin = false,
  expandedMeals,
  onToggleMeal,
  enableDragDrop = false,
  draggable = false,
  dragId,
  dragData,
}: DayCardProps) {

  // Memoize meal drag IDs
  // Memoize meal drag IDs
  const mealDragIds = useMemo(
    () => day.meals.map((meal: Meal) => createMealDragId(day.dayNumber, meal.id)),
    [day.meals, day.dayNumber]
  );
  
  const t = useTranslations('nutrition');

  const renderCard = (dragProps?: SortableItemRenderProps) => {
    const isDragging = dragProps?.isDragging || false;

    return (
      <div
        ref={dragProps?.setNodeRef}
        style={dragProps?.style}
        className={cn(
          'overflow-hidden rounded-2xl border transition-all duration-300',
          'bg-neutral-900/40 backdrop-blur-xl',
          'border-neutral-800',
          'hover:border-neutral-700',
          isDragging ? 'scale-[0.97] rotate-1 opacity-60 shadow-md ring-2 ring-primary-500/30' : ''
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between',
            'border-neutral-800',
            'bg-neutral-900/60'
          )}
        >
          <div className="flex items-center gap-3">
            {draggable && (
              <div
                {...(dragProps?.attributes || {})}
                {...(dragProps?.listeners || {})}
                className={cn(
                  '-ml-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-lg transition-all duration-200 active:cursor-grabbing',
                  'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800/50'
                )}
                aria-label={t('ariaLabels.dragDay')}
              >
                <GripVertical
                  className="h-5 w-5"
                />
              </div>
            )}
            <Button
              variant="ghost"
              onClick={onToggle}
              className={cn(
                '-mx-2 flex items-center gap-2 rounded-lg px-2 text-lg font-bold tracking-tight text-white transition-colors hover:text-emerald-400 hover:bg-neutral-800/50'
              )}
            >
              <span className="uppercase text-neutral-500 text-xs font-bold tracking-widest">{t('viewer.labels.day')}</span>
              <span className="text-xl">{day.dayNumber}</span>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onAddMeal}
              className={cn(
                'gap-1.5 px-3.5 text-xs font-semibold whitespace-nowrap bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
              )}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span>{t('visualBuilder.dayEditor.mealPrefix')}</span>
            </Button>
            {onAddMealFromTemplate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMealFromTemplate}
                className={cn(
                  'gap-1.5 px-3.5 text-xs font-semibold whitespace-nowrap border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                )}
                title={t('visualBuilder.dayEditor.loadFromTemplate')}
              >
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span>Template</span>
              </Button>
            )}
            {day.meals.length > 0 && onSaveDayAsTemplate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onSaveDayAsTemplate();
                }}
                className={cn(
                  'h-9 w-9 text-neutral-400 hover:text-white hover:bg-neutral-800'
                )}
                title={t('saveAsTemplate.day')}
              >
                <Bookmark className="h-4 w-4 flex-shrink-0" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveDay}
              className={cn(
                'h-9 w-9 text-neutral-500 hover:text-red-400 hover:bg-red-500/10'
              )}
              aria-label={t('ariaLabels.removeDay')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className={cn('animate-in fade-in slide-in-from-top-2 space-y-4 p-4 duration-300')}>
            {day.meals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                <p className="text-neutral-500 font-medium">
                  {t('emptyStates.noMeals')}
                </p>
                <Button 
                  variant="ghost"
                  onClick={onAddMeal}
                  className="mt-4 text-emerald-500 hover:text-emerald-400 text-sm font-semibold hover:bg-transparent p-0"
                >
                  {t('visualBuilder.dayEditor.mealPrefix')}
                </Button>
              </div>
            ) : enableDragDrop ? (
              <SortableList items={mealDragIds} strategy="vertical">
                {day.meals.map((meal, index) => {
                  const mealKey = `${day.dayNumber}-${meal.id}`;
                  return (
                    <MealCard
                      key={mealKey}
                      meal={meal}
                      dayNumber={day.dayNumber}
                      isExpanded={expandedMeals.has(mealKey)}
                      onToggle={() => onToggleMeal(mealKey)}
                      onNameChange={(name) => onMealNameChange(meal.id, name)}
                      onAddFood={() => onAddFood(meal.id)}
                      onAddFoodFromCatalog={(foodItem) => onAddFoodFromCatalog(meal.id, foodItem)}
                      onFoodQuantityChange={(foodId, quantity) =>
                        onFoodQuantityChange(meal.id, foodId, quantity)
                      }
                      onRemoveFood={(foodId) => onRemoveFood(meal.id, foodId)}
                      onOpenFoodDetails={onOpenFoodDetails}
                      onRemoveMeal={() => onRemoveMeal(meal.id)}
                      onSaveAsTemplate={
                        onSaveMealAsTemplate ? () => onSaveMealAsTemplate(meal.id) : undefined
                      }
                      onCreateNewFood={onCreateNewFood}
                      isAdmin={isAdmin}
                      enableDragDrop={enableDragDrop}
                      draggable={enableDragDrop}
                      dragId={mealDragIds[index]}
                      dragData={{
                        dayNumber: day.dayNumber,
                        mealId: meal.id,
                      }}
                    />
                  );
                })}
              </SortableList>
            ) : (
              day.meals.map((meal: Meal) => {
                const mealKey = `${day.dayNumber}-${meal.id}`;
                return (
                  <MealCard
                    key={mealKey}
                    meal={meal}
                    dayNumber={day.dayNumber}
                    isExpanded={expandedMeals.has(mealKey)}
                    onToggle={() => onToggleMeal(mealKey)}
                    onNameChange={(name) => onMealNameChange(meal.id, name)}
                    onAddFood={() => onAddFood(meal.id)}
                    onAddFoodFromCatalog={(foodItem) => onAddFoodFromCatalog(meal.id, foodItem)}
                    onFoodQuantityChange={(foodId, quantity) =>
                      onFoodQuantityChange(meal.id, foodId, quantity)
                    }
                    onRemoveFood={(foodId) => onRemoveFood(meal.id, foodId)}
                    onOpenFoodDetails={onOpenFoodDetails}
                    onRemoveMeal={() => onRemoveMeal(meal.id)}
                    onSaveAsTemplate={
                      onSaveMealAsTemplate ? () => onSaveMealAsTemplate(meal.id) : undefined
                    }
                    onCreateNewFood={onCreateNewFood}
                    isAdmin={isAdmin}
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
