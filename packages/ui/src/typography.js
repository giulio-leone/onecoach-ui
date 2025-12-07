import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Typography Components
 *
 * Design system typography components following SOLID and DRY principles.
 * Mobile-first, responsive, and optimized for dark mode.
 */
import React from 'react';
import { cn, darkModeClasses } from '@OneCoach/lib-design-system';
const headingSizeStyles = {
    xs: 'text-xs leading-4',
    sm: 'text-sm leading-5',
    md: 'text-base leading-6',
    lg: 'text-lg leading-7',
    xl: 'text-xl leading-7',
    '2xl': 'text-2xl leading-8 sm:text-3xl sm:leading-9',
    '3xl': 'text-3xl leading-9 sm:text-4xl sm:leading-10',
    '4xl': 'text-4xl leading-10 sm:text-5xl sm:leading-none',
    '5xl': 'text-5xl leading-none sm:text-6xl',
    '6xl': 'text-6xl leading-none sm:text-7xl',
};
const headingWeightStyles = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
};
const headingAlignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};
const headingVariantStyles = {
    primary: 'text-neutral-900 dark:text-neutral-50',
    secondary: 'text-neutral-700 dark:text-neutral-300',
    tertiary: 'text-neutral-600 dark:text-neutral-400',
    inverse: 'text-white dark:text-neutral-900',
    brand: 'text-primary-600 dark:text-primary-400',
};
export const Heading = React.forwardRef(({ level = 2, size, weight = 'bold', align = 'left', variant = 'primary', gradient = false, truncate = false, className, children, ...props }, ref) => {
    const Tag = `h${level}`;
    // Default size based on level if not specified
    const defaultSizes = {
        1: '4xl',
        2: '3xl',
        3: '2xl',
        4: 'xl',
        5: 'lg',
        6: 'md',
    };
    const effectiveSize = (size || defaultSizes[level]) ?? 'md';
    const classes = cn(headingSizeStyles[effectiveSize], headingWeightStyles[weight], headingAlignStyles[align], !gradient && headingVariantStyles[variant], gradient &&
        'bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent', truncate && 'truncate', 'transition-colors duration-200', className);
    return (_jsx(Tag, { ref: ref, className: classes, ...props, children: children }));
});
Heading.displayName = 'Heading';
const textSizeStyles = {
    xs: 'text-xs leading-4',
    sm: 'text-sm leading-5',
    base: 'text-base leading-6',
    lg: 'text-lg leading-7',
    xl: 'text-xl leading-8',
};
const textWeightStyles = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
};
const textAlignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
};
const textVariantStyles = {
    primary: darkModeClasses.text.primary,
    secondary: darkModeClasses.text.secondary,
    tertiary: darkModeClasses.text.tertiary,
    muted: darkModeClasses.text.muted,
    inverse: darkModeClasses.text.inverse,
    link: cn(darkModeClasses.text.link, darkModeClasses.text.linkHover, 'underline-offset-2 hover:underline cursor-pointer'),
    success: darkModeClasses.semantic.success.text,
    warning: darkModeClasses.semantic.warning.text,
    error: darkModeClasses.semantic.error.text,
    info: darkModeClasses.semantic.info.text,
};
const lineClampStyles = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    5: 'line-clamp-5',
    6: 'line-clamp-6',
};
export const Text = React.forwardRef(({ as: Component = 'p', size = 'base', weight = 'normal', align = 'left', variant = 'primary', truncate = false, lineClamp, numberOfLines, className, children, ...props }, ref) => {
    // Compute clampValue with proper type narrowing
    const clampValue = (lineClamp ?? numberOfLines);
    const classes = cn(textSizeStyles[size], textWeightStyles[weight], textAlignStyles[align], textVariantStyles[variant], truncate && 'truncate', clampValue && lineClampStyles[clampValue], 'transition-colors duration-200', className);
    return React.createElement(Component, {
        ref,
        className: classes,
        ...props,
    }, children);
});
Text.displayName = 'Text';
const labelSizeStyles = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
};
export const Label = React.forwardRef(({ size = 'base', weight = 'medium', required = false, disabled = false, className, children, ...props }, ref) => {
    const classes = cn('block mb-1.5', labelSizeStyles[size], textWeightStyles[weight], disabled
        ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
        : 'text-neutral-700 dark:text-neutral-300', 'transition-colors duration-200', className);
    return (_jsxs("label", { ref: ref, className: classes, ...props, children: [children, required && (_jsx("span", { className: "ml-1 text-red-600 dark:text-red-400", "aria-label": "required", children: "*" }))] }));
});
Label.displayName = 'Label';
const helperTextVariantStyles = {
    default: 'text-neutral-500 dark:text-neutral-500',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
};
export const HelperText = React.forwardRef(({ variant = 'default', className, children, ...props }, ref) => {
    const classes = cn('mt-1.5 text-xs leading-4', helperTextVariantStyles[variant], 'transition-colors duration-200', className);
    return (_jsx("p", { ref: ref, className: classes, ...props, children: children }));
});
HelperText.displayName = 'HelperText';
export const Code = React.forwardRef(({ block = false, language, className, children, ...props }, ref) => {
    if (block) {
        return (_jsx("pre", { ref: ref, className: cn('overflow-x-auto rounded-lg p-4', 'bg-neutral-100 dark:bg-neutral-800', 'border border-neutral-200 dark:border-neutral-700', 'font-mono text-sm', 'text-neutral-900 dark:text-neutral-100', className), ...props, children: _jsx("code", { "data-language": language, children: children }) }));
    }
    return (_jsx("code", { ref: ref, className: cn('rounded px-1.5 py-0.5', 'bg-neutral-100 dark:bg-neutral-800', 'border border-neutral-200 dark:border-neutral-700', 'font-mono text-sm', 'text-neutral-900 dark:text-neutral-100', className), ...props, children: children }));
});
Code.displayName = 'Code';
