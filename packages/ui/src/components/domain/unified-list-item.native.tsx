import { View, TouchableOpacity } from 'react-native';
import { cn } from '@giulio-leone/lib-design-system/dark-mode-classes';
import { Text } from '../../typography';
import { Badge } from '../../badge';
import { CheckCircle2, Clock, Repeat } from 'lucide-react-native';

export interface UnifiedListItemProps {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'habit' | 'event';
  status: 'pending' | 'completed' | 'skipped' | 'in-progress';
  time?: string;
  priority?: 'low' | 'medium' | 'high';
  streak?: number;
  onToggle?: () => void;
  onPress?: () => void;
  className?: string;
}

/**
 * UnifiedListItem Component
 *
 * A versatile list item component designed to display both one-off Tasks
 * and recurring Habits in a unified "Agenda" view.
 */
export function UnifiedListItem({
  title,
  description,
  type,
  status,
  time,
  priority,
  streak,
  onToggle,
  onPress,
  className,
}: UnifiedListItemProps) {
  const isCompleted = status === 'completed';
  const isTask = type === 'task';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(
        'group relative mb-3 flex-row items-center overflow-hidden rounded-xl border p-4',
        'bg-gradient-to-br from-white/50 to-white/20 backdrop-blur-xl dark:from-neutral-900/50 dark:to-neutral-900/20',
        'ring-1 ring-white/20 dark:ring-white/10',
        'border-neutral-200/60 dark:border-white/[0.06]',
        'web:transition-all web:duration-200 web:hover:shadow-lg web:hover:shadow-neutral-200/50 dark:web:hover:shadow-neutral-900/50',
        isCompleted && 'opacity-60',
        className
      )}
    >
      {/* Left: Status Toggle */}
      <TouchableOpacity
        onPress={onToggle}
        className={cn(
          'mr-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-emerald-500 bg-emerald-500 dark:border-emerald-600 dark:bg-emerald-600'
            : 'border-zinc-300 hover:border-violet-500 dark:border-zinc-600 dark:hover:border-violet-400'
        )}
      >
        {isCompleted && <CheckCircle2 size={14} color="white" />}
      </TouchableOpacity>

      {/* Center: Content */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className={cn(
              'font-medium',
              isCompleted
                ? 'text-zinc-500 line-through dark:text-zinc-500'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {title}
          </Text>
          {/* Type Indicator (Icon) */}
          {isTask ? (
            <Badge variant="neutral" size="sm" className="h-5 px-1.5">
              Task
            </Badge>
          ) : (
            <Badge variant="info" size="sm" className="h-5 gap-1 px-1.5">
              <Repeat size={10} /> Habit
            </Badge>
          )}
        </View>

        {description && (
          <Text className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
            {description}
          </Text>
        )}

        {/* Meta Info Row */}
        <View className="mt-2 flex-row items-center gap-3">
          {time && (
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#a1a1aa" />
              <Text size="xs" className="text-zinc-500">
                {time}
              </Text>
            </View>
          )}

          {streak !== undefined && streak > 0 && (
            <View className="flex-row items-center gap-1">
              <Text size="xs" className="font-medium text-orange-500">
                🔥 {streak} day streak
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right: Priority Indicator (if high) */}
      {priority === 'high' && !isCompleted && (
        <View className="ml-2 h-2 w-2 rounded-full bg-red-500" />
      )}
    </TouchableOpacity>
  );
}
