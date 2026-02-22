'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

/**
 * Workflow types for filtering
 */
export type WorkflowType =
  | 'workout-generation'
  | 'nutrition-generation'
  | 'agenda-planning'
  | 'exercise-generation'
  | 'food-generation'
  | 'shopping-generation'
  | 'flight-search-generation'
  | 'copilot-chat';

/**
 * Generation status
 */
export type GenerationStatus = 'running' | 'completed' | 'failed';

/**
 * User generation metadata from database
 */
export interface UserGeneration {
  run_id: string;
  user_id: string;
  workflow_type: WorkflowType;
  agent_id: string;
  progress: number;
  current_step: string | null;
  total_steps: number | null;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
  estimated_duration_ms: number | null;
  result_entity_type: string | null;
  result_entity_id: string | null;
}

/**
 * Computed generation status
 */
export interface GenerationWithStatus extends UserGeneration {
  status: GenerationStatus;
  elapsedMs: number;
  estimatedRemainingMs: number | null;
}

/**
 * Hook options
 */
export interface UseUserActiveGenerationsOptions {
  /** Supabase client instance */
  supabase: SupabaseClient;
  /** Current user ID */
  userId: string | undefined;
  /** Filter by workflow type(s) */
  workflowTypes?: WorkflowType | WorkflowType[];
  /** Include completed/failed runs (default: false, only active) */
  includeCompleted?: boolean;
  /** Max runs to fetch (default: 50) */
  limit?: number;
  /** Enable realtime subscription (default: true) */
  enableRealtime?: boolean;
}

/**
 * Realtime event payload
 */
interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: UserGeneration | null;
  old: UserGeneration | null;
}

/**
 * Hook for subscribing to user's AI generation progress with Supabase Realtime
 *
 * Uses the workflow.workflow_run_metadata table for tracking.
 *
 * @example
 * ```tsx
 * function WorkoutDashboard() {
 *   const { data: session } = useSession();
 *   const supabase = createClient();
 *
 *   const { activeGenerations, isGenerating } = useUserActiveGenerations({
 *     supabase,
 *     userId: session?.user?.id,
 *     workflowTypes: 'workout-generation',
 *   });
 *
 *   return (
 *     <>
 *       {activeGenerations.map(gen => (
 *         <GeneratingCard
 *           key={gen.run_id}
 *           progress={gen.progress}
 *           currentStep={gen.current_step}
 *           workflowType={gen.workflow_type}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useUserActiveGenerations(options: UseUserActiveGenerationsOptions) {
  const {
    supabase,
    userId,
    workflowTypes,
    includeCompleted = false,
    limit = 50,
    enableRealtime = true,
  } = options;

  const [generations, setGenerations] = useState<UserGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Compute generation status from raw data
   */
  const computeStatus = useCallback((gen: UserGeneration): GenerationWithStatus => {
    let status: GenerationStatus = 'running';
    if (gen.completed_at) {
      status = 'completed';
    } else if (gen.error_message) {
      status = 'failed';
    }

    const elapsedMs = Date.now() - new Date(gen.started_at).getTime();

    // Estimate remaining time based on progress and elapsed
    let estimatedRemainingMs: number | null = null;
    if (gen.progress > 0 && gen.progress < 100 && !gen.completed_at) {
      const msPerPercent = elapsedMs / gen.progress;
      estimatedRemainingMs = msPerPercent * (100 - gen.progress);
    } else if (gen.estimated_duration_ms && gen.progress > 0) {
      estimatedRemainingMs = gen.estimated_duration_ms - elapsedMs;
    }

    return {
      ...gen,
      status,
      elapsedMs,
      estimatedRemainingMs: estimatedRemainingMs ? Math.max(0, estimatedRemainingMs) : null,
    };
  }, []);

  /**
   * Fetch generations from server API
   *
   * Uses the /api/generations route which validates NextAuth session
   * and queries the workflow schema via Prisma raw SQL.
   * This architecture provides proper authentication and security.
   */
  const fetchGenerations = useCallback(async () => {
    // Guard: no userId means no data
    if (!userId) {
      setGenerations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query params for the API
      const params = new URLSearchParams();
      if (workflowTypes) {
        const types = Array.isArray(workflowTypes) ? workflowTypes : [workflowTypes];
        params.set('workflowTypes', types.join(','));
      }
      if (includeCompleted) {
        params.set('includeCompleted', 'true');
      }
      params.set('limit', String(limit));

      // Fetch from server API with proper auth
      const response = await fetch(`/api/generations?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: UserGeneration[] = await response.json();
      setGenerations(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch generations';

      console.error('[UserActiveGenerations] Fetch error:', errorMessage);
      setError(errorMessage);

      // Graceful degradation: don't block the UI
      // Realtime subscription can still populate data
      setGenerations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, workflowTypes, includeCompleted, limit]);

  /**
   * Handle realtime updates
   */
  const handleRealtimeUpdate = useCallback(
    (payload: RealtimePayload) => {
      // Only process updates for current user
      if (payload.new && payload.new.user_id !== userId) return;
      if (payload.old && payload.old.user_id !== userId) return;

      console.log('[UserActiveGenerations] Realtime event:', payload.eventType);

      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) {
            // Check workflow type filter
            if (workflowTypes) {
              const types = Array.isArray(workflowTypes) ? workflowTypes : [workflowTypes];
              if (!types.includes(payload.new.workflow_type)) return;
            }
            setGenerations((prev) => [payload.new!, ...prev].slice(0, limit));
          }
          break;

        case 'UPDATE':
          if (payload.new) {
            setGenerations((prev) =>
              prev.map((gen) => (gen.run_id === payload.new!.run_id ? payload.new! : gen))
            );

            // If completed and we're not showing completed, remove it
            if (!includeCompleted && (payload.new.completed_at || payload.new.error_message)) {
              setTimeout(() => {
                setGenerations((prev) => prev.filter((gen) => gen.run_id !== payload.new!.run_id));
              }, 2000); // Keep visible for 2s before removing
            }
          }
          break;

        case 'DELETE':
          if (payload.old) {
            setGenerations((prev) => prev.filter((gen) => gen.run_id !== payload.old!.run_id));
          }
          break;
      }
    },
    [userId, workflowTypes, includeCompleted, limit]
  );

  /**
   * Subscribe to realtime updates
   */
  useEffect(() => {
    // Guard: supabase client must be available
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchGenerations();

    if (!enableRealtime || !userId) {
      return;
    }

    // Setup realtime subscription
    const channel: RealtimeChannel = supabase
      .channel(`user-generations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'workflow',
          table: 'workflow_run_metadata',
          filter: `user_id=eq.${userId}`,
        },
        (payload: {
          eventType: string;
          new: Record<string, unknown>;
          old: Record<string, unknown>;
        }) => {
          handleRealtimeUpdate({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as unknown as UserGeneration | null,
            old: payload.old as unknown as UserGeneration | null,
          });
        }
      )
      .subscribe((status: string) => {
        console.log('[UserActiveGenerations] Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('[UserActiveGenerations] Unsubscribing from realtime');
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, enableRealtime, fetchGenerations, handleRealtimeUpdate]);

  /**
   * Enhanced generations with computed status
   */
  const generationsWithStatus = useMemo(
    () => generations.map(computeStatus),
    [generations, computeStatus]
  );

  /**
   * Filtered to only active (non-completed)
   */
  const activeGenerations = useMemo(
    () => generationsWithStatus.filter((g) => g.status === 'running'),
    [generationsWithStatus]
  );

  /**
   * Check if any generation is in progress
   */
  const isGenerating = useMemo(() => activeGenerations.length > 0, [activeGenerations]);

  /**
   * Get generation by workflow type
   */
  const getByType = useCallback(
    (type: WorkflowType): GenerationWithStatus | undefined => {
      return activeGenerations.find((g) => g.workflow_type === type);
    },
    [activeGenerations]
  );

  /**
   * Stats by workflow type
   */
  const statsByType = useMemo(() => {
    const stats: Record<WorkflowType, { active: number; completed: number; failed: number }> = {
      'workout-generation': { active: 0, completed: 0, failed: 0 },
      'nutrition-generation': { active: 0, completed: 0, failed: 0 },
      'agenda-planning': { active: 0, completed: 0, failed: 0 },
      'exercise-generation': { active: 0, completed: 0, failed: 0 },
      'food-generation': { active: 0, completed: 0, failed: 0 },
      'shopping-generation': { active: 0, completed: 0, failed: 0 },
      'flight-search-generation': { active: 0, completed: 0, failed: 0 },
      'copilot-chat': { active: 0, completed: 0, failed: 0 },
    };

    for (const gen of generationsWithStatus) {
      if (gen.status === 'running') {
        stats[gen.workflow_type].active++;
      } else if (gen.status === 'completed') {
        stats[gen.workflow_type].completed++;
      } else if (gen.status === 'failed') {
        stats[gen.workflow_type].failed++;
      }
    }

    return stats;
  }, [generationsWithStatus]);

  return {
    /** All generations (with status computed) */
    generations: generationsWithStatus,
    /** Only currently running generations */
    activeGenerations,
    /** Whether any generation is in progress */
    isGenerating,
    /** Stats by workflow type */
    statsByType,
    /** Get generation by workflow type */
    getByType,
    /** Loading state */
    isLoading,
    /** Realtime connection status */
    isConnected,
    /** Error message */
    error,
    /** Refresh data */
    refresh: fetchGenerations,
  };
}

export default useUserActiveGenerations;
