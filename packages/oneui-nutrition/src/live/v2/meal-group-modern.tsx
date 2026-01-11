'use client';

import { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import type { Meal } from '@onecoach/types-nutrition';
import type { FoodSwap } from '@onecoach/schemas';
import { LiveFoodItemModern } from './live-food-item-modern';

export interface MealGroupModernProps {
  meal: Meal;
  index: number;
  onToggleFood: (foodIndex: number, isDone: boolean) => void;
  onSwapFood?: (foodIndex: number, swap: FoodSwap) => void;
  availableSwaps?: FoodSwap[];
  readOnly?: boolean;
}

export function MealGroupModern({
  meal,
  index,
  onToggleFood,
  onSwapFood,
  availableSwaps = [],
  readOnly = false
}: MealGroupModernProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = meal.foods?.filter(f => f.done).length || 0;
  const totalCount = meal.foods?.length || 0;
  const isFullyCompleted = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // Quick macros
  const macros = meal.totalMacros || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <div className={cn(
      "group rounded-3xl border transition-all duration-300 overflow-hidden relative",
      isFullyCompleted 
        ? "bg-slate-900/40 border-slate-700/50 shadow-lg shadow-black/20" 
        : "bg-slate-900/60 backdrop-blur-xl border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-black/50"
    )}>
       {/* Header */}
       <button 
         onClick={() => setIsExpanded(!isExpanded)}
         className="w-full text-left p-5 flex items-start justify-between"
       >
          <div className="flex items-start gap-4">
             {/* Icon */}
             <div className={cn(
               "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
               isFullyCompleted 
                 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                 : "bg-slate-800 border border-slate-700 text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30"
             )}>
                <Utensils className="w-5 h-5" />
             </div>

             <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                     {meal.time || `Meal ${index + 1}`}
                   </span>
                   {isFullyCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/10">
                         Done
                      </span>
                   )}
                </div>
                <h3 className={cn(
                  "text-xl font-black text-white mb-2 transition-colors tracking-tight", 
                  isFullyCompleted && "text-emerald-400"
                )}>
                   {meal.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                   <span className="text-slate-400 font-medium">
                     {Math.round(macros.calories)} kcal
                   </span>
                   <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">
                        {Math.round(macros.protein)}P
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/20">
                        {Math.round(macros.carbs)}C
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/20">
                        {Math.round(macros.fats)}F
                      </span>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Progress indicator */}
             {!isFullyCompleted && totalCount > 0 && (
               <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 text-xs font-medium text-neutral-400">
                 <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                   <div 
                     className="h-full bg-emerald-500 transition-all duration-500"
                     style={{ width: `${progress}%` }}
                   />
                 </div>
                 <span>{completedCount}/{totalCount}</span>
               </div>
             )}

             {/* Chevron */}
             <div className={cn(
                "h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 transition-all duration-300 group-hover:border-emerald-500/20 group-hover:text-emerald-400",
                isExpanded && "rotate-180 bg-white/10"
             )}>
                <ChevronDown className="w-4 h-4" />
             </div>
          </div>
       </button>

       <div className={cn(
          "transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
       )}>
          <div className="px-1 pb-1 pt-0 space-y-1">
             {meal.foods?.map((food, idx) => {
                const foodSwaps = availableSwaps.filter(s => s.original === food.name);
                return (
                   <LiveFoodItemModern
                      key={idx}
                      food={food}
                      variants={foodSwaps}
                      onToggle={(val) => onToggleFood(idx, val)}
                      onSwap={onSwapFood ? (swap) => onSwapFood(idx, swap) : undefined}
                      readOnly={readOnly}
                   />
                );
             })}

             {(!meal.foods || meal.foods.length === 0) && (
                <div className="mx-4 my-4 py-8 text-center text-neutral-500 text-sm font-medium border-2 border-dashed border-white/5 rounded-xl">
                   No foods added yet.
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
