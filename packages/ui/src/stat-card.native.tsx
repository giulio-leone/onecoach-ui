import React from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from './glass-card';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@onecoach/lib-design-system';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon | React.ElementType;
  subtitle?: string;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
  trend,
  className,
}: StatCardProps) {
  const gradients = {
    green: ['#22c55e', '#16a34a'],
    blue: ['#3b82f6', '#2563eb'],
    purple: ['#a855f7', '#9333ea'],
    orange: ['#f97316', '#ea580c'],
    red: ['#ef4444', '#dc2626'],
  };

  const gradientColors = (gradients[color as keyof typeof gradients] || gradients.blue) as [
    string,
    string,
  ];

  return (
    <GlassCard className={cn('p-4', className)} intensity="medium">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {label}
          </Text>
          <View className="mt-2 flex-row items-baseline gap-2">
            <Text className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              {value}
            </Text>
          </View>
        </View>
        {Icon && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm"
          >
            <Icon size={24} color="white" />
          </LinearGradient>
        )}
      </View>

      {(subtitle || trend) && (
        <View className="mt-4 flex-row items-center gap-2">
          {trend && (
            <View
              className={cn(
                'flex-row items-center gap-1 rounded-full px-2 py-0.5',
                trend.isPositive
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
          {subtitle && (
            <Text className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </GlassCard>
  );
}
