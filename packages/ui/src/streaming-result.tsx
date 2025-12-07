import { View, Text, ScrollView } from 'react-native';
import { cn } from '@onecoach/lib-design-system';
import { GlassCard } from './glass-card';
import { ActivityIndicator } from 'react-native';

export interface StreamEvent {
  type: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface StreamingResultProps {
  isStreaming: boolean;
  progress: number;
  currentMessage: string;
  events: StreamEvent[];
  className?: string;
}

export function StreamingResult({
  isStreaming,
  progress,
  currentMessage,
  events,
  className,
}: StreamingResultProps) {
  if (!isStreaming && events.length === 0) return null;

  return (
    <View className={cn('space-y-4', className)}>
      {/* Progress Card */}
      <GlassCard className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            {isStreaming && <ActivityIndicator size="small" color="#10B981" />}
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {currentMessage || 'Inizializzazione...'}
            </Text>
          </View>
          <Text className="text-sm font-bold text-green-600 dark:text-green-400">
            {Math.round(progress)}%
          </Text>
        </View>
        <View className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <View
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </View>
      </GlassCard>

      {/* Events Log */}
      <GlassCard className="max-h-60 overflow-hidden p-0">
        <View className="border-b border-neutral-100 bg-neutral-50/50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/30">
          <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
            Log Generazione
          </Text>
        </View>
        <ScrollView className="p-4" nestedScrollEnabled>
          {events.length === 0 ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              In attesa di aggiornamenti...
            </Text>
          ) : (
            <View className="space-y-3">
              {events.map((event, index) => (
                <View key={index} className="flex-row gap-3">
                  <View
                    className={cn(
                      'mt-1.5 h-2 w-2 rounded-full',
                      event.type === 'info' && 'bg-blue-400',
                      event.type === 'success' && 'bg-green-400',
                      event.type === 'warning' && 'bg-yellow-400',
                      event.type === 'error' && 'bg-red-400'
                    )}
                  />
                  <View className="flex-1">
                    <Text className="text-sm text-neutral-700 dark:text-neutral-300">
                      {event.message}
                    </Text>
                    <Text className="text-xs text-neutral-400 dark:text-neutral-500">
                      {event.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </GlassCard>
    </View>
  );
}
