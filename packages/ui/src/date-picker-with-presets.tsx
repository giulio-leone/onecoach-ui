/**
 * Date Picker With Presets Component - Web
 *
 * Web-only date picker component with preset buttons
 * Uses native HTML input[type="date"]
 */

'use client';

import { Calendar } from 'lucide-react';
import { Button } from './button';
import {
  type DatePickerWithPresetsProps,
  formatDateForInput,
  parseDateFromInput,
} from './date-picker-with-presets.shared';

export type { DatePickerWithPresetsProps, Presets } from './date-picker-with-presets.shared';

export function DatePickerWithPresets({ date, onDateChange, presets }: DatePickerWithPresetsProps) {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = parseDateFromInput(event.target.value);
    if (newDate) {
      onDateChange(newDate);
    }
  };

  const handlePresetClick = (presetDate: Date) => {
    onDateChange(presetDate);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white px-3 py-2 text-sm shadow-sm dark:border-white/[0.08] dark:bg-zinc-950">
        <Calendar className="h-4 w-4 text-primary-500" />
        <input
          type="date"
          className="min-w-[140px] border-none bg-transparent text-sm text-neutral-700 outline-none dark:text-neutral-200"
          value={formatDateForInput(date)}
          onChange={handleDateChange}
        />
      </label>
      {presets && (
        <div className="flex items-center gap-2">
          {Object.entries(presets).map(([label, presetDate]) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              onClick={() => handlePresetClick(presetDate)}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
