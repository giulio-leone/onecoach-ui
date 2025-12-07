/**
 * Memory Hooks
 *
 * React hooks for memory management.
 * KISS: Simple hooks with cache
 * DRY: Reusable data fetching logic
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getMemory,
  updateMemoryPreferences,
  updateMemory,
  enhanceText,
  getVersionHistory,
  saveVersion,
  getTimeline,
  createTimelineEvent,
} from '@onecoach/lib-api-client/memory';
import type {
  UserMemory,
  MemoryDomain,
  MemoryUpdate,
  TimelineEvent,
  TimelineEventType,
  MemoryVersion,
} from '@onecoach/lib-core/user-memory/types';

/**
 * Hook for fetching and managing memory
 */
export function useMemory(domain?: MemoryDomain) {
  const [memory, setMemory] = useState<UserMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMemory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMemory({ domain });
      setMemory(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  const updatePreferences = useCallback(
    async (prefs: Record<string, unknown>) => {
      if (!domain) throw new Error('Domain required');
      const updated = await updateMemoryPreferences(domain, prefs);
      setMemory(updated);
    },
    [domain]
  );

  const update = useCallback(async (update: MemoryUpdate) => {
    const updated = await updateMemory(update);
    setMemory(updated);
  }, []);

  return {
    memory,
    isLoading,
    error,
    reload: loadMemory,
    updatePreferences,
    update,
  };
}

/**
 * Hook for enhanced text
 */
export function useEnhancedText() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const enhance = useCallback(
    async (
      text: string,
      options: {
        context?: string;
        domain?: MemoryDomain;
        style?: 'professional' | 'casual' | 'detailed' | 'concise';
      } = {}
    ) => {
      setIsEnhancing(true);
      setError(null);
      try {
        return await enhanceText(text, options);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setIsEnhancing(false);
      }
    },
    []
  );

  return { enhance, isEnhancing, error };
}

/**
 * Hook for version history
 */
export function useVersionHistory(limit: number = 20) {
  const [versions, setVersions] = useState<MemoryVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getVersionHistory(limit);
      setVersions(data);
    } catch (error) {
      console.error('[useVersionHistory] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const save = useCallback(
    async (changeNote?: string) => {
      const version = await saveVersion(changeNote);
      await loadVersions();
      return version;
    },
    [loadVersions]
  );

  return { versions, isLoading, reload: loadVersions, save };
}

/**
 * Hook for timeline
 */
export function useTimeline(
  options: {
    eventType?: TimelineEventType;
    domain?: MemoryDomain;
    limit?: number;
  } = {}
) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTimeline(options);
      setEvents(data);
    } catch (error) {
      console.error('[useTimeline] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [options.eventType, options.domain, options.limit]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const addEvent = useCallback(
    async (event: {
      eventType: TimelineEventType;
      domain?: MemoryDomain;
      title: string;
      description?: string;
      data?: Record<string, unknown>;
      date: string;
    }) => {
      const newEvent = await createTimelineEvent(event);
      await loadTimeline();
      return newEvent;
    },
    [loadTimeline]
  );

  return { events, isLoading, reload: loadTimeline, addEvent };
}
