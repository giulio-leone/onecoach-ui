/**
 * DatePicker Component - Web
 *
 * Modern, accessible date picker with visual calendar UI.
 * Uses Radix Popover for overlay, consistent with design system.
 *
 * Features:
 * - Visual calendar grid with month/year navigation
 * - Keyboard navigation (arrows, Enter, Escape)
 * - i18n support for all labels
 * - Dark mode support
 * - Min/max date constraints
 * - Auto-sync viewDate with minDate (smart navigation)
 * - Quick select buttons for common date offsets
 */

'use client';

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Calendar, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@giulio-leone/lib-design-system';
import {
  type DatePickerProps,
  defaultTranslations,
  formatDateDisplay,
  generateCalendarDays,
  isSameDay,
  isToday,
  isDateInRange,
  startOfMonth,
  getQuickSelectOptions,
} from './date-picker.shared';

export type { DatePickerProps, DatePickerTranslations } from './date-picker.shared';

const triggerVariants = cva(
  'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: [
          'border-neutral-200/60 bg-white text-neutral-700 shadow-sm',
          'hover:border-neutral-300 hover:bg-neutral-50',
          'focus-visible:ring-primary-500',
          'dark:border-white/[0.08] dark:bg-zinc-950 dark:text-neutral-200',
          'dark:hover:border-neutral-600 dark:hover:bg-white/[0.06]',
        ],
        outline: [
          'border-neutral-300 bg-transparent text-neutral-700',
          'hover:bg-neutral-100',
          'dark:border-white/[0.1] dark:text-neutral-300 dark:hover:bg-white/[0.06]',
        ],
        ghost: [
          'border-transparent bg-transparent text-neutral-700',
          'hover:bg-neutral-100',
          'dark:text-neutral-300 dark:hover:bg-white/[0.06]',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DatePickerComponentProps
  extends DatePickerProps, VariantProps<typeof triggerVariants> {}

export function DatePicker({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  className,
  translations = defaultTranslations,
  variant = 'default',
  defaultViewDate,
  showQuickSelect = false,
}: DatePickerComponentProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  // Smart initial viewDate: prioritize defaultViewDate > minDate > value > today
  const getInitialViewDate = useCallback(() => {
    if (defaultViewDate) return defaultViewDate;
    if (minDate && minDate > new Date()) return minDate;
    if (value) return value;
    return new Date();
  }, [defaultViewDate, minDate, value]);

  const [viewDate, setViewDate] = useState(getInitialViewDate);

  const t = translations;

  // Auto-sync viewDate when minDate changes (smart navigation)
  // If minDate is in the future and viewDate is before it, jump to minDate's month
  useEffect(() => {
    if (minDate) {
      const minMonthStart = startOfMonth(minDate);
      const viewMonthStart = startOfMonth(viewDate);

      if (viewMonthStart < minMonthStart) {
        setViewDate(minDate);
      }
    }
  }, [minDate, viewDate]);

  // Also sync when defaultViewDate changes
  useEffect(() => {
    if (defaultViewDate) {
      setViewDate(defaultViewDate);
    }
  }, [defaultViewDate]);

  const weeks = useMemo(
    () => generateCalendarDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  // Quick select options (filtered by minDate)
  const quickSelectOptions = useMemo(
    () => (showQuickSelect ? getQuickSelectOptions(t, minDate) : []),
    [showQuickSelect, t, minDate]
  );

  const handlePreviousMonth = useCallback(() => {
    setViewDate((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      // Don't allow navigating before minDate's month
      if (minDate) {
        const minMonthStart = startOfMonth(minDate);
        if (newDate < minMonthStart) {
          return prev; // Stay on current month
        }
      }
      return newDate;
    });
  }, [minDate]);

  const handleNextMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleSelectDate = useCallback(
    (date: Date) => {
      if (!isDateInRange(date, minDate, maxDate)) return;
      onChange(date);
      setOpen(false);
    },
    [onChange, minDate, maxDate]
  );

  const handleQuickSelect = useCallback(
    (optionId: string) => {
      const option = quickSelectOptions.find((o: any) => o.id === optionId);
      if (!option) return;

      const baseDate = minDate && minDate > new Date() ? minDate : new Date();
      const selectedDate = option.getDate(baseDate);

      if (isDateInRange(selectedDate, minDate, maxDate)) {
        onChange(selectedDate);
        setViewDate(selectedDate);
        setOpen(false);
      }
    },
    [quickSelectOptions, minDate, maxDate, onChange]
  );

  const handleToday = useCallback(() => {
    const today = new Date();
    if (isDateInRange(today, minDate, maxDate)) {
      onChange(today);
      setViewDate(today);
      setOpen(false);
    }
  }, [onChange, minDate, maxDate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, date: Date | null) => {
      if (!date) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelectDate(date);
      }
    },
    [handleSelectDate]
  );

  // Check if previous month button should be disabled
  const canGoPrevious = useMemo(() => {
    if (!minDate) return true;
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    return prevMonth >= startOfMonth(minDate);
  }, [viewDate, minDate]);

  const displayValue = value ? formatDateDisplay(value, t.months) : (placeholder ?? t.selectDate);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={disabled}
        className={cn(
          triggerVariants({ variant }),
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <Calendar className="h-4 w-4 text-primary-500" />
        <span className={cn(!value && 'text-neutral-400 dark:text-neutral-500')}>
          {displayValue}
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={cn(
            'z-50 w-[300px] max-w-[94vw] rounded-xl border border-neutral-200/60 bg-white p-3 shadow-xl',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'dark:border-white/[0.08] dark:bg-zinc-950'
          )}
        >
          {/* Quick Select Buttons */}
          {showQuickSelect && quickSelectOptions.length > 0 && (
            <div className="mb-3 border-b border-neutral-100 pb-3 dark:border-white/[0.06]">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Zap className="h-3 w-3" />
                Quick Select
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickSelectOptions.map((option: any) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleQuickSelect(option.id)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                      'bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-700',
                      'dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-primary-900/40 dark:hover:text-primary-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Header with navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreviousMonth}
              disabled={!canGoPrevious}
              aria-label={t.previousMonth}
              className={cn(
                'rounded-lg p-1.5 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]',
                !canGoPrevious && 'cursor-not-allowed opacity-30 hover:bg-transparent'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t.months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label={t.nextMonth}
              className="rounded-lg p-1.5 text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {t.weekdays.short.map((day: any) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="h-8 w-8" />;
                  }

                  const isSelected = value && isSameDay(date, value);
                  const isTodayDate = isToday(date);
                  const isDisabled = !isDateInRange(date, minDate, maxDate);

                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      onKeyDown={(e) => handleKeyDown(e, date)}
                      disabled={isDisabled}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        isSelected
                          ? 'bg-primary-600 text-white shadow-sm'
                          : isTodayDate
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/[0.06]',
                        isDisabled && 'cursor-not-allowed opacity-30 hover:bg-transparent'
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Today button (only if today is in range) */}
          {isDateInRange(new Date(), minDate, maxDate) && (
            <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={handleToday}
                className="w-full rounded-lg py-1.5 text-sm font-medium text-primary-600 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
              >
                {t.today}
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
