/**
 * Memory Timeline Component
 *
 * Displays timeline of significant events (progress, injuries, goals).
 * KISS: Simple timeline list
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '../../../card';
import type {
  TimelineEvent,
  TimelineEventType,
  MemoryDomain,
} from '@giulio-leone/lib-core/user-memory/types';
import { cn } from '@giulio-leone/lib-design-system';
import { TrendingUp, AlertTriangle, Target, Award, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MemoryTimelineProps {
  userId: string;
  eventType?: TimelineEventType;
  domain?: MemoryDomain;
  limit?: number;
  className?: string;
}

const eventIcons: Record<TimelineEventType, LucideIcon> = {
  progress: TrendingUp,
  injury: AlertTriangle,
  goal: Target,
  milestone: Award,
  note: FileText,
};

const eventColors: Record<TimelineEventType, string> = {
  progress: 'text-green-600 dark:text-green-400',
  injury: 'text-red-600 dark:text-red-400',
  goal: 'text-primary-600 dark:text-primary-400',
  milestone: 'text-secondary-600 dark:text-secondary-400',
  note: 'text-neutral-600 dark:text-neutral-400',
};

export function MemoryTimeline({
  userId,
  eventType,
  domain,
  limit = 20,
  className,
}: MemoryTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimeline = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('userId', userId);
        if (eventType) params.set('eventType', eventType);
        if (domain) params.set('domain', domain);
        params.set('limit', limit.toString());

        const response = await fetch(`/api/memory/timeline?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to load timeline');

        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('[Timeline] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, [userId, eventType, domain, limit]);

  if (isLoading) {
    return (
      <Card variant="glass" padding="md" className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="border-t-primary-500 h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 dark:border-white/[0.08]" />
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card variant="glass" padding="md" className={className}>
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Nessun evento nella timeline
        </p>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="md" className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Timeline Eventi</h3>
      <div className="space-y-4">
        {events.map((event: TimelineEvent) => {
          const Icon = eventIcons[event.eventType] ?? FileText;
          const colorClass = eventColors[event.eventType] ?? eventColors.note;

          return (
            <div
              key={event.id}
              className="flex gap-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-white/[0.08] dark:bg-neutral-800/50"
            >
              <div className={cn('flex-shrink-0', colorClass)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-neutral-900 dark:text-white">{event.title}</p>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(event.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {event.description}
                  </p>
                )}
                {event.domain && (
                  <span className="inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-400">
                    {event.domain}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
