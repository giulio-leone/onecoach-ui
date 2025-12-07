/**
 * Textarea Component
 *
 * Mobile-first, touch-friendly textarea with design tokens
 * Minimum 44px height, WCAG AA compliant
 */
import React from 'react';
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
