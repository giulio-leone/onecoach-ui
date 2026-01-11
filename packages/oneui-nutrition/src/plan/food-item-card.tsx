'use client';

import { useTranslations } from 'next-intl';
/**
 * FoodItemCard Component
 *
 * Card per visualizzare e modificare un alimento
 * Design moderno, touch-friendly, mobile-first
 * Supporta drag and drop opzionale per riordinamento
 */

import { useState, memo, useCallback, useLayoutEffect } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { MacroDisplay } from './macro-display';
import { SortableItem, type SortableItemRenderProps } from '@onecoach/ui-core';
import { cn } from '@onecoach/lib-design-system';
import type { Food } from "@onecoach/types-nutrition";

interface FoodItemCardProps {
  food: Food;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onOpenDetails?: () => void;
  className?: string;
  // Drag and drop props (optional)
  draggable?: boolean;
  dragId?: string;
  dragData?: Record<string, unknown>;
}

// OPTIMIZATION: Wrap with React.memo to prevent unnecessary re-renders
// Only re-render when food data or drag props actually change
export const FoodItemCard = memo(function FoodItemCard({
  food,
  onQuantityChange,
  onRemove,
  onOpenDetails,
  className = '',
  draggable = false,
  dragId,
  dragData,
}: FoodItemCardProps) {
  const canOpenDetails = onOpenDetails && food.foodItemId && food.foodItemId !== `temp-${food.id}`;

  // Derive display value from food.quantity
  const getDisplayValue = useCallback((qty: number | undefined) => {
    if (qty === 0 || qty === undefined) return '';
    // Remove leading zeros and keep decimals
    return qty.toString().replace(/^0+(?=\d)/, '');
  }, []);

  const [quantityDisplay, setQuantityDisplay] = useState<string>(() =>
    getDisplayValue(food.quantity)
  );

  // Sync input value when food.quantity changes externally
  // quantityDisplay is intentionally used in condition but not as dependency to avoid loops
  useLayoutEffect(() => {
    const newDisplay = getDisplayValue(food.quantity);
    if (quantityDisplay !== newDisplay && document.activeElement?.tagName !== 'INPUT') {
      // Only update if not currently editing
      setQuantityDisplay(newDisplay);
    }
    // quantityDisplay is intentionally used in condition but not in dependencies to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [food.quantity, getDisplayValue]);

  const t = useTranslations('nutrition');

  // Render function for the card content
  const renderCard = (dragProps?: SortableItemRenderProps) => {

    const isDragging = dragProps?.isDragging || false;

    return (
      <div
        ref={dragProps?.setNodeRef}
        style={dragProps?.style}
        className={cn(
          'group cursor-pointer touch-manipulation rounded-xl border border-transparent p-3 transition-all duration-200',
          'bg-neutral-900/40 hover:bg-neutral-800/60',
          'border-neutral-800/50 hover:border-emerald-500/20',
          isDragging ? 'scale-[0.97] opacity-60 bg-neutral-800 border-emerald-500/30' : '',
          className
        )}
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          if (canOpenDetails) {
            e.stopPropagation();
            onOpenDetails?.();
          }
        }}
        role={canOpenDetails ? 'button' : undefined}
        tabIndex={canOpenDetails ? 0 : undefined}
        aria-label={
          canOpenDetails ? `Visualizza dettagli di ${food.name || 'alimento'}` : undefined
        }
        onKeyDown={(e) => {
          if (canOpenDetails && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            e.stopPropagation();
            onOpenDetails?.();
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div
            {...(dragProps?.attributes || {})}
            {...(dragProps?.listeners || {})}
            className={cn(
              'flex-shrink-0 text-neutral-600 transition-colors group-hover:text-neutral-400',
              draggable &&
                cn(
                  'cursor-grab active:cursor-grabbing hover:text-white'
                )
            )}
            aria-label={draggable ? 'Trascina per riordinare' : undefined}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
                 <input
                  type="text"
                  value={food.name || ''}
                  readOnly
                  className={cn(
                    'w-full cursor-default border-0 bg-transparent p-0 font-medium transition-colors duration-200 focus:ring-0 focus:outline-none',
                    'text-neutral-200 group-hover:text-white truncate text-sm'
                  )}
                  placeholder={t('nutrition.food_item_card.nome_alimento')}
                />
            </div>
            
            <div className="flex items-center gap-3 text-xs text-neutral-400">
               <div className="flex items-center gap-1 bg-neutral-800/50 rounded-md px-1.5 py-0.5 border border-neutral-700/50 group-focus-within:border-emerald-500/50 group-focus-within:bg-neutral-800 group-focus-within:ring-1 group-focus-within:ring-emerald-500/20 transition-all">
                <input
                  type="text"
                  inputMode="decimal"
                  value={quantityDisplay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let inputValue = e.target.value;
                    inputValue = inputValue.replace(/^0+(?=\d)/, '');
                    inputValue = inputValue.replace(/[^0-9.]/g, '');
                    const parts = inputValue.split('.');
                    if (parts.length > 2) {
                      inputValue = parts[0] + '.' + parts.slice(1).join('');
                    }
                    setQuantityDisplay(inputValue);
                    const numValue = parseFloat(inputValue);
                    if (!isNaN(numValue) && numValue >= 0) {
                      onQuantityChange(numValue);
                    } else if (inputValue === '' || inputValue === '.') {
                      onQuantityChange(0);
                    }
                  }}
                  onBlur={(_e) => {
                    const numValue = parseFloat(quantityDisplay);
                    if (isNaN(numValue) || numValue < 0) {
                      setQuantityDisplay(
                        food.quantity === 0 ? '' : food.quantity.toString().replace(/^0+(?=\d)/, '')
                      );
                    } else {
                      setQuantityDisplay(numValue.toString().replace(/^0+(?=\d)/, ''));
                    }
                  }}
                  onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="w-12 bg-transparent text-right text-neutral-200 focus:outline-none font-medium placeholder:text-neutral-600"
                  placeholder="0"
                />
                <span className="text-neutral-500 font-medium">{food.unit || 'g'}</span>
              </div>

              <div className="h-3 w-px bg-neutral-700" />
              
              <MacroDisplay
                macros={food.macros || { calories: 0, protein: 0, carbs: 0, fats: 0 }}
                variant="inline"
              />
            </div>
          </div>
          
          <button
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'flex min-h-[28px] min-w-[28px] flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100',
              'text-neutral-500 hover:text-red-400 hover:bg-red-500/10'
            )}
            aria-label="Rimuovi alimento"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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
