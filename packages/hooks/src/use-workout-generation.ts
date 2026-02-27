'use client';

import { useCallback, useState, useRef } from 'react';
import type {
  GenerationCallbacks,
  GenerationStreamEvent,
  GenerationState,
} from './utils/create-generation-hook';
import type { WorkoutGenerationInput, WorkoutGenerationOutput } from '@giulio-leone/types/ai';
import type { ProgressField } from '@giulio-leone/one-agent/hooks';

// Re-export for convenience (DRY: single source of truth)
export type { ProgressField };

type WorkoutInput = WorkoutGenerationInput & {
  model?: string;
  resumeFromStateId?: string;
};

export interface UseWorkoutGenerationOptions {
  /** Use SDK 5.0 streaming API with background persistence (default: true) */
  streaming?: boolean;
  /** Show admin details in progress events */
  adminMode?: boolean;
  /** Max events to keep in state */
  maxEvents?: number;
  /** Polling interval for reconnect (ms, default: 3000) */
  pollInterval?: number;
  /** Max polling duration before timeout (ms, default: 15 min) */
  maxPollDurationMs?: number;
  /** Enable debug logging */
  debug?: boolean;
}

export interface WorkoutGenerationStateV41 extends GenerationState<WorkoutGenerationOutput> {
  /** v4.1: All progress events received */
  events: ProgressField[];
  /** v4.1: Workflow run ID for resume capability */
  runId: string | null;
  /** v5.0: Saved program ID (available after completion) */
  programId: string | null;
}

/** Extended callbacks for v5.0 with programId */
export interface WorkoutGenerationCallbacks extends GenerationCallbacks<WorkoutGenerationOutput> {
  /** Called when program is saved with its ID */
  onProgramSaved?: (programId: string) => void;
}

/**
 * Normalize progress data from various SSE event formats.
 * Handles both direct and wrapped formats from WDK/AI SDK stream.
 */
function normalizeProgressData(event: Record<string, unknown>): ProgressField | null {
  // Format 1: Direct progress event
  // { type: 'data-progress', data: { step, userMessage, ... } }
  if (event.type === 'data-progress' && event.data && typeof event.data === 'object') {
    const data = event.data as Record<string, unknown>;
    if (data.step && data.userMessage) {
      return data as unknown as ProgressField;
    }
  }

  // Format 2: Wrapped in data array (some WDK versions)
  // { type: 'data', data: [{ type: 'data-progress', data: {...} }] }
  if (event.type === 'data' && Array.isArray(event.data)) {
    const inner = event.data[0] as Record<string, unknown> | undefined;
    if (inner?.type === 'data-progress' && inner?.data) {
      const innerData = inner.data as Record<string, unknown>;
      if (innerData.step && innerData.userMessage) {
        return innerData as unknown as ProgressField;
      }
    }
  }

  // Format 3: Nested data structure
  // { type: 'data', data: { step, userMessage, ... } }
  if (
    event.type === 'data' &&
    event.data &&
    typeof event.data === 'object' &&
    !Array.isArray(event.data)
  ) {
    const data = event.data as Record<string, unknown>;
    if (data.step && data.userMessage) {
      return data as unknown as ProgressField;
    }
  }

  return null;
}

/**
 * Hook for AI-powered workout generation using WDK patterns.
 *
 * v5.1: Updated to use WDK native patterns (x-workflow-run-id, native stream)
 *
 * @since v5.1
 */
export function useWorkoutGeneration(
  callbacks?: WorkoutGenerationCallbacks,
  options: UseWorkoutGenerationOptions = {}
) {
  const {
    maxEvents = 50,
    pollInterval = 3000,
    maxPollDurationMs = 15 * 60 * 1000,
    debug = false,
  } = options;

  const log = debug
    ? (msg: string, data?: unknown) => console.log(`[useWorkoutGeneration] ${msg}`, data ?? '')
    : () => {};

  const [state, setState] = useState<WorkoutGenerationStateV41>({
    isGenerating: false,
    isStreaming: false,
    progress: 0,
    currentMessage: '',
    error: null,
    result: null,
    streamEvents: [],
    logs: [],
    events: [],
    runId: null,
    programId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Poll for workflow status (used for reconnect after disconnect)
   * Uses WDK native status check via API
   */
  const pollForCompletion = useCallback(
    async (runId: string): Promise<WorkoutGenerationOutput | null> => {
      const maxAttempts = Math.max(1, Math.ceil(maxPollDurationMs / pollInterval));
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch(`/api/workouts/generate?runId=${runId}`);
          if (!response.ok) {
            // If 404, maybe workflow hasn't started yet or is lost
            if (response.status === 404) {
              console.warn('[useWorkoutGeneration] Workflow not found yet, retrying...');
            } else {
              throw new Error(`Status check failed: ${response.status}`);
            }
          } else {
            const status = await response.json();

            // Check for completion
            if (status.status === 'completed') {
              const programId = status.programId;

              // Return result
              const result: WorkoutGenerationOutput = {
                program: null as unknown as WorkoutGenerationOutput['program'],
                tokensUsed: 0,
                costUSD: 0,
                generatedAt: new Date(),
                metadata: { programId },
              };

              setState((prev) => ({
                ...prev,
                isGenerating: false,
                isStreaming: false,
                progress: 100,
                currentMessage: 'Complete!',
                programId,
                result,
              }));

              if (programId) {
                callbacks?.onProgramSaved?.(programId);
              }

              callbacks?.onComplete?.(result);
              return result;
            }

            if (status.status === 'failed') {
              throw new Error(status.error || 'Generation failed');
            }
          }
        } catch (error) {
          console.warn('[useWorkoutGeneration] Poll error:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;
      }

      throw new Error('Generation timed out');
    },
    [callbacks, maxPollDurationMs, pollInterval]
  );

  /**
   * Generate using WDK native stream
   */
  const generateStream = useCallback(
    async (input: WorkoutInput): Promise<WorkoutGenerationOutput | null> => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState({
        isGenerating: true,
        isStreaming: true,
        progress: 0,
        currentMessage: 'Connecting...',
        error: null,
        result: null,
        streamEvents: [],
        logs: [],
        events: [],
        runId: null,
        programId: null,
      });

      let currentRunId: string | null = null;

      try {
        const response = await fetch('/api/workouts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Generation failed: ${response.status}`);
        }

        // Get WDK run ID (lowercase header)
        currentRunId = response.headers.get('x-workflow-run-id');
        if (currentRunId) {
          setState((prev) => ({ ...prev, runId: currentRunId }));
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response body');

        let buffer = '';
        let streamFinishedWithResult = false;

        // Process WDK stream (SSE format via createUIMessageStreamResponse)
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            try {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') {
                log('Received [DONE] signal');
                continue;
              }

              const event = JSON.parse(jsonStr) as Record<string, unknown>;
              log('SSE event received', { type: event.type });

              // Handle finish events (workflow completed with output)
              if (event.type === 'data-finish' || event.type === 'finish') {
                log('Finish event received', event);
                const finishData = event.data as
                  | { success?: boolean; output?: unknown }
                  | undefined;

                if (finishData?.success !== false) {
                  streamFinishedWithResult = true;
                  setState((prev) => ({
                    ...prev,
                    progress: 100,
                    currentMessage: 'Complete!',
                  }));
                }
                continue;
              }

              // Handle progress events (normalized for various formats)
              const progressData = normalizeProgressData(event);
              if (progressData) {
                log('Progress event', progressData);
                setState((prev) => ({
                  ...prev,
                  progress: progressData.estimatedProgress ?? prev.progress,
                  currentMessage: progressData.userMessage,
                  events: [...prev.events.slice(-(maxEvents - 1)), progressData],
                }));
                callbacks?.onProgress?.(
                  progressData.estimatedProgress ?? 0,
                  progressData.userMessage
                );
              }
            } catch (parseError) {
              // Log parse errors in debug mode
              log('Parse error', { line, error: parseError });
            }
          }
        }

        // Stream ended - check if we got a finish signal or need to poll
        if (currentRunId) {
          if (streamFinishedWithResult) {
            log('Stream finished with result, polling for programId');
          } else {
            log('Stream ended without finish signal, polling for status');
          }
          return pollForCompletion(currentRunId);
        }

        return null;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return null;

        // If error but we have runId, try to poll for status (maybe just stream error)
        if (currentRunId) {
          log('Stream error, attempting poll recovery', { error });
          return pollForCompletion(currentRunId);
        }

        const message = error instanceof Error ? error.message : 'Generation failed';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
          error: message,
        }));
        callbacks?.onError?.(message);
        return null;
      }
    },
    [callbacks, maxEvents, pollForCompletion, log]
  );

  /**
   * Resume streaming from a previous runId
   */
  const resume = useCallback(
    async (runId: string): Promise<WorkoutGenerationOutput | null> => {
      // Logic for resume would use GET ?stream=true&startIndex=N
      // For now fallback to polling as it's safer
      return pollForCompletion(runId);
    },
    [pollForCompletion]
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      isStreaming: false,
      currentMessage: 'Cancelled',
    }));
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      isGenerating: false,
      isStreaming: false,
      progress: 0,
      currentMessage: '',
      error: null,
      result: null,
      streamEvents: [],
      logs: [],
      events: [],
      runId: null,
      programId: null,
    });
  }, []);

  return {
    ...state,
    generate: generateStream as (input: WorkoutInput) => Promise<WorkoutGenerationOutput | null>,
    generateStream,
    abort,
    reset,
    resume,
    latestEvent: state.events.length > 0 ? (state.events[state.events.length - 1] ?? null) : null,
  };
}

export type WorkoutGenerationState = GenerationState<WorkoutGenerationOutput>;
export type WorkoutGenerationStreamEvent = GenerationStreamEvent<WorkoutGenerationOutput>;
