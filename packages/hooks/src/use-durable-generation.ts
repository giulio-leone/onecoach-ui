'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Status of a durable workflow run
 */
export interface DurableWorkflowStatus {
  runId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'error';
  progress: number;
  currentStep?: string;
  error?: string;
  output?: unknown;
}

/**
 * Options for useDurableGeneration hook
 */
export interface UseDurableGenerationOptions<TInput, TOutput> {
  /** API endpoint to start the generation */
  endpoint: string;
  /** Polling interval in ms (default: 2000) */
  pollingInterval?: number;
  /** Maximum polling attempts before giving up (default: 150 = 5 min at 2s interval) */
  maxPollingAttempts?: number;
  /** Callback when generation completes successfully */
  onSuccess?: (output: TOutput) => void;
  /** Callback when generation fails */
  onError?: (error: string) => void;
  /** Callback on status update */
  onStatusChange?: (status: DurableWorkflowStatus) => void;
  /** Storage key for persisting runId across page refreshes */
  persistenceKey?: string;
  /** Transform input before sending to API */
  transformInput?: (input: TInput) => unknown;
  /** Transform output from API */
  transformOutput?: (output: unknown) => TOutput;
}

/**
 * Return type for useDurableGeneration hook
 */
export interface UseDurableGenerationReturn<TInput, TOutput> {
  /** Start a new generation */
  generate: (input: TInput) => Promise<void>;
  /** Resume/poll an existing run */
  resume: (runId: string) => Promise<void>;
  /** Cancel the current generation */
  cancel: () => Promise<void>;
  /** Current status */
  status: DurableWorkflowStatus | null;
  /** Output data when completed */
  output: TOutput | null;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Whether currently polling for status */
  isPolling: boolean;
  /** Error message if failed */
  error: string | null;
  /** Current run ID */
  runId: string | null;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for durable AI generation with automatic polling and resume capability
 *
 * @example
 * ```tsx
 * const { generate, status, output, isGenerating, error } = useDurableGeneration<
 *   FlightSearchInput,
 *   FlightSearchOutput
 * >({
 *   endpoint: '/api/flight/smart-search',
 *   persistenceKey: 'flight-search-run',
 *   onSuccess: (output) => {
 *     console.log('Flights found:', output);
 *   },
 * });
 *
 * // Start generation
 * await generate({ flyFrom: 'MXP', flyTo: 'JFK', departureDate: '2024-03-15' });
 *
 * // Or resume from page refresh
 * useEffect(() => {
 *   const savedRunId = localStorage.getItem('flight-search-run');
 *   if (savedRunId) resume(savedRunId);
 * }, []);
 * ```
 *
 * @since SDK v4.0
 */
export function useDurableGeneration<TInput, TOutput>(
  options: UseDurableGenerationOptions<TInput, TOutput>
): UseDurableGenerationReturn<TInput, TOutput> {
  const {
    endpoint,
    pollingInterval = 2000,
    maxPollingAttempts = 150,
    onSuccess,
    onError,
    onStatusChange,
    persistenceKey,
    transformInput,
    transformOutput,
  } = options;

  const [status, setStatus] = useState<DurableWorkflowStatus | null>(null);
  const [output, setOutput] = useState<TOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-resume from persistence
  useEffect(() => {
    if (persistenceKey && typeof window !== 'undefined') {
      const savedRunId = localStorage.getItem(persistenceKey);
      if (savedRunId) {
        console.log('[DurableGen] Auto-resuming from saved runId:', savedRunId);
        resume(savedRunId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistenceKey]);

  /**
   * Poll workflow status
   */
  const pollStatus = useCallback(
    async (currentRunId: string) => {
      if (attemptsRef.current >= maxPollingAttempts) {
        setError('Generation timed out - please try again');
        setIsPolling(false);
        setIsGenerating(false);
        onError?.('Generation timed out');
        return;
      }

      try {
        const response = await fetch(`/api/workflow/${currentRunId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get status');
        }

        const workflowStatus: DurableWorkflowStatus = {
          runId: currentRunId,
          status: data.status,
          progress: data.progress || 0,
          currentStep: data.currentStep,
          error: data.error,
          output: data.output,
        };

        setStatus(workflowStatus);
        onStatusChange?.(workflowStatus);

        // Handle completion
        if (data.status === 'completed') {
          const finalOutput = transformOutput
            ? transformOutput(data.output)
            : (data.output as TOutput);

          setOutput(finalOutput);
          setIsPolling(false);
          setIsGenerating(false);

          // Clear persistence
          if (persistenceKey) {
            localStorage.removeItem(persistenceKey);
          }

          onSuccess?.(finalOutput);
          return;
        }

        // Handle failure
        if (data.status === 'failed' || data.status === 'cancelled' || data.status === 'error') {
          const errorMessage = data.error || `Workflow ${data.status}`;
          setError(errorMessage);
          setIsPolling(false);
          setIsGenerating(false);

          // Clear persistence
          if (persistenceKey) {
            localStorage.removeItem(persistenceKey);
          }

          onError?.(errorMessage);
          return;
        }

        // Continue polling
        attemptsRef.current++;
        pollingRef.current = setTimeout(() => pollStatus(currentRunId), pollingInterval);
      } catch (err) {
        console.error('[DurableGen] Polling error:', err);
        attemptsRef.current++;

        // Retry on transient errors
        if (attemptsRef.current < maxPollingAttempts) {
          pollingRef.current = setTimeout(() => pollStatus(currentRunId), pollingInterval * 2);
        } else {
          setError(err instanceof Error ? err.message : 'Polling failed');
          setIsPolling(false);
          setIsGenerating(false);
          onError?.(err instanceof Error ? err.message : 'Polling failed');
        }
      }
    },
    [
      maxPollingAttempts,
      pollingInterval,
      persistenceKey,
      transformOutput,
      onSuccess,
      onError,
      onStatusChange,
    ]
  );

  /**
   * Start a new generation
   */
  const generate = useCallback(
    async (input: TInput) => {
      // Reset state
      setError(null);
      setOutput(null);
      setStatus(null);
      setIsGenerating(true);
      attemptsRef.current = 0;

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        const body = transformInput ? transformInput(input) : input;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to start generation');
        }

        // Check if we got immediate result (non-durable mode)
        if (data.success && !data.runId) {
          const finalOutput = transformOutput ? transformOutput(data) : (data as TOutput);
          setOutput(finalOutput);
          setIsGenerating(false);
          onSuccess?.(finalOutput);
          return;
        }

        // Durable mode - got runId, start polling
        const newRunId = data.runId || data.workflowRunId || data._meta?.executionId;

        if (newRunId) {
          setRunId(newRunId);

          // Persist for resume
          if (persistenceKey) {
            localStorage.setItem(persistenceKey, newRunId);
          }

          // Start polling
          setIsPolling(true);
          pollStatus(newRunId);
        } else {
          // No runId but success - treat as immediate result
          const finalOutput = transformOutput ? transformOutput(data) : (data as TOutput);
          setOutput(finalOutput);
          setIsGenerating(false);
          onSuccess?.(finalOutput);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[DurableGen] Request aborted');
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Generation failed';
        setError(errorMessage);
        setIsGenerating(false);
        onError?.(errorMessage);
      }
    },
    [endpoint, persistenceKey, transformInput, transformOutput, onSuccess, onError, pollStatus]
  );

  /**
   * Resume polling for an existing run
   */
  const resume = useCallback(
    async (existingRunId: string) => {
      setRunId(existingRunId);
      setIsGenerating(true);
      setIsPolling(true);
      setError(null);
      attemptsRef.current = 0;

      pollStatus(existingRunId);
    },
    [pollStatus]
  );

  /**
   * Cancel the current generation
   */
  const cancel = useCallback(async () => {
    // Stop polling
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancel on server if we have a runId
    if (runId) {
      try {
        await fetch(`/api/workflow/${runId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('[DurableGen] Failed to cancel on server:', err);
      }
    }

    // Clear persistence
    if (persistenceKey) {
      localStorage.removeItem(persistenceKey);
    }

    setIsGenerating(false);
    setIsPolling(false);
    setStatus((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  }, [runId, persistenceKey]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }

    setStatus(null);
    setOutput(null);
    setIsGenerating(false);
    setIsPolling(false);
    setError(null);
    setRunId(null);
    attemptsRef.current = 0;

    if (persistenceKey) {
      localStorage.removeItem(persistenceKey);
    }
  }, [persistenceKey]);

  return {
    generate,
    resume,
    cancel,
    status,
    output,
    isGenerating,
    isPolling,
    error,
    runId,
    reset,
  };
}

export default useDurableGeneration;
