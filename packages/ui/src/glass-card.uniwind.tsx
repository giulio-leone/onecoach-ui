/**
 * GlassCard Component - Unified with Uniwind
 *
 * Cross-platform glassmorphism card using Uniwind className approach
 * Works on both web (Tailwind CSS) and native (Uniwind/Metro)
 */

import { View, Platform } from 'react-native';
import type { ViewProps } from 'react-native';
import { cn } from '@onecoach/lib-design-system';

export interface UnifiedGlassCardProps extends ViewProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  variant?: 'default' | 'active' | 'error' | 'success';
  children?: React.ReactNode;
}

export function UnifiedGlassCard({
  className,
  intensity = 'medium',
  variant = 'default',
  style,
  children,
  ...props
}: UnifiedGlassCardProps) {
  const intensityClasses = {
    light: 'bg-white/40 dark:bg-neutral-800/60',
    medium: 'bg-white/60 dark:bg-neutral-800/70',
    heavy: 'bg-white/80 dark:bg-neutral-800/80',
  };

  const variantClasses = {
    default: 'border-neutral-200 dark:border-neutral-800',
    active: 'border-blue-500/50 bg-blue-50/30 dark:bg-blue-900/20 dark:border-blue-400/50',
    error: 'border-red-500/50 bg-red-50/30 dark:bg-red-900/20 dark:border-red-400/50',
    success: 'border-green-500/50 bg-green-50/30 dark:bg-green-900/20 dark:border-green-400/50',
  };

  return (
    <View
      className={cn(
        'overflow-hidden rounded-3xl border',
        intensityClasses[intensity],
        variantClasses[variant],
        className
      )}
      style={[
        // Add shadow programmatically for native platforms
        Platform.OS !== 'web' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
