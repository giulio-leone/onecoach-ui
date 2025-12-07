'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '@onecoach/lib-design-system';
export function Slider({ value, min, max, step, onValueChange, disabled, className }) {
    const handleChange = (e) => {
        onValueChange([parseFloat(e.target.value)]);
    };
    return (_jsx("div", { className: cn('relative flex w-full touch-none items-center select-none', className), children: _jsx("input", { type: "range", min: min, max: max, step: step, value: value[0], onChange: handleChange, disabled: disabled, className: cn('h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 dark:bg-neutral-700', 'accent-primary focus:ring-primary/20 focus:ring-2 focus:outline-none', disabled && 'cursor-not-allowed opacity-50') }) }));
}
