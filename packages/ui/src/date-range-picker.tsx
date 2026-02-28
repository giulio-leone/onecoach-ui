/**
 * DateRangePicker Component
 *
 * Premium dual-month calendar for selecting departure and return dates in a single interaction.
 * Optimized for flight booking flows with visual range highlighting and smart UX.
 *
 * Features:
 * - Dual-month side-by-side calendar (responsive: stacked on mobile)
 * - Automatic switch from departure to return selection
 * - Visual range highlighting between dates
 * - Smart date constraints (return >= departure)
 * - Quick select presets for common trip durations
 * - Smooth animations and transitions
 */

'use client';

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlaneTakeoff,
  PlaneLanding,
  Sparkles,
} from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  defaultTranslations,
  formatDateDisplay,
  generateCalendarDays,
  isSameDay,
  isToday,
  isDateInRange,
  startOfMonth,
  addDays,
  addMonths,
  type DatePickerTranslations,
} from './date-picker.shared';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface DateRangePickerProps {
  /** Departure date */
  departureDate: Date | undefined;
  /** Return date */
  returnDate: Date | undefined;
  /** Called when departure date changes */
  onDepartureDateChange: (date: Date | undefined) => void;
  /** Called when return date changes */
  onReturnDateChange: (date: Date | undefined) => void;
  /** Minimum selectable date (defaults to today) */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Translations */
  translations?: DateRangePickerTranslations;
  /** Show quick duration presets (Weekend, 1 Week, 2 Weeks) */
  showPresets?: boolean;
  /** Whether it's a one-way trip (hides return date) */
  isOneWay?: boolean;
}

export interface DateRangePickerTranslations extends DatePickerTranslations {
  departureDate: string;
  returnDate: string;
  selectDeparture: string;
  selectReturn: string;
  duration: string;
  nights: string;
  presets?: {
    weekend: string;
    oneWeek: string;
    twoWeeks: string;
    threeWeeks: string;
  };
}

const defaultRangeTranslations: DateRangePickerTranslations = {
  ...defaultTranslations,
  departureDate: 'Departure',
  returnDate: 'Return',
  selectDeparture: 'Select departure date',
  selectReturn: 'Select return date',
  duration: 'Duration',
  nights: 'nights',
  presets: {
    weekend: 'Weekend',
    oneWeek: '1 Week',
    twoWeeks: '2 Weeks',
    threeWeeks: '3 Weeks',
  },
};

// ----------------------------------------------------------------------------
// Utility Components
// ----------------------------------------------------------------------------

interface CalendarMonthProps {
  year: number;
  month: number;
  departureDate: Date | undefined;
  returnDate: Date | undefined;
  selectionMode: 'departure' | 'return';
  minDate?: Date;
  maxDate?: Date;
  onSelectDate: (date: Date) => void;
  translations: DateRangePickerTranslations;
}

function CalendarMonth({
  year,
  month,
  departureDate,
  returnDate,
  selectionMode,
  minDate,
  maxDate,
  onSelectDate,
  translations: t,
}: CalendarMonthProps): React.ReactElement {
  const weeks = useMemo(() => generateCalendarDays(year, month), [year, month]);

  const isInRange = useCallback(
    (date: Date): boolean => {
      if (!departureDate || !returnDate) return false;
      return date > departureDate && date < returnDate;
    },
    [departureDate, returnDate]
  );

  const isRangeStart = useCallback(
    (date: Date): boolean => {
      if (!departureDate) return false;
      return isSameDay(date, departureDate);
    },
    [departureDate]
  );

  const isRangeEnd = useCallback(
    (date: Date): boolean => {
      if (!returnDate) return false;
      return isSameDay(date, returnDate);
    },
    [returnDate]
  );

  return (
    <div className="flex-1">
      {/* Month header */}
      <div className="mb-3 text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {t.months[month]} {year}
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {t.weekdays.short.map((day: any) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-neutral-400 dark:text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid gap-0.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0.5">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={dayIndex} className="h-9 w-full" />;
              }

              const isSelected = isRangeStart(date) || isRangeEnd(date);
              const inRange = isInRange(date);
              const isTodayDate = isToday(date);
              const isStart = isRangeStart(date);
              const isEnd = isRangeEnd(date);

              // Effective min date for return selection
              const effectiveMinDate =
                selectionMode === 'return' && departureDate ? departureDate : minDate;

              const isDisabled = !isDateInRange(date, effectiveMinDate, maxDate);

              return (
                <button
                  key={dayIndex}
                  type="button"
                  onClick={() => !isDisabled && onSelectDate(date)}
                  disabled={isDisabled}
                  className={cn(
                    'relative flex h-9 w-full items-center justify-center text-sm font-medium transition-all duration-150',
                    'focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary-500',
                    // Range background
                    inRange && 'bg-primary-100 dark:bg-primary-900/30',
                    // Range start styling
                    isStart && 'rounded-l-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white',
                    // Range end styling
                    isEnd && 'rounded-r-lg bg-gradient-to-l from-primary-600 to-primary-500 text-white',
                    // Single selected (no range yet)
                    isSelected &&
                      !inRange &&
                      !isEnd &&
                      !isStart &&
                      'rounded-lg bg-primary-600 text-white',
                    // Both start and end (same day - shouldn't happen in round trip)
                    isStart && isEnd && 'rounded-lg',
                    // Today indicator
                    !isSelected && isTodayDate && 'font-bold text-primary-600 dark:text-primary-400',
                    // Normal day
                    !isSelected &&
                      !inRange &&
                      !isTodayDate &&
                      'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/[0.06]',
                    // Disabled
                    isDisabled && 'cursor-not-allowed opacity-30 hover:bg-transparent'
                  )}
                >
                  {date.getDate()}
                  {/* Today dot */}
                  {isTodayDate && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-600 dark:bg-primary-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function DateRangePicker({
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  minDate,
  maxDate,
  disabled = false,
  className,
  translations,
  showPresets = true,
  isOneWay = false,
}: DateRangePickerProps): React.ReactElement {
  const t = { ...defaultRangeTranslations, ...translations };

  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'departure' | 'return'>('departure');

  // View date for left calendar (right calendar shows next month)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const effectiveMinDate = minDate ?? today;

  const [leftViewDate, setLeftViewDate] = useState(() => {
    if (departureDate) return startOfMonth(departureDate);
    if (effectiveMinDate > today) return startOfMonth(effectiveMinDate);
    return startOfMonth(today);
  });

  // Reset selection mode when opening
  useEffect(() => {
    if (open) {
      if (!departureDate) {
        setSelectionMode('departure');
      } else if (!returnDate && !isOneWay) {
        setSelectionMode('return');
      } else {
        setSelectionMode('departure');
      }
    }
  }, [open, departureDate, returnDate, isOneWay]);

  // Sync view date with departure date when it changes
  useEffect(() => {
    if (departureDate) {
      setLeftViewDate(startOfMonth(departureDate));
    }
  }, [departureDate]);

  const rightViewDate = useMemo(() => addMonths(leftViewDate, 1), [leftViewDate]);

  const handlePreviousMonth = useCallback(() => {
    setLeftViewDate((prev) => {
      const newDate = addMonths(prev, -1);
      if (effectiveMinDate && newDate < startOfMonth(effectiveMinDate)) {
        return prev;
      }
      return newDate;
    });
  }, [effectiveMinDate]);

  const handleNextMonth = useCallback(() => {
    setLeftViewDate((prev) => addMonths(prev, 1));
  }, []);

  const canGoPrevious = useMemo(() => {
    const prevMonth = addMonths(leftViewDate, -1);
    return prevMonth >= startOfMonth(effectiveMinDate);
  }, [leftViewDate, effectiveMinDate]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      if (selectionMode === 'departure') {
        onDepartureDateChange(date);
        // Clear return date if it's before new departure
        if (returnDate && date >= returnDate) {
          onReturnDateChange(undefined);
        }
        // Switch to return selection if not one-way
        if (!isOneWay) {
          setSelectionMode('return');
        } else {
          setOpen(false);
        }
      } else {
        // Return date selection
        if (departureDate && date <= departureDate) {
          // If clicking before departure, reset and start over
          onDepartureDateChange(date);
          onReturnDateChange(undefined);
          setSelectionMode('return');
        } else {
          onReturnDateChange(date);
          setOpen(false);
        }
      }
    },
    [selectionMode, departureDate, returnDate, onDepartureDateChange, onReturnDateChange, isOneWay]
  );

  const handlePreset = useCallback(
    (days: number) => {
      if (!departureDate) return;
      const newReturnDate = addDays(departureDate, days);
      onReturnDateChange(newReturnDate);
      setOpen(false);
    },
    [departureDate, onReturnDateChange]
  );

  // Calculate trip duration
  const tripDuration = useMemo(() => {
    if (!departureDate || !returnDate) return null;
    const diffTime = returnDate.getTime() - departureDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [departureDate, returnDate]);

  // Display values
  const departureDateDisplay = departureDate
    ? formatDateDisplay(departureDate, t.months)
    : t.selectDeparture;

  const returnDateDisplay = returnDate ? formatDateDisplay(returnDate, t.months) : t.selectReturn;

  // Presets
  const presets = t.presets ?? defaultRangeTranslations.presets!;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={disabled}
        className={cn(
          'group relative flex w-full items-stretch overflow-hidden rounded-2xl border-2 border-neutral-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300',
          'hover:border-primary-300/50 hover:shadow-lg hover:shadow-primary-500/5',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
          'dark:border-white/[0.08] dark:bg-white/[0.06] dark:hover:border-primary-500/30',
          open && 'border-primary-400/50 shadow-xl ring-2 shadow-primary-500/10 ring-primary-500/20',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {/* Departure Section */}
        <div
          className={cn(
            'flex flex-1 flex-col items-start gap-1 px-4 py-3 transition-colors',
            selectionMode === 'departure' && open && 'bg-primary-50/50 dark:bg-primary-900/20'
          )}
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
            <PlaneTakeoff className="h-3 w-3" />
            {t.departureDate}
          </span>
          <span
            className={cn(
              'text-base font-semibold',
              departureDate ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
            )}
          >
            {departureDateDisplay}
          </span>
        </div>

        {/* Divider with duration */}
        {!isOneWay && (
          <div className="flex flex-col items-center justify-center border-x border-neutral-100 px-3 dark:border-neutral-800">
            {tripDuration ? (
              <>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {tripDuration}
                </span>
                <span className="text-[9px] font-medium text-neutral-400">{t.nights}</span>
              </>
            ) : (
              <Calendar className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
            )}
          </div>
        )}

        {/* Return Section */}
        {!isOneWay && (
          <div
            className={cn(
              'flex flex-1 flex-col items-start gap-1 px-4 py-3 transition-colors',
              selectionMode === 'return' && open && 'bg-primary-50/50 dark:bg-primary-900/20'
            )}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              <PlaneLanding className="h-3 w-3" />
              {t.returnDate}
            </span>
            <span
              className={cn(
                'text-base font-semibold',
                returnDate ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
              )}
            >
              {returnDateDisplay}
            </span>
          </div>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="center"
          sideOffset={12}
          className={cn(
            'z-50 w-[min(680px,95vw)] rounded-2xl border border-neutral-200/50 bg-white/95 p-4 shadow-2xl backdrop-blur-xl',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'dark:border-white/[0.08] dark:bg-white/[0.10]'
          )}
        >
          {/* Selection mode indicator */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectionMode('departure')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
                  selectionMode === 'departure'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]'
                )}
              >
                <PlaneTakeoff className="h-4 w-4" />
                {t.departureDate}
              </button>

              {!isOneWay && (
                <button
                  type="button"
                  onClick={() => departureDate && setSelectionMode('return')}
                  disabled={!departureDate}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
                    selectionMode === 'return'
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]',
                    !departureDate && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <PlaneLanding className="h-4 w-4" />
                  {t.returnDate}
                </button>
              )}
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePreviousMonth}
                disabled={!canGoPrevious}
                className={cn(
                  'rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-white/[0.06]',
                  !canGoPrevious && 'cursor-not-allowed opacity-30'
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Dual Calendar */}
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
            <CalendarMonth
              year={leftViewDate.getFullYear()}
              month={leftViewDate.getMonth()}
              departureDate={departureDate}
              returnDate={returnDate}
              selectionMode={selectionMode}
              minDate={effectiveMinDate}
              maxDate={maxDate}
              onSelectDate={handleSelectDate}
              translations={t}
            />
            <CalendarMonth
              year={rightViewDate.getFullYear()}
              month={rightViewDate.getMonth()}
              departureDate={departureDate}
              returnDate={returnDate}
              selectionMode={selectionMode}
              minDate={effectiveMinDate}
              maxDate={maxDate}
              onSelectDate={handleSelectDate}
              translations={t}
            />
          </div>

          {/* Quick Duration Presets */}
          {showPresets && !isOneWay && departureDate && selectionMode === 'return' && (
            <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <Sparkles className="h-3 w-3" />
                {t.duration}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { days: 2, label: presets.weekend },
                  { days: 7, label: presets.oneWeek },
                  { days: 14, label: presets.twoWeeks },
                  { days: 21, label: presets.threeWeeks },
                ].map(({ days, label }) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handlePreset(days)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      'bg-neutral-100 text-neutral-700 hover:bg-primary-100 hover:text-primary-700',
                      'dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-primary-900/40 dark:hover:text-primary-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
