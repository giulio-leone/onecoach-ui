'use client';

import { useState } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import type { Food } from '@giulio-leone/types/nutrition';
import type { FoodSwap } from '@giulio-leone/schemas';
import { ScaleTouch } from '../../../core';

export interface LiveFoodItemModernProps {
  food: Food;
  variants?: FoodSwap[];
  onToggle: (val: boolean) => void;
  onSwap?: (swap: FoodSwap) => void;
  readOnly?: boolean;
}

export function LiveFoodItemModern({
  food,
  variants = [],
  onToggle,
  onSwap,
  readOnly = false
}: LiveFoodItemModernProps) {
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = !!food.done;
  const hasVariants = variants.length > 0;

  return (
    <div className={cn(
      "group relative flex items-center justify-between py-4 px-4 mx-2 border-b border-slate-800/50 last:border-0 transition-all duration-200",
      isCompleted 
        ? "opacity-50" 
        : "hover:bg-slate-800/50"
    )}>

       <div className="flex items-center gap-4 flex-1">
          {!readOnly && (
            <ScaleTouch onClick={() => onToggle(!isCompleted)} scale={0.9}>
               <div className={cn(
                 "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                 isCompleted
                   ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                   : "border-slate-600 bg-slate-800/50 text-transparent group-hover:border-emerald-400"
               )}>
                  {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
               </div>
            </ScaleTouch>
          )}
          
          <div className="flex-1 min-w-0">
             <div className={cn(
               "text-lg font-bold transition-all truncate",
               isCompleted ? "text-neutral-500 line-through" : "text-white group-hover:text-emerald-300"
             )}>
               {food.name}
             </div>
             <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-3">
                <span className={cn("transition-colors", !isCompleted && "text-slate-400")}>
                  {food.quantity} {food.unit}
                </span>
                <span className={cn("transition-colors", !isCompleted && "text-slate-400")}>
                  {Math.round(food.macros?.calories || 0)} kcal
                </span>
                
                {food.macros && (
                  <div className="flex items-center gap-2 ml-1">
                    <span className="text-blue-400">{Math.round(food.macros.protein)}P</span>
                    <span className="text-amber-400">{Math.round(food.macros.carbs)}C</span>
                    <span className="text-rose-400">{Math.round(food.macros.fats)}F</span>
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* Actions */}
       {!readOnly && hasVariants && !isCompleted && onSwap && (
          <div className="relative">
             <button 
               onClick={() => setShowMenu(!showMenu)}
               className="p-2 -mr-2 text-neutral-600 hover:text-emerald-400 transition-all hover:bg-white/10 rounded-lg active:scale-95"
             >
                <RefreshCw className="w-4 h-4" />
             </button>

             {/* Dropdown */}
             {showMenu && (
               <>
                 <div className="fixed inset-0 z-10 cursor-default" onClick={() => setShowMenu(false)} />
                 <div className="absolute right-0 top-full mt-2 w-64 z-20 rounded-xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-2 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Alternatives</div>
                    {variants.map((v, idx) => (
                       <button
                         key={idx}
                         onClick={(e) => {
                            e.stopPropagation();
                            onSwap(v);
                            setShowMenu(false);
                         }}
                         className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-all flex flex-col gap-1 active:scale-[0.98]"
                       >
                          <div className="text-xs font-bold text-white">{v.alternative}</div>
                          <div className="text-[10px] text-neutral-400">{v.reason}</div>
                       </button>
                    ))}
                 </div>
               </>
             )}
          </div>
       )}
    </div>
  );
}
