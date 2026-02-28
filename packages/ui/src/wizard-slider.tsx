/**
 * WizardSlider - Premium Range Slider Component
 *
 * A styled range slider with value display, min/max labels, and consistent dark mode support.
 */

'use client';

import { cn } from '@giulio-leone/lib-design-system';

export interface WizardSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  minLabel?: string;
  maxLabel?: string;
  description?: string;
  className?: string;
  color?: 'blue' | 'green' | 'purple';
}

export function WizardSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueLabel,
  minLabel,
  maxLabel,
  description,
  className,
  color = 'green',
}: WizardSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const colorClasses = {
    blue: {
      track: 'from-blue-500 to-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
      thumb: 'accent-blue-600',
    },
    green: {
      track: 'from-emerald-500 to-green-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      thumb: 'accent-emerald-600',
    },
    purple: {
      track: 'from-purple-500 to-indigo-500',
      text: 'text-purple-600 dark:text-purple-400',
      thumb: 'accent-purple-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{label}</h4>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-xl font-bold tabular-nums', colors.text)}>{value}</span>
          {valueLabel && (
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {valueLabel}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Track background */}
        <div className="pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center">
          {/* Track Background */}
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800/80" />

          {/* Filled Track - Gradient */}
          <div
            className={cn(
              'absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-150',
              colors.track
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Native range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
          className={cn(
            'relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-neutral-200',
            '[&::-webkit-slider-thumb]:dark:border-neutral-600',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-thumb]:active:scale-95',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-neutral-200',
            '[&::-moz-range-thumb]:dark:border-neutral-600',
            '[&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
            '[&::-webkit-slider-runnable-track]:bg-transparent',
            '[&::-moz-range-track]:bg-transparent'
          )}
        />
      </div>

      <div className="flex justify-between text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
        <span>{minLabel || min}</span>
        <span>{maxLabel || max}</span>
      </div>

      {description && (
        <p className="text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
