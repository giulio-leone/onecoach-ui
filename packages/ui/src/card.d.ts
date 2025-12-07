/**
 * Card Component
 *
 * Mobile-first, responsive card with design tokens
 * Deep dark mode optimized
 */
import React from 'react';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'bordered' | 'interactive' | 'glass' | 'glass-strong' | 'hover';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}
export declare const Card: ({ variant, padding, children, className, ...props }: CardProps) => import("react/jsx-runtime").JSX.Element;
declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const CardAction: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction };
