/**
 * Date Picker With Presets - Shared Logic
 *
 * Common types and utilities for both web and native date pickers
 * Following DRY principle to eliminate duplication
 */
export interface Presets {
    [label: string]: Date;
}
export interface DatePickerWithPresetsProps {
    date: Date;
    onDateChange: (date: Date) => void;
    presets?: Presets;
}
/**
 * Format date to YYYY-MM-DD format (ISO date string)
 */
export declare function formatDateForInput(date: Date): string;
/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export declare function parseDateFromInput(dateString: string): Date | null;
/**
 * Validate date string format
 */
export declare function isValidDateString(dateString: string): boolean;
