'use client';

import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';
import { Card } from './card';

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
  title?: string;
  className?: string; // Kept for interface compatibility, ignored
  style?: ViewStyle;
}

function getEventIcon(type: string, message: string) {
  const lowerMessage = message.toLowerCase();
  const lowerType = type.toLowerCase();

  // Icon size 16 to match "h-4 w-4"
  if (lowerMessage.includes('completato') || lowerType === 'complete' || lowerType === 'success') {
    return <CheckCircle2 size={16} color="#10b981" />; // emerald-500
  }
  if (lowerMessage.includes('starting') || lowerType === 'start' || lowerType === 'progress') {
    return <Loader2 size={16} color="#3b82f6" />; // primary-500
    // Note: Manual rotation would be needed for spin, or simple ActivityIndicator
  }
  if (lowerType === 'error' || lowerType === 'warning') {
    return <AlertCircle size={16} color="#f59e0b" />; // amber-500
  }
  return <Sparkles size={16} color="#a3a3a3" />; // neutral-400
}

function EventCard({ event }: { event: StreamEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasData = event.data && Object.keys(event.data).length > 0;

  return (
    <Pressable
      onPress={() => hasData && setIsExpanded((prev) => !prev)}
      style={({ pressed }) => [styles.eventCard, hasData && pressed && styles.eventCardPressed]}
    >
      <View style={styles.eventRow}>
        <View style={styles.iconContainer}>{getEventIcon(event.type, event.message)}</View>
        <View style={styles.textContainer}>
          <Text style={styles.eventMessage} numberOfLines={isExpanded ? undefined : 2}>
            {event.message}
          </Text>
          <Text style={styles.timestamp}>{event.timestamp.toLocaleTimeString()}</Text>
        </View>
        {hasData && (
          <View style={styles.chevronContainer}>
            {isExpanded ? (
              <ChevronDown size={16} color="#a3a3a3" />
            ) : (
              <ChevronRight size={16} color="#a3a3a3" />
            )}
          </View>
        )}
      </View>
      {isExpanded && hasData && (
        <View style={styles.dataContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.dataText}>{JSON.stringify(event.data, null, 2)}</Text>
          </ScrollView>
        </View>
      )}
    </Pressable>
  );
}

export function StreamingResult({
  isStreaming,
  progress,
  currentMessage,
  events,
  title,
  style,
}: StreamingResultProps) {
  if (!isStreaming && events.length === 0) return null;

  // Process events to merge same-agent updates
  const processedEvents = events.reduce((acc: any, event: any) => {
    // Try to find if this agent/role already exists in accumulator
    const agentId =
      event.data?.agent ||
      event.data?.role ||
      (event.type.startsWith('agent_') ? event.data?.step : undefined);

    if (agentId) {
      const existingIndex = acc.findIndex((e) => {
        const eId =
          e.data?.agent || e.data?.role || (e.type.startsWith('agent_') ? e.data?.step : undefined);
        return eId === agentId;
      });

      if (existingIndex >= 0) {
        // Update existing entry
        const existingEvent = acc[existingIndex];
        if (existingEvent) {
          acc[existingIndex] = {
            ...existingEvent,
            type: event.type,
            message: event.message,
            timestamp: event.timestamp,
            data: { ...(existingEvent.data || {}), ...event.data },
          };
        }
        return acc;
      }
    }

    // Default: append
    acc.push(event);
    return acc;
  }, [] as StreamEvent[]);

  return (
    <View style={[styles.container, style]}>
      {/* Progress Card */}
      <Card variant="glass" style={styles.progressCard} padding="md">
        <View style={styles.progressHeader}>
          <View style={styles.statusContainer}>
            {isStreaming && (
              <ActivityIndicator size="small" color="#10B981" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.statusText} numberOfLines={1}>
              {currentMessage || 'Inizializzazione...'}
            </Text>
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {/* Gradient Progress Bar */}
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={['#3b82f6', '#10b981', '#34d399']} // primary-500, emerald-500, emerald-400
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>
      </Card>

      {/* Events Log */}
      <Card variant="glass" style={styles.logCard} padding="none">
        <View style={styles.logHeader}>
          <Sparkles size={16} color="#3b82f6" />
          <Text style={styles.logTitle}>{title || 'AI Agent Orchestrator'}</Text>
        </View>
        <ScrollView
          style={styles.logScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.logContent}
        >
          {processedEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Loader2 size={24} color="#3b82f6" />
              <Text style={styles.emptyText}>In attesa di aggiornamenti...</Text>
            </View>
          ) : (
            processedEvents.map((event, index) => (
              <EventCard key={`${event.type}-${index}`} event={event} />
            ))
          )}
        </ScrollView>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, // Explicit padding as requested
    gap: 16,
  },
  progressCard: {
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // neutral-700
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669', // emerald-600
  },
  progressBarBg: {
    height: 10,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: '#f5f5f5', // neutral-100
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  logCard: {
    maxHeight: 320,
    overflow: 'hidden',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5', // neutral-100
    backgroundColor: 'rgba(250, 250, 250, 0.8)', // neutral-50/80
  },
  logTitle: {
    fontSize: 16, // font-semibold equivalent
    fontWeight: '600',
    color: '#171717', // neutral-900
  },
  logScroll: {
    padding: 12,
  },
  logContent: {
    gap: 8,
    paddingBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#737373', // neutral-500
  },

  // Event Card Styles
  eventCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 229, 0.6)', // neutral-200/60
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // white/50
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eventCardPressed: {
    backgroundColor: '#fafafa', // neutral-50
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  eventMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#262626', // neutral-800
  },
  timestamp: {
    marginTop: 2,
    fontSize: 12,
    color: '#a3a3a3', // neutral-400
  },
  chevronContainer: {
    marginTop: 2,
  },
  dataContainer: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#0a0a0a', // neutral-950
    padding: 12,
  },
  dataText: {
    fontFamily: 'monospace', // Platform dependent, usually safe
    fontSize: 12,
    color: '#6ee7b7', // emerald-300
  },
});
