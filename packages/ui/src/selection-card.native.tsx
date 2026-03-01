import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import type { TouchableOpacityProps, ImageSourcePropType } from 'react-native';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from './card';

export interface SelectionCardProps extends TouchableOpacityProps {
  title: string;
  description?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  image?: ImageSourcePropType;
  className?: string;
  badge?: string;
  compact?: boolean;
}

export function SelectionCard({
  title,
  description,
  selected,
  icon,
  image,
  className,
  badge,
  compact,
  ...props
}: SelectionCardProps) {
  // Fix for "shadow* style props are deprecated" warning on Web
  const isWeb = Platform.OS === 'web';
  const webShadowStyle =
    isWeb && selected
      ? { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
      : undefined;

  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      <Card
        variant={selected ? 'glass-strong' : 'glass'}
        glassIntensity={selected ? 'heavy' : 'light'}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          compact && 'rounded-xl',
          selected
            ? cn(
                'border-primary-500/50 scale-[1.02]',
                !isWeb && 'shadow-md', // Only use Native shadow classes on Native
                compact && 'shadow-none' // Disable large shadow if compact (web handles it via style or lighter class)
              )
            : 'hover:bg-white/50 dark:hover:bg-white/[0.06]/50',
          className
        )}
        style={webShadowStyle}
      >
        {image && (
          <View className={cn('w-full overflow-hidden', compact ? 'h-16' : 'h-32')}>
            <Image source={image} className="h-full w-full object-cover opacity-90" alt="" />
            <View className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-900/90" />
          </View>
        )}

        <View className={cn(compact ? 'p-3' : 'p-5')}>
          <View
            className={cn(
              'flex-row justify-between gap-3',
              compact ? 'items-center' : 'items-start'
            )}
          >
            <View className="flex-1">
              <View className={cn('flex-row items-center gap-2', compact && 'flex-1')}>
                {icon && (
                  <View
                    className={cn(
                      'items-center justify-center transition-colors',
                      compact ? 'mr-2 rounded-lg p-1.5' : 'mb-3 self-start rounded-xl p-2.5',
                      selected
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400'
                    )}
                  >
                    {/* Render icon children if possible, adjusting size if needed for compact */}
                    {icon}
                  </View>
                )}

                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      numberOfLines={1}
                      className={cn(
                        'font-bold',
                        compact ? 'text-sm' : 'text-lg',
                        selected
                          ? 'text-primary-700 dark:text-primary-200'
                          : 'text-neutral-900 dark:text-white'
                      )}
                    >
                      {title}
                    </Text>
                    {badge && (
                      <View className="rounded-full bg-primary-100 px-2 py-0.5 dark:bg-primary-900/40">
                        <Text className="text-[10px] font-bold text-primary-700 uppercase dark:text-primary-200">
                          {badge}
                        </Text>
                      </View>
                    )}
                  </View>

                  {description && (
                    <Text
                      numberOfLines={compact ? 1 : undefined}
                      className={cn(
                        'leading-relaxed',
                        compact ? 'mt-0.5 text-xs' : 'mt-1.5 text-sm',
                        selected
                          ? 'text-primary-600/90 dark:text-primary-200/90'
                          : 'text-neutral-500 dark:text-neutral-300'
                      )}
                    >
                      {description}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View
              className={cn(
                'items-center justify-center rounded-full border transition-all',
                compact ? 'h-4 w-4' : 'h-6 w-6',
                selected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 bg-transparent dark:border-white/[0.1]'
              )}
            >
              {selected && (
                <View
                  className={cn('rounded-full bg-white', compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5')}
                />
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
