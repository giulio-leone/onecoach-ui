/**
 * Date Picker With Presets Component - Web
 *
 * Web-only date picker component with preset buttons
 * Uses native HTML input[type="date"]
 */
import { type DatePickerWithPresetsProps } from './date-picker-with-presets.shared';
export type { DatePickerWithPresetsProps, Presets } from './date-picker-with-presets.shared';
export declare function DatePickerWithPresets({ date, onDateChange, presets }: DatePickerWithPresetsProps): import("react/jsx-runtime").JSX.Element;
