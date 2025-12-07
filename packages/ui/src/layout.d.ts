/**
 * Layout Components
 *
 * Design system layout components following SOLID and DRY principles.
 * Mobile-first, responsive, and optimized for dark mode.
 * Provides: Container, Grid, Stack, Flex, Box, Divider, Spacer
 */
import React from 'react';
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Maximum width variant
     */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    /**
     * Center the container
     */
    center?: boolean;
    /**
     * Padding size
     */
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}
export declare const Container: React.ForwardRefExoticComponent<ContainerProps & React.RefAttributes<HTMLDivElement>>;
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Number of columns (responsive)
     */
    cols?: {
        default?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
        sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
        md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
        lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
        xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    };
    /**
     * Gap between grid items
     */
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /**
     * Align items
     */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /**
     * Justify items
     */
    justify?: 'start' | 'center' | 'end' | 'stretch';
    children: React.ReactNode;
}
export declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLDivElement>>;
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Direction of stack
     */
    direction?: 'vertical' | 'horizontal';
    /**
     * Spacing between items
     */
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /**
     * Align items
     */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /**
     * Justify content
     */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    /**
     * Wrap items
     */
    wrap?: boolean;
    /**
     * Responsive direction change
     */
    responsive?: {
        sm?: 'vertical' | 'horizontal';
        md?: 'vertical' | 'horizontal';
        lg?: 'vertical' | 'horizontal';
    };
    children: React.ReactNode;
}
export declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>>;
export declare const VStack: React.ForwardRefExoticComponent<Omit<StackProps, "direction"> & React.RefAttributes<HTMLDivElement>>;
export declare const HStack: React.ForwardRefExoticComponent<Omit<StackProps, "direction"> & React.RefAttributes<HTMLDivElement>>;
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Flex direction
     */
    direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
    /**
     * Align items
     */
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    /**
     * Justify content
     */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    /**
     * Flex wrap
     */
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    /**
     * Gap between items
     */
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}
export declare const Flex: React.ForwardRefExoticComponent<FlexProps & React.RefAttributes<HTMLDivElement>>;
export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
    /**
     * HTML element to render
     */
    as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
    /**
     * Padding
     */
    p?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /**
     * Margin
     */
    m?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}
export declare const Box: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<HTMLElement>>;
export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
    /**
     * Orientation
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * Thickness
     */
    thickness?: 'thin' | 'medium' | 'thick';
    /**
     * Spacing around divider
     */
    spacing?: 'none' | 'sm' | 'md' | 'lg';
    /**
     * Color variant
     */
    variant?: 'default' | 'strong' | 'subtle';
}
export declare const Divider: React.ForwardRefExoticComponent<DividerProps & React.RefAttributes<HTMLHRElement>>;
export interface LayoutSeparatorProps {
    /**
     * Text to display in the center
     */
    text?: string;
    /**
     * React node to display in the center (alternative to text)
     */
    children?: React.ReactNode;
    /**
     * Spacing around separator
     */
    spacing?: 'none' | 'sm' | 'md' | 'lg';
    /**
     * Color variant
     */
    variant?: 'default' | 'strong' | 'subtle' | 'elegant';
    /**
     * Additional className
     */
    className?: string;
}
export declare const LayoutSeparator: React.FC<LayoutSeparatorProps>;
export declare const Separator: React.FC<LayoutSeparatorProps>;
export interface SpacerProps {
    /**
     * Size of spacer
     */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    /**
     * Direction
     */
    direction?: 'vertical' | 'horizontal';
}
export declare const Spacer: React.FC<SpacerProps>;
