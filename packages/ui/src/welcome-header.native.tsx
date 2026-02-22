'use client';

import { View, Text } from 'react-native';
import { Avatar } from './avatar';
import { Card } from './card';
import { cn } from '@giulio-leone/lib-design-system';

interface WelcomeHeaderProps {
  userName?: string | null;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function WelcomeHeader({ userName, className, title, subtitle }: WelcomeHeaderProps) {
  return (
    <Card variant="glass"
      intensity="light"
      className={cn(
        'flex flex-row items-center gap-4 p-6',
        'bg-gradient-to-r from-indigo-500/10 to-purple-500/10',
        'border-white/20 dark:border-white/10',
        className
      )}
    >
      <Avatar
        fallback={userName?.[0] || 'U'}
        size="xl"
        className="border-2 border-white shadow-lg dark:border-neutral-800"
        bordered
      />
      <View className="flex-1 gap-1">
        {subtitle && (
          <Text className="text-lg font-medium text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </Text>
        )}
        <Text className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {title || userName || 'Welcome'}
        </Text>
      </View>
    </Card>
  );
}
