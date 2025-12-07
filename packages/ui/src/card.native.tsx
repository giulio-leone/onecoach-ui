
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { cn } from '@onecoach/lib-design-system';
import type { ViewProps, ViewStyle } from 'react-native';

export interface CardProps extends ViewProps {
    className?: string;
    variant?:
    | 'default'
    | 'elevated'
    | 'bordered'
    | 'interactive'
    | 'glass'
    | 'glass-strong'
    | 'hover';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    glassIntensity?: 'light' | 'medium' | 'heavy';
    gradient?: boolean;
    children?: React.ReactNode;
}

const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
};

const glassIntensityClasses: Record<NonNullable<CardProps['glassIntensity']>, string> = {
    light: 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm',
    medium: 'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md',
    heavy: 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg',
};

export const Card = ({
    variant = 'default',
    padding = 'md',
    glassIntensity = 'medium',
    gradient = false,
    className,
    style,
    children,
    ...props
}: CardProps) => {
    const isWeb = Platform.OS === 'web';

    const isGlass = variant === 'glass' || variant === 'glass-strong';

    // Base styles for standard variants
    const getVariantClasses = () => {
        switch (variant) {
            case 'default':
                return 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl';
            case 'elevated':
                return 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 shadow-xl rounded-2xl';
            case 'bordered':
                return 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl';
            case 'glass':
            case 'glass-strong':
                return cn(
                    'rounded-2xl border shadow-sm',
                    variant === 'glass-strong' ? glassIntensityClasses.heavy : glassIntensityClasses[glassIntensity],
                    gradient ? 'border-transparent' : 'border-zinc-200 dark:border-zinc-800'
                );
            default:
                return 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl';
        }
    };

    return (
        <View
            className={cn(
                getVariantClasses(),
                paddingStyles[padding],
                className
            )}
            style={style}
            {...props}
        >
            {/* Web specific gradient effects - disabled on Native unless we use absolute positioned views/images for gradient */}
            {isWeb && isGlass && gradient && (
                <>
                    {/* Gradient Background placeholder for web parity if processed by RNWeb */}
                    <View
                        pointerEvents="none"
                        className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"
                    />
                </>
            )}
            {children}
        </View>
    );
};
