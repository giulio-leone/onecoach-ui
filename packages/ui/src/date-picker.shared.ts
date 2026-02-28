/**
 * Date Picker - Shared Logic
 *
 * Common types and utilities for both web and native date pickers.
 * Following DRY principle to eliminate duplication.
 */

export interface DatePickerProps {
  /** Currently selected date */
  value: Date | undefined;
  /** Callback when date changes */
  onChange: (date: Date | undefined) => void;
  /** Placeholder text when no date selected */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Additional class name for styling */
  className?: string;
  /** Translations object (optional, uses defaults if not provided) */
  translations?: DatePickerTranslations;
  /** Default view date - controls which month is displayed initially */
  defaultViewDate?: Date;
  /** Show quick select buttons (Today, +1 week, etc.) */
  showQuickSelect?: boolean;
}

export interface DatePickerTranslations {
  selectDate: string;
  today: string;
  previousMonth: string;
  nextMonth: string;
  weekdays: {
    short: string[];
  };
  months: string[];
  quickSelect?: {
    today: string;
    nextWeek: string;
    nextTwoWeeks: string;
    nextMonth: string;
  };
}

/** Default English translations */
export const defaultTranslations: DatePickerTranslations = {
  selectDate: 'Select date',
  today: 'Today',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  weekdays: {
    short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  quickSelect: {
    today: 'Today',
    nextWeek: '+1 week',
    nextTwoWeeks: '+2 weeks',
    nextMonth: '+1 month',
  },
};

/**
 * Format date for display (e.g., "Jan 15, 2026")
 */
export function formatDateDisplay(date: Date, months: string[]): string {
  const month = months[date.getMonth()] ?? '';
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month.slice(0, 3)} ${day}, ${year}`;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Generate calendar days for a given month
 * Returns a 2D array representing weeks (rows) and days (columns)
 */
export function generateCalendarDays(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Fill in empty days at start
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Fill in actual days
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill in empty days at end
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Check if date is within min/max bounds
 */
export function isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < minDate) {
    return false;
  }
  if (maxDate && date > maxDate) {
    return false;
  }
  return true;
}

/**
 * Get start of month for a given date
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Quick select date options
 */
export interface QuickSelectOption {
  id: string;
  label: string;
  getDate: (baseDate: Date) => Date;
}

/**
 * Generate quick select options based on translations and min date
 */
export function getQuickSelectOptions(
  translations: DatePickerTranslations,
  minDate?: Date
): QuickSelectOption[] {
  const baseDate = minDate && minDate > new Date() ? minDate : new Date();
  const qs = translations.quickSelect || defaultTranslations.quickSelect!;

  return [
    {
      id: 'today',
      label: qs.today,
      getDate: () => new Date(),
    },
    {
      id: 'nextWeek',
      label: qs.nextWeek,
      getDate: (base: Date) => addDays(base, 7),
    },
    {
      id: 'nextTwoWeeks',
      label: qs.nextTwoWeeks,
      getDate: (base: Date) => addDays(base, 14),
    },
    {
      id: 'nextMonth',
      label: qs.nextMonth,
      getDate: (base: Date) => addMonths(base, 1),
    },
  ].filter((option: any) => {
    // Filter out options that would result in dates before minDate
    if (!minDate) return true;
    const resultDate = option.getDate(baseDate);
    return resultDate >= minDate;
  });
}
