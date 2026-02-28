'use client';

import * as React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
}

export function Slider({ value, min, max, step, onValueChange, disabled, className }: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)]);
  };

  return (
    <div className={cn('relative flex w-full touch-none items-center select-none', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 dark:bg-white/[0.08]',
          'accent-primary focus:ring-primary/20 focus:ring-2 focus:outline-none',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />
    </div>
  );
}
