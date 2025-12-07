'use client';

import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'solito/link';
import { GlassCard } from './glass-card';
import { cn } from '@onecoach/lib-design-system';
import { ChevronRight } from 'lucide-react-native';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType | string;
  href: string;
  color?: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsGrid({ actions, className }: QuickActionsGridProps) {
  return (
    <View className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {actions.map((action: unknown) => {
        const Icon = typeof action.icon !== 'string' ? action.icon : null;

        return (
          <Link key={action.id} href={action.href} viewProps={{ style: { flex: 1 } }}>
            <GlassCard
              intensity="light"
              className={cn(
                'group relative flex h-full flex-row items-center gap-4 p-4 transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10',
                'border-neutral-200/50 dark:border-neutral-800/50'
              )}
            >
              <View
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300',
                  'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
                  'group-hover:bg-indigo-500 group-hover:text-white'
                )}
              >
                {Icon ? (
                  <Icon
                    size={24}
                    strokeWidth={2}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <Text className="text-xl">{action.icon}</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="font-semibold text-neutral-900 dark:text-white">
                  {action.label}
                </Text>
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {action.description}
                </Text>
              </View>

              <ChevronRight
                size={20}
                className="text-neutral-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-neutral-600"
              />
            </GlassCard>
          </Link>
        );
      })}
    </View>
  );
}
