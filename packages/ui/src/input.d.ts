/**
 * Input Component
 *
 * Mobile-first, touch-friendly input with design tokens
 * Minimum 44px height, WCAG AA compliant
 */
import React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
