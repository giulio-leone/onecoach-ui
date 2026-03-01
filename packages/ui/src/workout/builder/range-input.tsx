/**
 * RangeInput Component
 *
 * Input unificato per valori range come "8-10"
 * Supporta parsing automatico e visualizzazione dei valori calcolati
 *
 * Design System: Usa token CSS globali per dark mode compatibility
 *
 * @module features/workouts/components/builder/range-input
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  parseRange,
  formatRange,
  type ParseRangeOptions,
  REPS_OPTIONS,
  WEIGHT_OPTIONS,
  INTENSITY_OPTIONS,
  RPE_OPTIONS,
  REST_OPTIONS,
} from '@giulio-leone/one-workout';

// =====================================================
// Types
// =====================================================

export type RangeFieldType = 'reps' | 'weight' | 'intensity' | 'rpe' | 'rest';

interface RangeInputProps {
  /** Tipo di campo per validazione preimpostata */
  fieldType: RangeFieldType;
  /** Valore minimo */
  value?: number | null;
  /** Valore massimo (per range) */
  valueMax?: number | null;
  /** Callback quando il valore cambia */
  onChange: (min: number, max?: number) => void;
  /** Callback quando l'input riceve focus */
  onFocus?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Unità di misura da mostrare */
  unit?: string;
  /** Valore calcolato da mostrare (opzionale) */
  calculatedValue?: number | null;
  calculatedValueMax?: number | null;
  /** Label per valore calcolato */
  calculatedLabel?: string;
  /** Disabilitato */
  disabled?: boolean;
  /** Classi CSS aggiuntive */
  className?: string;
  /** ID per accessibilità */
  id?: string;
}

// =====================================================
// Preset Options Map
// =====================================================

const FIELD_OPTIONS: Record<RangeFieldType, ParseRangeOptions> = {
  reps: REPS_OPTIONS,
  weight: WEIGHT_OPTIONS,
  intensity: INTENSITY_OPTIONS,
  rpe: RPE_OPTIONS,
  rest: REST_OPTIONS,
};

const FIELD_PLACEHOLDERS: Record<RangeFieldType, string> = {
  reps: '8-10',
  weight: '80-90',
  intensity: '75-85',
  rpe: '7-8',
  rest: '90',
};

const FIELD_UNITS: Record<RangeFieldType, string> = {
  reps: '',
  weight: 'kg',
  intensity: '%',
  rpe: '',
  rest: 's',
};

// =====================================================
// Component
// =====================================================

export function RangeInput({
  fieldType,
  value,
  valueMax,
  onChange,
  onFocus,
  placeholder,
  unit,
  calculatedValue,
  calculatedValueMax,
  calculatedLabel,
  disabled = false,
  className = '',
  id,
}: RangeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const options = FIELD_OPTIONS[fieldType];
  const displayPlaceholder = placeholder || FIELD_PLACEHOLDERS[fieldType];
  const displayUnit = unit || FIELD_UNITS[fieldType];

  // Sync external values to local display
  useEffect(() => {
    if (!isFocused) {
      const formatted = formatRange(value, valueMax);
      setLocalValue((prev) => (prev !== formatted ? formatted : prev));
    }
  }, [value, valueMax, isFocused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);

      // Parse and validate on each change
      const parsed = parseRange(inputValue, options);
      if (parsed) {
        onChange(parsed.min, parsed.max);
      }
    },
    [onChange, options]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Re-format the value on blur
    const parsed = parseRange(localValue, options);
    if (parsed) {
      setLocalValue(formatRange(parsed.min, parsed.max));
      onChange(parsed.min, parsed.max);
    } else if (localValue.trim() === '') {
      // Clear values if empty
      setLocalValue('');
    }
  }, [localValue, onChange, options]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  // Format calculated values for display
  const calculatedDisplay =
    calculatedValue !== null && calculatedValue !== undefined
      ? formatRange(calculatedValue, calculatedValueMax)
      : null;

  const hasCalculated = calculatedDisplay && calculatedDisplay !== localValue;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={displayPlaceholder}
          disabled={disabled}
          className={`w-full rounded-md border bg-transparent px-2 py-1.5 text-sm transition-colors duration-150 focus:ring-1 focus:outline-none ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'border-neutral-200/60 dark:border-white/[0.1]'
          } ${isFocused ? 'border-primary-500 ring-primary-500' : ''} text-neutral-900 placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500`}
          aria-label={`${fieldType} range input`}
        />
        {displayUnit && (
          <span className="min-w-[20px] text-xs text-neutral-400 dark:text-neutral-500">
            {displayUnit}
          </span>
        )}
      </div>

      {/* Calculated Value Display */}
      {hasCalculated && (
        <div className="mt-0.5 flex items-center gap-1 text-[10px]">
          {calculatedLabel && (
            <span className="text-neutral-400 dark:text-neutral-500">{calculatedLabel}:</span>
          )}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {calculatedDisplay}
            {displayUnit && ` ${displayUnit}`}
          </span>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Compound Export
// =====================================================

export default RangeInput;

// Re-export utilities for external use
export { formatRange, parseRange };
export type { ParseRangeOptions };
