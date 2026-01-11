/**
 * Agent Form Field Component
 *
 * Componente condiviso per campi form degli agent
 */

'use client';

import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

export interface AgentFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'select' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  colorTheme?: 'nutrition' | 'workout' | 'chat';
}

const colorThemes = {
  nutrition: {
    focus: 'focus:border-green-500 focus:ring-green-200',
    icon: 'text-green-600',
  },
  workout: {
    focus: 'focus:border-blue-500 focus:ring-blue-200',
    icon: 'text-blue-600',
  },
  chat: {
    focus: 'focus:border-purple-500 focus:ring-purple-200',
    icon: 'text-purple-600',
  },
};

export function AgentFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  min,
  max,
  options,
  error,
  hint,
  icon,
  colorTheme = 'nutrition',
}: AgentFormFieldProps) {
  const theme = colorThemes[colorTheme];

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="flex items-center gap-2">
        {icon && <span className={theme.icon}>{icon}</span>}
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
        {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'select' && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          required={required}
          className={cn(
            'min-h-[48px] rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ease-out',
            darkModeClasses.input.base,
            'focus:outline-none',
            error ? darkModeClasses.input.error : darkModeClasses.input.focus
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={cn(
            'min-h-[80px] resize-none rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ease-out',
            darkModeClasses.input.base,
            darkModeClasses.input.placeholder,
            'focus:outline-none',
            error ? darkModeClasses.input.error : darkModeClasses.input.focus
          )}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
          className={cn(
            'min-h-[48px] rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ease-out',
            darkModeClasses.input.base,
            darkModeClasses.input.placeholder,
            'focus:outline-none',
            error ? darkModeClasses.input.error : darkModeClasses.input.focus
          )}
        />
      )}

      {hint && !error && <p className="text-xs text-neutral-500 dark:text-neutral-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
