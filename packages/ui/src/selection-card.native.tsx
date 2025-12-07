import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { TouchableOpacityProps, ImageSourcePropType } from 'react-native';
import { cn } from '@onecoach/lib-design-system';
import { GlassCard } from './glass-card';

export interface SelectionCardProps extends TouchableOpacityProps {
  title: string;
  description?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  image?: ImageSourcePropType;
  className?: string;
  badge?: string;
}

export function SelectionCard({
  title,
  description,
  selected,
  icon,
  image,
  className,
  badge,
  ...props
}: SelectionCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      <GlassCard
        intensity={selected ? 'heavy' : 'light'}
        variant={selected ? 'active' : 'default'}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          selected ? 'scale-[1.02] shadow-md' : 'hover:bg-white/50 dark:hover:bg-neutral-800/50',
          className
        )}
      >
        {image && (
          <View className="h-32 w-full overflow-hidden">
            <Image source={image} className="h-full w-full object-cover opacity-90" />
            <View className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-900/90" />
          </View>
        )}

        <View className="p-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              {icon && (
                <View
                  className={cn(
                    'mb-3 self-start rounded-xl p-2.5 transition-colors',
                    selected
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  )}
                >
                  {icon}
                </View>
              )}

              <View className="flex-row items-center gap-2">
                <Text
                  className={cn(
                    'text-lg font-bold',
                    selected
                      ? 'text-blue-700 dark:text-blue-200'
                      : 'text-neutral-900 dark:text-white'
                  )}
                >
                  {title}
                </Text>
                {badge && (
                  <View className="rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/40">
                    <Text className="text-[10px] font-bold text-blue-700 uppercase dark:text-blue-200">
                      {badge}
                    </Text>
                  </View>
                )}
              </View>

              {description && (
                <Text
                  className={cn(
                    'mt-1.5 text-sm leading-relaxed',
                    selected
                      ? 'text-blue-600/90 dark:text-blue-200/90'
                      : 'text-neutral-500 dark:text-neutral-300'
                  )}
                >
                  {description}
                </Text>
              )}
            </View>

            <View
              className={cn(
                'h-6 w-6 items-center justify-center rounded-full border transition-all',
                selected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-neutral-300 bg-transparent dark:border-neutral-600'
              )}
            >
              {selected && <View className="h-2.5 w-2.5 rounded-full bg-white" />}
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}
