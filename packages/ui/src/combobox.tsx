'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';

export interface ComboboxOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | string[]; // Support multiple selection
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Combobox = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  multiple = false,
  className,
  disabled = false,
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter((option: any) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValue = currentValues.includes(optionValue)
        ? currentValues.filter((v: any) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Get display label for selected value(s)
  const getDisplayLabel = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-neutral-400">{placeholder}</span>;
    }

    if (multiple) {
      const count = Array.isArray(value) ? value.length : 0;
      return <span className="text-neutral-900 dark:text-white">{count} selected</span>;
    }

    const selectedOption = options.find((opt: any) => opt.value === value);
    return (
      <span className="text-neutral-900 dark:text-white">{selectedOption?.label || value}</span>
    );
  };

  return (
    <div className={cn('relative w-full min-w-[200px]', className)} ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-md transition-all hover:bg-white/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'border-blue-500/30 ring-2 ring-blue-500/20'
        )}
      >
        <div className="flex items-center gap-2 truncate">{getDisplayLabel()}</div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-500 transition-transform dark:text-neutral-400',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute top-full left-0 z-[9999] mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-white/95 p-1 shadow-xl backdrop-blur-xl duration-200 dark:border-white/10 dark:bg-neutral-900/95">
          <div className="relative mb-2 px-2 pt-2">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              className="w-full rounded-lg border border-neutral-200 bg-white/50 px-8 py-1.5 text-sm transition-colors outline-none focus:border-blue-500/50 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-blue-500/50"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="custom-scrollbar max-h-[240px] overflow-y-auto px-1 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No results found.
              </div>
            ) : (
              filteredOptions.map((option: any) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10',
                    isSelected(option.value) &&
                      'bg-blue-50 font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border',
                      isSelected(option.value)
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                    )}
                  >
                    {isSelected(option.value) && <Check size={12} />}
                  </div>
                  {option.icon && <span className="text-neutral-500">{option.icon}</span>}
                  <span className="flex-1 text-neutral-700 dark:text-neutral-200">
                    {option.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
