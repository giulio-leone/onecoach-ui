/**
 * MetadataForm Component
 *
 * Generic metadata form component for visual builders
 * Configurable fields for different entity types
 * Fully optimized for dark mode
 */

import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

export interface MetadataField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}

export interface MetadataFormProps {
  fields: MetadataField[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  renderCustomField?: (field: MetadataField) => React.ReactNode;
}

export function MetadataForm({
  fields,
  className = '',
  columns = 3,
  renderCustomField,
}: MetadataFormProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4 rounded-xl border p-4 shadow-sm sm:p-6',
        darkModeClasses.card.base,
        gridCols[columns],
        className
      )}
    >
      {fields.map((field) => {
        if (renderCustomField) {
          const custom = renderCustomField(field);
          if (custom) return <div key={field.key}>{custom}</div>;
        }

        return (
          <div key={field.key}>
            <label
              className={cn(
                'mb-2 block text-sm font-semibold sm:font-medium',
                darkModeClasses.text.secondary
              )}
            >
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                value={field.value}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  field.onChange(e.target.value)
                }
                disabled={field.disabled}
                className={cn(
                  'block min-h-[44px] w-full touch-manipulation rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                  darkModeClasses.input.base,
                  field.disabled && darkModeClasses.input.disabled
                )}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={field.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(Number(e.target.value))
                }
                disabled={field.disabled}
                min={field.min}
                max={field.max}
                placeholder={field.placeholder}
                className={cn(
                  'block min-h-[44px] w-full touch-manipulation rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                  darkModeClasses.input.base,
                  field.disabled && darkModeClasses.input.disabled
                )}
              />
            ) : (
              <input
                type="text"
                value={field.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(e.target.value)
                }
                disabled={field.disabled}
                placeholder={field.placeholder}
                className={cn(
                  'block min-h-[44px] w-full touch-manipulation rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                  darkModeClasses.input.base,
                  field.disabled && darkModeClasses.input.disabled
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
