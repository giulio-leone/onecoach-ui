import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MetadataForm Component
 *
 * Generic metadata form component for visual builders
 * Configurable fields for different entity types
 * Fully optimized for dark mode
 */
import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';
export function MetadataForm({ fields, className = '', columns = 3, renderCustomField, }) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4',
    };
    return (_jsx("div", { className: cn('grid gap-4 rounded-xl border p-4 shadow-sm sm:p-6', darkModeClasses.card.base, gridCols[columns], className), children: fields.map((field) => {
            if (renderCustomField) {
                const custom = renderCustomField(field);
                if (custom)
                    return _jsx("div", { children: custom }, field.key);
            }
            return (_jsxs("div", { children: [_jsx("label", { className: cn('mb-2 block text-sm font-semibold sm:font-medium', darkModeClasses.text.secondary), children: field.label }), field.type === 'select' ? (_jsx("select", { value: field.value, onChange: (e) => field.onChange(e.target.value), disabled: field.disabled, className: cn('block min-h-[44px] w-full touch-manipulation rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none', darkModeClasses.input.base, field.disabled && darkModeClasses.input.disabled), children: field.options?.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })) : field.type === 'number' ? (_jsx("input", { type: "number", value: field.value, onChange: (e) => field.onChange(Number(e.target.value)), disabled: field.disabled, min: field.min, max: field.max, placeholder: field.placeholder, className: cn('block min-h-[44px] w-full touch-manipulation rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none', darkModeClasses.input.base, field.disabled && darkModeClasses.input.disabled) })) : (_jsx("input", { type: "text", value: field.value, onChange: (e) => field.onChange(e.target.value), disabled: field.disabled, placeholder: field.placeholder, className: cn('block min-h-[44px] w-full touch-manipulation rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none', darkModeClasses.input.base, field.disabled && darkModeClasses.input.disabled) }))] }, field.key));
        }) }));
}
