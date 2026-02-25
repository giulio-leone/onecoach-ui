/**
 * MealCard Component
 *
 * Card per visualizzare e modificare un pasto
 * Include header, macro summary, lista alimenti, azioni
 * Supporta drag and drop per riordinamento alimenti
 */

'use client';

import { useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Bookmark, GripVertical } from 'lucide-react';
import { FoodItemCard } from './food-item-card';
import { FoodComboboxSection } from './food-combobox-section';
import { SortableList, SortableItem } from '../../core';
import { type SortableItemRenderProps } from '../../core/components/dnd/sortable-item';
import { createFoodDragId } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';
import type { Meal } from "@giulio-leone/types/nutrition";
import type { FoodItem } from "@giulio-leone/types/nutrition";

interface MealCardProps {
  meal: Meal;
  dayNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
  onNameChange: (name: string) => void;
  onAddFood: () => void;
  onAddFoodFromCatalog: (foodItem: FoodItem) => void;
  onFoodQuantityChange: (foodId: string, quantity: number) => void;
  onRemoveFood: (foodId: string) => void;
  onOpenFoodDetails?: (foodId: string) => void;
  onRemoveMeal: () => void;
  onSaveAsTemplate?: () => void;
  onCreateNewFood?: () => void;
  isAdmin?: boolean;
  // Drag and drop support
  enableDragDrop?: boolean;
  draggable?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
}

// OPTIMIZATION: Wrap with React.memo to prevent unnecessary re-renders
export const MealCard = memo(function MealCard({
  meal,
  dayNumber,
  isExpanded,
  onToggle,
  onNameChange,
  onAddFood,
  onAddFoodFromCatalog,
  onFoodQuantityChange,
  onRemoveFood,
  onOpenFoodDetails,
  onRemoveMeal,
  onSaveAsTemplate,
  onCreateNewFood,
  isAdmin = false,
  enableDragDrop = false,
  draggable = false,
  dragId,
  dragData,
}: MealCardProps) {

  // OPTIMIZATION: Memoize drag IDs to prevent recalculation on every render
  const foodDragIds = useMemo(
    () => meal.foods.map((food) => createFoodDragId(dayNumber, meal.id, food.id)),
    [meal.foods, meal.id, dayNumber]
  );

  // OPTIMIZATION: Memoize render function to prevent recreation on every render
  // Render food items (DRY - single render function)
  const renderFoodItems = useCallback(
    () =>
      meal.foods.map((food, index) => (
        <FoodItemCard
          key={food.id}
          food={food}
          onQuantityChange={(quantity) => onFoodQuantityChange(food.id, quantity)}
          onRemove={() => onRemoveFood(food.id)}
          onOpenDetails={
            onOpenFoodDetails && food.foodItemId && food.foodItemId !== `temp-${food.id}`
              ? () => onOpenFoodDetails(food.foodItemId!)
              : undefined
          }
          draggable={enableDragDrop}
          dragId={enableDragDrop ? foodDragIds[index] : undefined}
          dragData={
            enableDragDrop
              ? {
                  dayNumber,
                  mealId: meal.id,
                  foodId: food.id,
                }
              : undefined
          }
        />
      )),
    [
      meal.foods,
      meal.id,
      dayNumber,
      enableDragDrop,
      foodDragIds,
      onFoodQuantityChange,
      onRemoveFood,
      onOpenFoodDetails,
    ]
  );

  const t = useTranslations('nutrition');

  // Render function for the card content
  const renderCard = (dragProps?: SortableItemRenderProps) => {
    const isDragging = dragProps?.isDragging || false;

    return (
      <div
        ref={dragProps?.setNodeRef}
        style={dragProps?.style}
        className={cn(
          'overflow-hidden rounded-2xl border transition-all duration-300',
          'bg-slate-900/50 backdrop-blur-xl',
          'border-slate-800',
          'hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/10',
          isDragging ? 'scale-[0.97] rotate-1 opacity-60 shadow-md ring-2 ring-emerald-500/30' : ''
        )}

      >
        <div
          className={cn(
            'flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between',
            'border-slate-800',
            'bg-transparent'
          )}

        >
          <div className="flex items-center gap-3">
            {draggable && (
              <div
                {...(dragProps?.attributes || {})}
                {...(dragProps?.listeners || {})}
                className={cn(
                  '-ml-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 cursor-grab touch-manipulation items-center justify-center rounded-lg transition-all duration-200 active:cursor-grabbing',
                  'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
                )}
                aria-label={t('ariaLabels.dragMeal')}
              >
                <GripVertical className="h-5 w-5" />
              </div>
            )}
            <button
              onClick={onToggle}
              className={cn(
                                '-mx-2 flex items-center gap-2 rounded-lg px-2 font-medium text-slate-200 transition-colors hover:text-white group'
              )}
            >
              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-500 transition-colors group-hover:text-slate-300" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-500 transition-colors group-hover:text-slate-300" />
              )}
              <input
                type="text"
                value={meal.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
                onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                className={cn(
                                    'border-0 bg-transparent transition-colors duration-200 focus:ring-0 focus:outline-none placeholder:text-slate-600',
                  'text-lg font-semibold text-slate-100'
                )}
                placeholder={t('placeholders.mealName')}
              />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={cn(
                                'flex items-center gap-2 rounded-md px-2.5 py-1',
                'bg-slate-800 border border-slate-700/50'
              )}
            >
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {Math.round(meal.totalMacros.calories)} <span className="text-slate-500">kcal</span>
              </span>
            </div>
            
                        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={onAddFood}
                className={cn(
                  'flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20'
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('viewer.labels.foods')}</span>
              </button>
              
              {meal.foods.length > 0 && onSaveAsTemplate && (
                <button
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    onSaveAsTemplate();
                  }}
                  className={cn(
                                        'flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                  title={t('saveAsTemplate.meal')}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                </button>
              )}
              
              <button
                onClick={onRemoveMeal}
                className={cn(
                  'flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg transition-all duration-200',
                                    'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                )}
                aria-label={t('ariaLabels.removeMeal')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={cn('animate-in fade-in slide-in-from-top-2 space-y-2 p-3 duration-200')}>
            <FoodComboboxSection
              onSelect={onAddFoodFromCatalog}
              onCreateNew={onCreateNewFood}
              isAdmin={isAdmin}
            />

            {meal.foods.length === 0 ? (
                            <p className="text-center text-sm text-slate-500">
                {t('emptyStates.noFoods')}
              </p>
            ) : enableDragDrop ? (
              <SortableList items={foodDragIds} strategy="vertical">
                {renderFoodItems()}
              </SortableList>
            ) : (
              renderFoodItems()
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
});
