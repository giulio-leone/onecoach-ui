/**
 * Form Control Components
 *
 * Advanced form controls following SOLID and DRY principles.
 * Mobile-first, accessible, and optimized for dark mode.
 * Provides: Checkbox, Radio, Switch, RadioGroup, CheckboxGroup
 */
import React from 'react';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /**
     * Label for the checkbox
     */
    label?: React.ReactNode;
    /**
     * Helper text
     */
    helperText?: string;
    /**
     * Error state
     */
    error?: boolean;
    /**
     * Error message
     */
    errorMessage?: string;
    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Color variant
     */
    variant?: 'primary' | 'secondary' | 'success' | 'error';
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /**
     * Label for the radio
     */
    label?: React.ReactNode;
    /**
     * Helper text
     */
    helperText?: string;
    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Color variant
     */
    variant?: 'primary' | 'secondary';
}
export declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /**
     * Label for the switch
     */
    label?: React.ReactNode;
    /**
     * Helper text
     */
    helperText?: string;
    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Color variant
     */
    variant?: 'primary' | 'secondary' | 'success';
    /**
     * Label position
     */
    labelPosition?: 'left' | 'right';
    /**
     * Callback opzionale che restituisce direttamente il valore booleano
     */
    onCheckedChange?: (checked: boolean) => void;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;
export interface RadioGroupProps {
    /**
     * Group name
     */
    name?: string;
    /**
     * Selected value
     */
    value?: string;
    /**
     * Default value
     */
    defaultValue?: string;
    /**
     * Change handler
     */
    onChange?: (value: string) => void;
    /**
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Label for the group
     */
    label?: string;
    /**
     * Error state
     */
    error?: boolean;
    /**
     * Error message
     */
    errorMessage?: string;
    /**
     * Helper text
     */
    helperText?: string;
    /**
     * Orientation
     */
    orientation?: 'vertical' | 'horizontal';
    /**
     * Spacing between items
     */
    spacing?: 'sm' | 'md' | 'lg';
    className?: string;
    children: React.ReactNode;
}
export declare const RadioGroup: React.FC<RadioGroupProps>;
export interface RadioGroupOptionProps extends Omit<RadioProps, 'name' | 'checked' | 'onChange'> {
    value: string;
}
export declare const RadioGroupOption: React.FC<RadioGroupOptionProps>;
export interface CheckboxGroupProps {
    /**
     * Selected values
     */
    value?: string[];
    /**
     * Default values
     */
    defaultValue?: string[];
    /**
     * Change handler
     */
    onChange?: (values: string[]) => void;
    /**
     * Disabled state
     */
    disabled?: boolean;
    /**
     * Label for the group
     */
    label?: string;
    /**
     * Error state
     */
    error?: boolean;
    /**
     * Error message
     */
    errorMessage?: string;
    /**
     * Helper text
     */
    helperText?: string;
    /**
     * Orientation
     */
    orientation?: 'vertical' | 'horizontal';
    /**
     * Spacing between items
     */
    spacing?: 'sm' | 'md' | 'lg';
    className?: string;
    children: React.ReactNode;
}
export declare const CheckboxGroup: React.FC<CheckboxGroupProps>;
export interface CheckboxGroupOptionProps extends Omit<CheckboxProps, 'checked' | 'onChange'> {
    value: string;
    checked?: boolean;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}
export declare const CheckboxGroupOption: React.FC<CheckboxGroupOptionProps>;
