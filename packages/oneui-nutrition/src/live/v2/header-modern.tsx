'use client';

import { useLocale } from 'next-intl';

import { ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';

export interface LiveNutritionHeaderModernProps {
  planName?: string;
  currentDate: Date;
  isToday: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onBack: () => void;
  progress: number; // 0-100
  className?: string;
}

export function LiveNutritionHeaderModern({
  planName = 'Nutrition Plan',
  currentDate,
  isToday,
  onPreviousDay,
  onNextDay,
  onBack,
  progress,
  className
}: LiveNutritionHeaderModernProps) {
  const locale = useLocale();

  return (
    <div className={cn(
      "sticky top-0 z-40 w-full border-b border-white/5 bg-neutral-900/80 backdrop-blur-xl",
      className
    )}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Left: Back & Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white md:text-base truncate max-w-[150px] md:max-w-xs">
              {planName}
            </h1>
            <p className="text-xs font-medium text-neutral-500">
              Nutrition Diary
            </p>
          </div>
        </div>

        {/* Center: Date Navigation (Visible on tablet+) */}
        <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl p-1 md:flex">
          <button
            onClick={onPreviousDay}
            className="rounded-lg p-2 text-neutral-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 px-3">
            <Calendar className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-white capitalize">
              {currentDate.toLocaleDateString(locale, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            {isToday && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400 uppercase border border-emerald-500/10">
                Today
              </span>
            )}
          </div>

          <button
            onClick={onNextDay}
            className="rounded-lg p-2 text-neutral-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Progress Pill */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "hidden sm:flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all",
            progress >= 100 
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10" 
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          )}>
            <CheckCircle2 className={cn("h-3.5 w-3.5", progress >= 100 && "animate-pulse")} />
            <span className="font-mono text-sm font-bold tabular-nums tracking-wider">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
