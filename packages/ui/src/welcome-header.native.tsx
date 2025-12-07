'use client';

import { View, Text } from 'react-native';
import { Avatar } from './avatar';
import { GlassCard } from './glass-card';
import { cn } from '@onecoach/lib-design-system';

interface WelcomeHeaderProps {
  userName?: string | null;
  className?: string;
}

export function WelcomeHeader({ userName, className }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  return (
    <GlassCard
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
        <Text className="text-lg font-medium text-neutral-500 dark:text-neutral-400">
          {getGreeting()},
        </Text>
        <Text className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {userName || 'Atleta'}
        </Text>
      </View>
    </GlassCard>
  );
}
