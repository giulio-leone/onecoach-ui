'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';

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
  const [open, setOpen] = useState(false);

  // Helper to check if a value is selected
  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValue = currentValues.includes(optionValue)
        ? currentValues.filter((v: any) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setOpen(false);
    }
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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'relative flex h-10 w-full min-w-[200px] items-center justify-between rounded-xl border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-md transition-all',
            'hover:bg-white/60 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30',
            disabled && 'cursor-not-allowed opacity-50',
            open && 'border-blue-500/30 ring-2 ring-blue-500/20',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">{getDisplayLabel()}</div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-neutral-500 transition-transform dark:text-neutral-400',
              open && 'rotate-180'
            )}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-[9999] w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-xl border border-white/20 bg-white/95 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          sideOffset={5}
        >
          <Command className="w-full">
            <div className="relative mb-2 px-2 pt-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-[calc(50%+4px)] text-neutral-400" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-neutral-200 bg-white/50 px-8 py-1.5 text-sm transition-colors outline-none placeholder:text-neutral-400 focus:border-blue-500/50 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-blue-500/50"
              />
            </div>

            <Command.List className="custom-scrollbar max-h-[240px] overflow-y-auto px-1 py-1">
              <Command.Empty className="px-2 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No results found.
              </Command.Empty>

              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:aria-selected:bg-blue-500/10 dark:aria-selected:text-blue-400',
                    isSelected(option.value) && 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
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
                  <span className="flex-1 text-neutral-700 dark:text-neutral-200">{option.label}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
