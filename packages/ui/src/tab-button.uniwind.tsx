/**
 * TabButton Component - Unified with Uniwind
 *
 * Cross-platform tab button using Uniwind className approach
 * Works on both web (Tailwind CSS) and native (Uniwind/Metro)
 */

import { Pressable, Text, View, Platform } from 'react-native';
import type { ComponentType } from 'react';
import { cn } from '@onecoach/lib-design-system';
import type { TabButtonSharedProps } from './tab-button.shared';

export interface UnifiedTabButtonProps extends TabButtonSharedProps {
  icon: ComponentType<{ size?: number; color?: string; className?: string }>;
}

export const UnifiedTabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: UnifiedTabButtonProps) => {
  return (
    <Pressable
      onPress={onClick}
      className={cn(
        'flex-row items-center gap-2 rounded-2xl px-4 py-3',
        active
          ? 'bg-emerald-500 shadow-lg dark:bg-emerald-600'
          : 'bg-white shadow-sm dark:bg-neutral-800'
      )}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        // Shadow for iOS (className shadow doesn't work well on RN)
        ...(Platform.OS === 'ios' && {
          shadowColor: active ? '#10b981' : '#000',
          shadowOffset: { width: 0, height: active ? 2 : 1 },
          shadowOpacity: active ? 0.3 : 0.1,
          shadowRadius: active ? 4 : 2,
        }),
        // Elevation for Android
        ...(Platform.OS === 'android' && {
          elevation: active ? 3 : 2,
        }),
      })}
    >
      <Icon size={20} color={active ? '#ffffff' : '#374151'} />
      <Text
        className={cn(
          'text-base font-semibold',
          active ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
        )}
      >
        {label}
      </Text>
      {count !== undefined && (
        <View
          className={cn(
            'min-w-[24px] items-center justify-center rounded-xl px-2 py-1',
            active ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'
          )}
        >
          <Text
            className={cn(
              'text-xs font-bold',
              active ? 'text-white' : 'text-emerald-700 dark:text-emerald-300'
            )}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
