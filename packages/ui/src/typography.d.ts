/**
 * Typography Components
 *
 * Design system typography components following SOLID and DRY principles.
 * Mobile-first, responsive, and optimized for dark mode.
 */
import React from 'react';
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /**
     * The heading level (h1-h6)
     */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /**
     * Visual size variant (can differ from semantic level)
     */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    /**
     * Font weight
     */
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
    /**
     * Text alignment
     */
    align?: 'left' | 'center' | 'right';
    /**
     * Color variant
     */
    variant?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand';
    /**
     * Adds gradient text effect
     */
    gradient?: boolean;
    /**
     * Truncate text with ellipsis
     */
    truncate?: boolean;
    children: React.ReactNode;
}
export declare const Heading: React.ForwardRefExoticComponent<HeadingProps & React.RefAttributes<HTMLHeadingElement>>;
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    /**
     * HTML element to render
     */
    as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'strong' | 'em';
    /**
     * Text size
     */
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
    /**
     * Font weight
     */
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    /**
     * Text alignment
     */
    align?: 'left' | 'center' | 'right' | 'justify';
    /**
     * Color variant
     */
    variant?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' | 'link' | 'success' | 'warning' | 'error' | 'info';
    /**
     * Truncate text with ellipsis
     */
    truncate?: boolean;
    /**
     * Line clamp (max lines before truncating)
     */
    lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
    /**
     * React Native compatibility prop for line clamping
     */
    numberOfLines?: number;
    children: React.ReactNode;
}
export declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLElement>>;
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /**
     * Label size
     */
    size?: 'sm' | 'base' | 'lg';
    /**
     * Font weight
     */
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    /**
     * Whether this label is for a required field
     */
    required?: boolean;
    /**
     * Whether the field is disabled
     */
    disabled?: boolean;
    children: React.ReactNode;
}
export declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    /**
     * Variant for different states
     */
    variant?: 'default' | 'error' | 'success' | 'warning';
    children: React.ReactNode;
}
export declare const HelperText: React.ForwardRefExoticComponent<HelperTextProps & React.RefAttributes<HTMLParagraphElement>>;
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    /**
     * Whether to render as a block or inline
     */
    block?: boolean;
    /**
     * Language for syntax highlighting context
     */
    language?: string;
    children: React.ReactNode;
}
export declare const Code: React.ForwardRefExoticComponent<CodeProps & React.RefAttributes<HTMLElement>>;
