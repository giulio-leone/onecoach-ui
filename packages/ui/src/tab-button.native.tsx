/**
 * TabButton Component - React Native
 *
 * Cross-platform tab button component
 * Mobile-optimized, accessible
 */

import { View } from 'react-native';
import { Text } from './typography.native';
import { Button } from './button.native';
import type { LucideIcon } from 'lucide-react-native';
import type { TabButtonSharedProps } from './tab-button.shared';

export interface TabButtonProps extends TabButtonSharedProps {
  icon: LucideIcon;
}

export const TabButton = ({ active, onClick, icon: Icon, label, count }: TabButtonProps) => {
  return (
    <Button
      variant={active ? 'primary' : 'ghost'}
      size="md"
      onPress={onClick}
      className={`min-h-[44px] flex-row items-center justify-start rounded-2xl px-4 py-3 ${
        active
          ? 'elevation-3 bg-primary-600 shadow-sm'
          : 'elevation-2 bg-white shadow-xs dark:bg-neutral-800'
      }`}
    >
      <Icon size={20} color={active ? '#ffffff' : '#374151'} />
      <Text variant={active ? 'inverse' : 'secondary'} weight="semibold" className="ml-2 text-base">
        {label}
      </Text>
      {count !== undefined && (
        <View
          className={`ml-1 min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 ${
            active ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'
          }`}
        >
          <Text
            size="xs"
            weight="bold"
            className={active ? 'text-white' : 'text-emerald-700 dark:text-emerald-300'}
          >
            {count}
          </Text>
        </View>
      )}
    </Button>
  );
};
