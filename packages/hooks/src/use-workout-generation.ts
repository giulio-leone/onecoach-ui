'use client';

import { useCallback, useState, useRef } from 'react';
import type {
  GenerationCallbacks,
  GenerationStreamEvent,
  GenerationState,
} from './utils/create-generation-hook';
import type { WorkoutGenerationInput, WorkoutGenerationOutput } from '@onecoach/types-ai';
import type { ProgressField } from '@onecoach/one-agent-hooks';

// Re-export for convenience (DRY: single source of truth)
export type { ProgressField };

type WorkoutInput = WorkoutGenerationInput & {
  model?: string;
  resumeFromStateId?: string;
};

export interface UseWorkoutGenerationOptions {
  /** Use SDK 4.1 streaming API (default: true) */
  streaming?: boolean;
  /** Show admin details in progress events */
  adminMode?: boolean;
  /** Max events to keep in state */
  maxEvents?: number;
}

export interface WorkoutGenerationStateV41 extends GenerationState<WorkoutGenerationOutput> {
  /** v4.1: All progress events received */
  events: ProgressField[];
  /** v4.1: Workflow run ID for resume capability */
  runId: string | null;
}

/**
 * Hook for AI-powered workout generation
 *
 * v4.1: Now supports real-time streaming with progress updates from each worker agent.
 *
 * @param callbacks - Optional callbacks for progress, complete, and error events
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { generate, progress, currentMessage, result } = useWorkoutGeneration();
 *
 * // Generate with real-time progress
 * await generate({
 *   goals: { primary: 'hypertrophy', daysPerWeek: 4, duration: 8 },
 *   constraints: { equipment: ['barbell', 'dumbbell'], location: 'gym' },
 * });
 *
 * // UI shows progress in real-time
 * <Progress value={progress} />
 * <p>{currentMessage}</p>
 * ```
 */
export function useWorkoutGeneration(
  callbacks?: GenerationCallbacks<WorkoutGenerationOutput>,
  options: UseWorkoutGenerationOptions = {}
): WorkoutGenerationStateV41 & {
  generate: (input: WorkoutInput) => Promise<WorkoutGenerationOutput>;
  generateStream: (input: WorkoutInput) => Promise<WorkoutGenerationOutput | null>;
  abort: () => void;
  reset: () => void;
  latestEvent: ProgressField | null;
} {
  const { streaming = true, maxEvents = 50 } = options;

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
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate with SDK 4.1 streaming
   */
  const generateStreamV41 = useCallback(
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
      });

      try {
        const response = await fetch('/api/workout/generate-optimized/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Generation failed: ${response.status}`);
        }

        // Extract run ID from headers
        const runId = response.headers.get('X-Workflow-Run-Id');
        if (runId) {
          setState((prev) => ({ ...prev, runId }));
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';
        let finalResult: WorkoutGenerationOutput | null = null;

        console.log('[useWorkoutGeneration] Starting stream processing...');

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[useWorkoutGeneration] Stream done, finalResult:', finalResult);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            try {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') {
                console.log('[useWorkoutGeneration] Received [DONE] signal');
                continue;
              }

              const event = JSON.parse(jsonStr);
              console.log('[useWorkoutGeneration] Parsed event type:', event.type);

              // Handle progress events (SDK 4.1 format)
              if (event.type === 'data-progress' || event.type === 'data') {
                const progressData = (event.data?.[0]?.data || event.data) as ProgressField;
                if (progressData?.step && progressData?.userMessage) {
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
              }

              // Handle finish event with result
              if (
                event.type === 'finish' ||
                event.type === 'complete' ||
                event.type === 'data-finish'
              ) {
                console.log('[useWorkoutGeneration] Finish event received:', event);
                const output = event.output || event.data?.output || event.data;
                console.log('[useWorkoutGeneration] Parsed output:', output);
                if (output?.program) {
                  finalResult = {
                    program: output.program,
                    tokensUsed: output.tokensUsed ?? 0,
                    costUSD: output.costUSD ?? 0,
                    generatedAt: output.generatedAt ?? new Date().toISOString(),
                    metadata: output.metadata,
                  };
                  console.log('[useWorkoutGeneration] Final result set:', finalResult);
                  callbacks?.onComplete?.(finalResult);
                } else {
                  console.warn('[useWorkoutGeneration] No program in output, skipping');
                }
              }

              // Handle error events
              if (event.type === 'error') {
                const errorMsg = event.data?.message || event.error || 'Generation failed';
                setState((prev) => ({
                  ...prev,
                  error: errorMsg,
                }));
                callbacks?.onError?.(errorMsg);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }

        // Update final state
        console.log('[useWorkoutGeneration] Setting final state, isGenerating: false');
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
          result: finalResult,
          progress: 100,
          currentMessage: finalResult ? 'Complete!' : 'No results',
        }));

        return finalResult;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return null;

        const message = error instanceof Error ? error.message : 'Generation failed';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
          error: message,
          currentMessage: 'Error occurred',
        }));
        callbacks?.onError?.(message);
        return null;
      }
    },
    [callbacks, maxEvents]
  );

  /**
   * Generate with legacy polling API (non-streaming)
   */
  const generateLegacy = useCallback(
    async (input: WorkoutInput): Promise<WorkoutGenerationOutput | null> => {
      setState({
        isGenerating: true,
        isStreaming: false,
        progress: 0,
        currentMessage: 'Initializing...',
        error: null,
        result: null,
        streamEvents: [],
        logs: [],
        events: [],
        runId: null,
      });

      try {
        const response = await fetch('/api/workout/generate-optimized', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Generation failed');
        }

        // For background mode, we need to poll for results
        if (data.runId && data.status === 'running') {
          setState((prev) => ({
            ...prev,
            runId: data.runId,
            currentMessage: 'Generation started in background...',
          }));

          // Poll for completion (simplified - in production use Supabase Realtime)
          let attempts = 0;
          const maxAttempts = 120; // 4 minutes with 2s intervals
          while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            attempts++;

            const statusResponse = await fetch(`/api/workflow/${data.runId}/status`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              setState((prev) => ({
                ...prev,
                progress: statusData.progress ?? prev.progress,
                currentMessage: statusData.currentStep ?? prev.currentMessage,
              }));

              if (statusData.status === 'completed') {
                const result: WorkoutGenerationOutput = {
                  program: statusData.outputData?.program,
                  tokensUsed: 0,
                  costUSD: 0,
                  generatedAt: new Date().toISOString(),
                };
                setState((prev) => ({
                  ...prev,
                  isGenerating: false,
                  result,
                  progress: 100,
                  currentMessage: 'Complete!',
                }));
                callbacks?.onComplete?.(result);
                return result;
              }

              if (statusData.status === 'failed') {
                throw new Error(statusData.errorMessage || 'Generation failed');
              }
            }
          }

          throw new Error('Generation timed out');
        }

        return null;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isStreaming: false,
          error: errorMessage,
        }));
        callbacks?.onError?.(errorMessage);
        return null;
      }
    },
    [callbacks]
  );

  /**
   * Main generate function - uses streaming by default
   */
  const generateStream = useCallback(
    async (input: WorkoutInput): Promise<WorkoutGenerationOutput | null> => {
      if (streaming) {
        return generateStreamV41(input);
      }
      return generateLegacy(input);
    },
    [streaming, generateStreamV41, generateLegacy]
  );

  const generate = useCallback(
    async (input: WorkoutInput): Promise<WorkoutGenerationOutput> => {
      const result = await generateStream(input);
      if (!result) {
        throw new Error(state.error || 'Generation failed');
      }
      return result;
    },
    [generateStream, state.error]
  );

  /**
   * Abort current generation
   */
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      isStreaming: false,
      currentMessage: 'Cancelled',
    }));
  }, []);

  /**
   * Reset state
   */
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
    });
  }, []);

  return {
    ...state,
    generate,
    generateStream,
    abort,
    reset,
    /** Latest event */
    latestEvent: state.events.length > 0 ? (state.events[state.events.length - 1] ?? null) : null,
  };
}

export type WorkoutGenerationState = GenerationState<WorkoutGenerationOutput>;
export type WorkoutGenerationStreamEvent = GenerationStreamEvent<WorkoutGenerationOutput>;
