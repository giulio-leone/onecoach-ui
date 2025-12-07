/**
 * useCalendarNavigation Hook
 *
 * Custom hook for calendar navigation logic (DRY principle).
 * Handles month/week/day navigation and date calculations.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { it } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export type CalendarView = 'month' | 'week' | 'day';

interface UseCalendarNavigationOptions {
  initialDate?: Date;
  initialView?: CalendarView;
  locale?: Locale;
}

export function useCalendarNavigation(options: UseCalendarNavigationOptions = {}) {
  const [currentDate, setCurrentDate] = useState<Date>(options.initialDate || new Date());
  const [view, setView] = useState<CalendarView>(options.initialView || 'month');
  const locale = options.locale || it;

  /**
   * Get the start and end dates for the current view
   */
  const viewRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (view) {
      case 'month':
        start = startOfWeek(startOfMonth(currentDate), { locale, weekStartsOn: 1 });
        end = endOfWeek(endOfMonth(currentDate), { locale, weekStartsOn: 1 });
        break;
      case 'week':
        start = startOfWeek(currentDate, { locale, weekStartsOn: 1 });
        end = endOfWeek(currentDate, { locale, weekStartsOn: 1 });
        break;
      case 'day':
        start = currentDate;
        end = currentDate;
        break;
    }

    return { start, end };
  }, [currentDate, view, locale]);

  /**
   * Get all days in the current view
   */
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: viewRange.start,
      end: viewRange.end,
    });
  }, [viewRange]);

  /**
   * Navigate to previous period
   */
  const goToPrevious = useCallback(() => {
    setCurrentDate((date) => {
      switch (view) {
        case 'month':
          return subMonths(date, 1);
        case 'week':
          return subWeeks(date, 1);
        case 'day':
          return subDays(date, 1);
        default:
          return date;
      }
    });
  }, [view]);

  /**
   * Navigate to next period
   */
  const goToNext = useCallback(() => {
    setCurrentDate((date) => {
      switch (view) {
        case 'month':
          return addMonths(date, 1);
        case 'week':
          return addWeeks(date, 1);
        case 'day':
          return addDays(date, 1);
        default:
          return date;
      }
    });
  }, [view]);

  /**
   * Go to today
   */
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /**
   * Go to specific date
   */
  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  /**
   * Change view type
   */
  const changeView = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  /**
   * Get formatted title for current view
   */
  const title = useMemo(() => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale });
      case 'week':
        return `${format(viewRange.start, 'd MMM', { locale })} - ${format(viewRange.end, 'd MMM yyyy', { locale })}`;
      case 'day':
        return format(currentDate, 'EEEE, d MMMM yyyy', { locale });
      default:
        return '';
    }
  }, [currentDate, view, viewRange, locale]);

  /**
   * Check if a date is in the current month (for month view)
   */
  const isInCurrentMonth = useCallback(
    (date: Date) => {
      return isSameMonth(date, currentDate);
    },
    [currentDate]
  );

  /**
   * Check if a date is selected
   */
  const isSelected = useCallback(
    (date: Date) => {
      return isSameDay(date, currentDate);
    },
    [currentDate]
  );

  /**
   * Check if a date is today
   */
  const isDateToday = useCallback((date: Date) => {
    return isToday(date);
  }, []);

  /**
   * Get weekday names for calendar header
   */
  const weekdayNames = useMemo(() => {
    const start = startOfWeek(new Date(), { locale, weekStartsOn: 1 });
    return eachDayOfInterval({
      start,
      end: addDays(start, 6),
    }).map((day: any) => format(day, 'EEEEEE', { locale })); // Short weekday names
  }, [locale]);

  return {
    currentDate,
    view,
    viewRange,
    days,
    title,
    weekdayNames,
    goToPrevious,
    goToNext,
    goToToday,
    goToDate,
    changeView,
    isInCurrentMonth,
    isSelected,
    isDateToday,
  };
}
