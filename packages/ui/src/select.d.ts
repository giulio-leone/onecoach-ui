/**
 * Select Component
 *
 * Mobile-first, touch-friendly select with design tokens
 * Minimum 44px height, WCAG AA compliant
 */
import React from 'react';
export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    placeholder?: string;
    /**
     * Callback semplificata che restituisce solo il valore selezionato
     */
    onValueChange?: (value: string) => void;
    /**
     * Opzioni dichiarative; se valorizzate sostituiscono i children
     */
    options?: SelectOption[];
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
