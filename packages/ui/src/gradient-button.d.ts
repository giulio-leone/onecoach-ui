/**
 * GradientButton Component - Web
 *
 * Web version using CSS gradients instead of expo-linear-gradient
 */
import React from 'react';
export interface GradientButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    label?: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary';
    className?: string;
    textClassName?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    onPress?: () => void;
}
export declare function GradientButton({ label, loading, variant, className, textClassName, icon, disabled, children, onClick, onPress, ...props }: GradientButtonProps): import("react/jsx-runtime").JSX.Element;
