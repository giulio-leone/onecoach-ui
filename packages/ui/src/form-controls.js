/**
 * Form Control Components
 *
 * Advanced form controls following SOLID and DRY principles.
 * Mobile-first, accessible, and optimized for dark mode.
 * Provides: Checkbox, Radio, Switch, RadioGroup, CheckboxGroup
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useContext, useId } from 'react';
import { cn } from '@onecoach/lib-design-system';
import { Check } from 'lucide-react';
const checkboxSizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};
const checkboxVariantStyles = {
    primary: 'peer-checked:bg-primary-600 peer-checked:border-primary-600 dark:peer-checked:bg-primary-500',
    secondary: 'peer-checked:bg-secondary-600 peer-checked:border-secondary-600 dark:peer-checked:bg-secondary-500',
    success: 'peer-checked:bg-green-600 peer-checked:border-green-600 dark:peer-checked:bg-green-500',
    error: 'peer-checked:bg-red-600 peer-checked:border-red-600 dark:peer-checked:bg-red-500',
};
export const Checkbox = React.forwardRef(({ label, helperText, error = false, errorMessage, size = 'md', variant = 'primary', disabled = false, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const showError = error && errorMessage;
    return (_jsxs("div", { className: cn('flex items-start', className), children: [_jsxs("div", { className: "flex h-5 items-center", children: [_jsx("input", { ref: ref, type: "checkbox", id: id, disabled: disabled, className: "peer sr-only", ...props }), _jsx("label", { htmlFor: id, className: cn('relative flex cursor-pointer items-center justify-center rounded border-2 transition-all duration-200', checkboxSizeStyles[size], disabled
                            ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
                            : 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-500', !disabled && checkboxVariantStyles[variant], error && !disabled && 'border-red-600 dark:border-red-500', 'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-900'), children: _jsx(Check, { className: cn('text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100', size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'), strokeWidth: 3 }) })] }), (label || helperText || showError) && (_jsxs("div", { className: "ml-3 flex-1", children: [label && (_jsx("label", { htmlFor: id, className: cn('block cursor-pointer text-sm font-medium', disabled
                            ? 'text-neutral-400 dark:text-neutral-600'
                            : 'text-neutral-700 dark:text-neutral-300'), children: label })), helperText && !showError && (_jsx("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-500", children: helperText })), showError && (_jsx("p", { className: "mt-1 text-xs text-red-600 dark:text-red-400", children: errorMessage }))] }))] }));
});
Checkbox.displayName = 'Checkbox';
const radioSizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};
const radioInnerSizeStyles = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
};
const radioVariantStyles = {
    primary: 'peer-checked:border-primary-600 dark:peer-checked:border-primary-500',
    secondary: 'peer-checked:border-secondary-600 dark:peer-checked:border-secondary-500',
};
const radioInnerVariantStyles = {
    primary: 'bg-primary-600 dark:bg-primary-500',
    secondary: 'bg-secondary-600 dark:bg-secondary-500',
};
export const Radio = React.forwardRef(({ label, helperText, size = 'md', variant = 'primary', disabled = false, className, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    return (_jsxs("div", { className: cn('flex items-start', className), children: [_jsxs("div", { className: "flex h-5 items-center", children: [_jsx("input", { ref: ref, type: "radio", id: id, disabled: disabled, className: "peer sr-only", ...props }), _jsx("label", { htmlFor: id, className: cn('relative flex cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200', radioSizeStyles[size], disabled
                            ? 'cursor-not-allowed border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
                            : 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-500', !disabled && radioVariantStyles[variant], 'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-900'), children: _jsx("span", { className: cn('rounded-full opacity-0 transition-opacity duration-200 peer-checked:opacity-100', radioInnerSizeStyles[size], !disabled && radioInnerVariantStyles[variant]) }) })] }), (label || helperText) && (_jsxs("div", { className: "ml-3 flex-1", children: [label && (_jsx("label", { htmlFor: id, className: cn('block cursor-pointer text-sm font-medium', disabled
                            ? 'text-neutral-400 dark:text-neutral-600'
                            : 'text-neutral-700 dark:text-neutral-300'), children: label })), helperText && (_jsx("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-500", children: helperText }))] }))] }));
});
Radio.displayName = 'Radio';
const switchSizeStyles = {
    sm: {
        track: 'h-5 w-9',
        thumb: 'h-3.5 w-3.5',
        translate: 'peer-checked:translate-x-4',
    },
    md: {
        track: 'h-6 w-11',
        thumb: 'h-4 w-4',
        translate: 'peer-checked:translate-x-5',
    },
    lg: {
        track: 'h-7 w-14',
        thumb: 'h-5 w-5',
        translate: 'peer-checked:translate-x-7',
    },
};
const switchVariantStyles = {
    primary: 'peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500',
    secondary: 'peer-checked:bg-secondary-600 dark:peer-checked:bg-secondary-500',
    success: 'peer-checked:bg-green-600 dark:peer-checked:bg-green-500',
};
export const Switch = React.forwardRef(({ label, helperText, size = 'md', variant = 'primary', labelPosition = 'right', disabled = false, className, id: providedId, onCheckedChange, onChange, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const handleChange = (event) => {
        onChange?.(event);
        onCheckedChange?.(event.target.checked);
    };
    const switchElement = (_jsxs("div", { className: "flex h-5 items-center", children: [_jsx("input", { ref: ref, type: "checkbox", role: "switch", id: id, disabled: disabled, className: "peer sr-only", onChange: handleChange, ...props }), _jsx("label", { htmlFor: id, className: cn('relative inline-block cursor-pointer rounded-full transition-colors duration-200', switchSizeStyles[size].track, disabled
                    ? 'cursor-not-allowed bg-neutral-200 dark:bg-neutral-700'
                    : 'bg-neutral-300 dark:bg-neutral-600', !disabled && switchVariantStyles[variant], 'peer-focus-visible:ring-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-neutral-900'), children: _jsx("span", { className: cn('absolute top-1/2 left-0.5 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform duration-200 dark:bg-neutral-900', switchSizeStyles[size].thumb, switchSizeStyles[size].translate) }) })] }));
    const labelElement = (label || helperText) && (_jsxs("div", { className: "flex-1", children: [label && (_jsx("label", { htmlFor: id, className: cn('block cursor-pointer text-sm font-medium', disabled
                    ? 'text-neutral-400 dark:text-neutral-600'
                    : 'text-neutral-700 dark:text-neutral-300'), children: label })), helperText && (_jsx("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-500", children: helperText }))] }));
    return (_jsxs("div", { className: cn('flex items-start gap-3', className), children: [labelPosition === 'left' && labelElement, switchElement, labelPosition === 'right' && labelElement] }));
});
Switch.displayName = 'Switch';
const RadioGroupContext = createContext(undefined);
const radioGroupSpacingStyles = {
    vertical: {
        sm: 'space-y-2',
        md: 'space-y-3',
        lg: 'space-y-4',
    },
    horizontal: {
        sm: 'space-x-4',
        md: 'space-x-6',
        lg: 'space-x-8',
    },
};
export const RadioGroup = ({ name, value: controlledValue, defaultValue, onChange, disabled = false, label, error = false, errorMessage, helperText, orientation = 'vertical', spacing = 'md', className, children, }) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const handleChange = (newValue) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };
    const showError = error && errorMessage;
    return (_jsxs("div", { className: className, children: [label && (_jsx("label", { className: "mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: label })), _jsx(RadioGroupContext.Provider, { value: { name, value, onChange: handleChange, disabled }, children: _jsx("div", { className: cn(orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row flex-wrap', radioGroupSpacingStyles[orientation][spacing]), role: "radiogroup", children: children }) }), helperText && !showError && (_jsx("p", { className: "mt-2 text-xs text-neutral-500 dark:text-neutral-500", children: helperText })), showError && _jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-400", children: errorMessage })] }));
};
RadioGroup.displayName = 'RadioGroup';
export const RadioGroupOption = ({ value, ...props }) => {
    const context = useContext(RadioGroupContext);
    if (!context) {
        throw new Error('RadioGroupOption must be used within RadioGroup');
    }
    const { name, value: groupValue, onChange, disabled: groupDisabled } = context;
    const checked = value === groupValue;
    return (_jsx(Radio, { name: name, value: value, checked: checked, onChange: () => onChange?.(value), disabled: groupDisabled || props.disabled, ...props }));
};
RadioGroupOption.displayName = 'RadioGroupOption';
const checkboxGroupSpacingStyles = {
    vertical: {
        sm: 'space-y-2',
        md: 'space-y-3',
        lg: 'space-y-4',
    },
    horizontal: {
        sm: 'space-x-4',
        md: 'space-x-6',
        lg: 'space-x-8',
    },
};
export const CheckboxGroup = ({ value: controlledValue, defaultValue = [], onChange, disabled = false, label, error = false, errorMessage, helperText, orientation = 'vertical', spacing = 'md', className, children, }) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const handleToggle = (itemValue, checked) => {
        const newValue = checked
            ? [...value, itemValue]
            : value.filter((v) => v !== itemValue);
        if (controlledValue === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };
    const showError = error && errorMessage;
    return (_jsxs("div", { className: className, children: [label && (_jsx("label", { className: "mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: label })), _jsx("div", { className: cn(orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row flex-wrap', checkboxGroupSpacingStyles[orientation][spacing]), role: "group", children: React.Children.map(children, (child) => {
                    if (React.isValidElement(child) &&
                        child.type === CheckboxGroupOption) {
                        const { value: itemValue, disabled: childDisabled } = child.props;
                        return React.cloneElement(child, {
                            checked: value.includes(itemValue),
                            onChange: (e) => handleToggle(itemValue, e.target.checked),
                            disabled: disabled || childDisabled,
                        });
                    }
                    return child;
                }) }), helperText && !showError && (_jsx("p", { className: "mt-2 text-xs text-neutral-500 dark:text-neutral-500", children: helperText })), showError && _jsx("p", { className: "mt-2 text-xs text-red-600 dark:text-red-400", children: errorMessage })] }));
};
CheckboxGroup.displayName = 'CheckboxGroup';
export const CheckboxGroupOption = (props) => {
    return _jsx(Checkbox, { ...props });
};
CheckboxGroupOption.displayName = 'CheckboxGroupOption';
