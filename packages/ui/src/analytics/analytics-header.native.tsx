import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Card } from '../card';
import { Calendar, Download, Share2 } from 'lucide-react-native';
import { cn } from '@giulio-leone/lib-design-system';

export type Period = '7d' | '30d' | '90d' | '1y' | 'custom';

interface AnalyticsHeaderProps {
  title: string;
  subtitle?: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

export function AnalyticsHeader({
  title,
  subtitle,
  period,
  onPeriodChange,
  className,
}: AnalyticsHeaderProps) {
  const periods: Array<{ label: string; value: Period }> = [
    { label: '7G', value: '7d' },
    { label: '30G', value: '30d' },
    { label: '90G', value: '90d' },
    { label: '1A', value: '1y' },
  ];

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#d4d4d4' : '#525252'; // neutral-300 : neutral-700

  return (
    <View className={cn('mb-8 space-y-4', className)}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-neutral-900 dark:text-white">{title}</Text>
          {subtitle && (
            <Text className="mt-1 text-neutral-500 dark:text-neutral-400">{subtitle}</Text>
          )}
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity className="rounded-full border border-white/10 bg-white/10 p-2 hover:bg-white/20">
            <Download size={20} color={iconColor} />
          </TouchableOpacity>
          <TouchableOpacity className="rounded-full border border-white/10 bg-white/10 p-2 hover:bg-white/20">
            <Share2 size={20} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      <Card variant="glass" className="flex-row items-center justify-between p-2">
        <View className="flex-row items-center space-x-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          {periods.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => onPeriodChange(p.value)}
              className={cn(
                'rounded-md px-3 py-1.5 transition-all',
                period === p.value
                  ? 'bg-white shadow-sm dark:bg-neutral-700'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium',
                  period === p.value
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="flex-row items-center space-x-2 rounded-lg px-3 py-1.5 hover:bg-white/10">
          <Calendar size={16} color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'} />
          <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Personalizza
          </Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}
