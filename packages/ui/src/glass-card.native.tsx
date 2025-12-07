import React from 'react';
import { Platform, View } from 'react-native';
import type { ViewProps } from 'react-native';
import { cn } from '@onecoach/lib-design-system';

export interface GlassCardProps extends ViewProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  variant?: 'default' | 'active' | 'error' | 'success';
  gradient?: boolean;
  children?: React.ReactNode;
}

const intensityClasses: Record<NonNullable<GlassCardProps['intensity']>, string> = {
  light: 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm',
  medium: 'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md',
  heavy: 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg',
};

const variantClasses: Record<NonNullable<GlassCardProps['variant']>, string> = {
  default: 'border-zinc-200 dark:border-zinc-800',
  active: 'border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-400/50',
  error: 'border-rose-500/50 bg-rose-50/30 dark:bg-rose-900/20 dark:border-rose-400/50',
  success:
    'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-900/20 dark:border-emerald-400/50',
};

export function GlassCard({
  className,
  intensity = 'medium',
  variant = 'default',
  gradient = false,
  children,
  style,
  ...props
}: GlassCardProps) {
  const isWeb = Platform.OS === 'web';

  return (
    <View
      className={cn(
        'group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300',
        intensityClasses[intensity],
        gradient ? 'border-transparent' : variantClasses[variant],
        isWeb && 'hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700',
        className
      )}
      style={style}
      {...props}
    >
      {isWeb && gradient && (
        <>
          <View
            pointerEvents="none"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10"
          />
          <View
            pointerEvents="none"
            className="absolute inset-0 -z-20 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </>
      )}
      {children}
    </View>
  );
}
