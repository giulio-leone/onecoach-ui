'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

/**
 * Workflow run status from WDK
 */
export type WorkflowRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Workflow run record from database (WDK workflow_runs table)
 */
export interface WorkflowRun {
  /** Primary ID from WDK - use this as unique identifier */
  id: string;
  /** Alias for id - for backward compatibility */
  run_id: string;
  workflow_name: string | null;
  status: WorkflowRunStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  deployment_id: string | null;
  output: unknown;
  input: unknown;
  error: unknown;
  metadata: Record<string, unknown> | null;
}

/**
 * Hook options
 */
export interface UseWorkflowRunsOptions {
  /** Supabase client instance */
  supabase: SupabaseClient;
  /** Max runs to fetch (default: 100) */
  limit?: number;
  /** Enable realtime subscription (default: true) */
  enableRealtime?: boolean;
  /** Filter by status */
  statusFilter?: WorkflowRunStatus | WorkflowRunStatus[];
}

/**
 * Realtime event payload
 */
interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: WorkflowRun | null;
  old: WorkflowRun | null;
}

/**
 * Hook for subscribing to workflow runs with Supabase Realtime
 *
 * @example
 * ```tsx
 * import { createClient } from '@/lib/supabase/client';
 *
 * function WorkflowDashboard() {
 *   const supabase = createClient();
 *   const { runs, stats, isConnected, refresh } = useWorkflowRuns({ supabase });
 *
 *   return (
 *     <div>
 *       <p>Active: {stats.running}</p>
 *       {runs.map(run => (
 *         <RunCard key={run.run_id} run={run} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWorkflowRuns(options: UseWorkflowRunsOptions) {
  const { supabase, limit = 100, enableRealtime = true, statusFilter } = options;

  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch initial runs from database
   */
  const fetchRuns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('workflow_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply status filter
      if (statusFilter) {
        const statuses = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
        query = query.in('status', statuses);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Map id to run_id for backward compatibility
      const mappedData = (data || []).map((run: Record<string, unknown>) => ({
        ...run,
        run_id: run.id as string, // Alias for backward compat
      })) as WorkflowRun[];

      setRuns(mappedData);
    } catch (err) {
      console.error('[WorkflowRuns] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch runs');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, limit, statusFilter]);

  /**
   * Handle realtime updates
   */
  const handleRealtimeUpdate = useCallback(
    (payload: RealtimePayload) => {
      console.log('[WorkflowRuns] Realtime event:', payload.eventType);

      // Map id to run_id for new records
      const mapRecord = (rec: WorkflowRun | null): WorkflowRun | null => {
        if (!rec) return null;
        return { ...rec, run_id: rec.id };
      };

      const newRecord = mapRecord(payload.new);
      const oldRecord = mapRecord(payload.old);

      switch (payload.eventType) {
        case 'INSERT':
          if (newRecord) {
            setRuns((prev) => [newRecord, ...prev].slice(0, limit));
          }
          break;

        case 'UPDATE':
          if (newRecord) {
            setRuns((prev) => prev.map((run) => (run.id === newRecord.id ? newRecord : run)));
          }
          break;

        case 'DELETE':
          if (oldRecord) {
            setRuns((prev) => prev.filter((run) => run.id !== oldRecord.id));
          }
          break;
      }
    },
    [limit]
  );

  /**
   * Subscribe to realtime updates
   */
  useEffect(() => {
    // Initial fetch
    fetchRuns();

    if (!enableRealtime) {
      return;
    }

    // Setup realtime subscription
    const channel: RealtimeChannel = supabase
      .channel('workflow-runs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'workflow',
          table: 'workflow_runs',
        },
        (payload: {
          eventType: string;
          new: Record<string, unknown>;
          old: Record<string, unknown>;
        }) => {
          handleRealtimeUpdate({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as unknown as WorkflowRun | null,
            old: payload.old as unknown as WorkflowRun | null,
          });
        }
      )
      .subscribe((status: string) => {
        console.log('[WorkflowRuns] Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('[WorkflowRuns] Unsubscribing from realtime');
      supabase.removeChannel(channel);
    };
  }, [supabase, enableRealtime, fetchRuns, handleRealtimeUpdate]);

  /**
   * Calculate stats
   */
  const stats = useMemo(
    () => ({
      total: runs.length,
      pending: runs.filter((r) => r.status === 'pending').length,
      running: runs.filter((r) => r.status === 'running').length,
      completed: runs.filter((r) => r.status === 'completed').length,
      failed: runs.filter((r) => r.status === 'failed').length,
      cancelled: runs.filter((r) => r.status === 'cancelled').length,
    }),
    [runs]
  );

  /**
   * Cancel a workflow run
   */
  const cancelRun = useCallback(
    async (runId: string) => {
      try {
        const response = await fetch(`/api/workflow/${runId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to cancel workflow');
        }
        // Refresh to get updated status
        await fetchRuns();
        return true;
      } catch (err) {
        console.error('[WorkflowRuns] Cancel error:', err);
        return false;
      }
    },
    [fetchRuns]
  );

  return {
    runs,
    stats,
    isLoading,
    isConnected,
    error,
    refresh: fetchRuns,
    cancelRun,
  };
}

export default useWorkflowRuns;
