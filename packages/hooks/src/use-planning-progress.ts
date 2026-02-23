'use client';

/**
 * Hook per gestire il planning progress con SSE (Server-Sent Events)
 *
 * v2: Sostituisce polling inefficiente con EventSource SSE real-time + controlli pause/resume/cancel
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { PlanningProgress, PlanningTask } from '@giulio-leone/types/domain';

interface UsePlanningProgressOptions {
  planId: string | null;
  enabled: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
  agentType?: 'workout' | 'nutrition';
  autoStartRunner?: boolean;
}

interface ProgressEvent {
  planId: string;
  totalTasks: number;
  completedTasks: number;
  totalSubTasks: number;
  completedSubTasks: number;
  progressPercentage: number;
  status: string;
  tasks?: PlanningTask[];
  currentTask: { id?: string; weekNumber: number; status: string } | null;
  currentSubTask: { id?: string; dayNumber: number; dayName: string; status: string } | null;
  timestamp: string;
}

export function usePlanningProgress({
  planId,
  enabled,
  onComplete,
  onError,
  agentType = 'nutrition',
  autoStartRunner = true,
}: UsePlanningProgressOptions) {
  const [progress, setProgress] = useState<PlanningProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const runnerStartedRef = useRef<boolean>(false);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Controlli pause/resume/cancel
  const pausePlan = useCallback(async () => {
    if (!planId) return;
    try {
      const res = await fetch(`/api/planning/control/${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });
      if (!res.ok) throw new Error('Failed to pause plan');
    } catch (err: unknown) {
      console.error('Planning progress error:', err);
      onError?.('Errore durante la pausa');
    }
  }, [planId, onError]);

  const resumePlan = useCallback(async () => {
    if (!planId) return;
    try {
      const res = await fetch(`/api/planning/control/${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      });
      if (!res.ok) throw new Error('Failed to resume plan');
    } catch (err: unknown) {
      console.error('Planning progress error:', err);
      onError?.('Errore durante la ripresa');
    }
  }, [planId, onError]);

  const cancelPlan = useCallback(async () => {
    if (!planId) return;
    try {
      const res = await fetch(`/api/planning/control/${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) throw new Error('Failed to cancel plan');
      cleanup();
    } catch (err: unknown) {
      console.error('Planning progress error:', err);
      onError?.('Errore durante la cancellazione');
    }
  }, [planId, onError, cleanup]);

  useEffect(() => {
    if (!enabled || !planId) {
      cleanup();
      setProgress(null);
      return;
    }

    // Crea EventSource per SSE stream
    const eventSource = new EventSource(`/api/planning/stream/${planId}`);
    eventSourceRef.current = eventSource;

    // Handler per apertura connessione
    eventSource.addEventListener('open', () => {
      console.warn('[SSE] Connection opened');
      setIsConnected(true);
      setError(null);
    });

    // Handler per progress updates
    eventSource.addEventListener('progress', (event) => {
      try {
        const raw =
          typeof (event as unknown as MessageEvent).data === 'string'
            ? (event as unknown as MessageEvent).data
            : '';
        if (!raw) return; // skip eventi senza data
        const data: ProgressEvent = JSON.parse(raw);
        setProgress({
          planId: data.planId,
          planStatus:
            ((data as Record<string, unknown>).planStatus as PlanningProgress['planStatus']) ||
            progress?.planStatus,
          totalTasks: data.totalTasks,
          completedTasks: data.completedTasks,
          totalSubTasks: data.totalSubTasks,
          completedSubTasks: data.completedSubTasks,
          progressPercentage: data.progressPercentage,
          tasks: (data.tasks as PlanningTask[] | undefined) || [],
          currentTask: data.currentTask
            ? {
                id: (data.currentTask as Record<string, unknown>).id as string | undefined,
                weekNumber: data.currentTask.weekNumber,
                status: (data.currentTask as Record<string, unknown>).status as string,
                subTasks: [],
              }
            : undefined,
          currentSubTask: data.currentSubTask
            ? {
                id: (data.currentSubTask as Record<string, unknown>).id as string | undefined,
                dayNumber: data.currentSubTask.dayNumber,
                dayName: data.currentSubTask.dayName,
                status: (data.currentSubTask as Record<string, unknown>).status as string,
              }
            : undefined,
        });
        setError(null);
      } catch (err: unknown) {
        console.error('Planning progress error:', err);
      }
    });

    // Init to-do list
    eventSource.addEventListener('todo-list', (event: MessageEvent) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : '';
        if (!raw) return;
        const init = JSON.parse(raw) as {
          planId: string;
          totalTasks: number;
          totalSubTasks: number;
          tasks?: PlanningTask[];
        };
        setProgress(
          (prev: PlanningProgress | null): PlanningProgress => ({
            ...(prev || {
              planId: init.planId,
              totalTasks: 0,
              completedTasks: 0,
              totalSubTasks: 0,
              completedSubTasks: 0,
              progressPercentage: 0,
              planStatus: 'PENDING' as PlanningProgress['planStatus'],
            }),
            totalTasks: init.totalTasks,
            totalSubTasks: init.totalSubTasks,
            tasks: init.tasks || [], // ✅ Save tasks array!
          })
        );

        if (autoStartRunner && !runnerStartedRef.current && planId) {
          runnerStartedRef.current = true;
          fetch(`/api/planning/run/${planId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentType, concurrency: 2 }),
          }).catch((err: unknown) => {
            console.error('[Planning] Runner start error:', err);
            onError?.('Errore avvio runner');
          });
        }
      } catch (error: unknown) {
        // ignore parse error
      }
    });

    // Handler per completion
    eventSource.addEventListener('complete', (event) => {
      console.warn('[SSE] Planning completed:', event.data);
      cleanup();
      onComplete?.();
    });

    // Handler per errori server-side tipizzati
    eventSource.addEventListener('server-error', (event: MessageEvent) => {
      console.error('[SSE] Server error event:', event);
      try {
        const raw = typeof event.data === 'string' ? event.data : '';
        const data = raw ? JSON.parse(raw) : null;
        const errorMessage = (data && data.error) || 'Errore server';
        setError(errorMessage);
        onError?.(errorMessage);
      } catch (_error: unknown) {
        setError('Errore server');
        onError?.('Errore server');
      }
      cleanup();
    });

    // Handler per heartbeat (keep-alive)
    eventSource.addEventListener('heartbeat', () => {
      // Mantiene la connessione viva
    });

    // Handler per connection error
    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      setError('Connection lost');
      onError?.('Connection lost');
      cleanup();
    };

    // Cleanup on unmount
    return cleanup;
    // progress?.planStatus is intentionally not a dependency to avoid re-running effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, enabled, cleanup, onComplete, onError, agentType, autoStartRunner]);

  return {
    progress,
    error,
    isConnected,
    disconnect: cleanup,
    pausePlan,
    resumePlan,
    cancelPlan,
  };
}
