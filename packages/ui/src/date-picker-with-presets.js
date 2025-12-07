/**
 * Date Picker With Presets Component - Web
 *
 * Web-only date picker component with preset buttons
 * Uses native HTML input[type="date"]
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar } from 'lucide-react';
import { Button } from './button';
import { formatDateForInput, parseDateFromInput, } from './date-picker-with-presets.shared';
export function DatePickerWithPresets({ date, onDateChange, presets }) {
    const handleDateChange = (event) => {
        const newDate = parseDateFromInput(event.target.value);
        if (newDate) {
            onDateChange(newDate);
        }
    };
    const handlePresetClick = (presetDate) => {
        onDateChange(presetDate);
    };
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900", children: [_jsx(Calendar, { className: "h-4 w-4 text-blue-500" }), _jsx("input", { type: "date", className: "min-w-[140px] border-none bg-transparent text-sm text-neutral-700 outline-none dark:text-neutral-200", value: formatDateForInput(date), onChange: handleDateChange })] }), presets && (_jsx("div", { className: "flex items-center gap-2", children: Object.entries(presets).map(([label, presetDate]) => (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handlePresetClick(presetDate), children: label }, label))) }))] }));
}
