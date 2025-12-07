/**
 * Custom React Hooks for AI Agent Streaming
 *
 * Provides streaming functionality for nutrition and workout agents
 */

'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Stream state interface
 */
export interface StreamState {
  isStreaming: boolean;
  error: Error | null;
  data: string;
  isComplete: boolean;
}

/**
 * Generic agent stream hook
 *
 * NOTE: Nutrition and workout streaming endpoints are deprecated.
 * Use MeshCoordinator endpoints (/api/agents/main/stream or /api/copilot/main/stream) instead.
 */
export function useAgentStream(
  endpoint: string,
  options?: {
    onChunk?: (chunk: string) => void;
    onComplete?: (data: string) => void;
    onError?: (error: Error) => void;
  }
) {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    error: null,
    data: '',
    isComplete: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (request: Record<string, unknown>) => {
      setState({
        isStreaming: true,
        error: null,
        data: '',
        isComplete: false,
      });

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          let errorMessage = `Failed to generate plan (${response.status} ${response.statusText})`;

          if (errorData && typeof errorData === 'object') {
            if (typeof errorData.error === 'string' && errorData.error) {
              errorMessage = errorData.error;
            } else if (
              errorData.error &&
              typeof errorData.error === 'object' &&
              errorData.error.message
            ) {
              errorMessage = String(errorData.error.message);
            } else if (errorData.message && typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            }
          }

          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedData = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedData += chunk;

          setState((prev) => ({
            ...prev,
            data: accumulatedData,
          }));

          options?.onChunk?.(chunk);
        }

        setState((prev) => ({
          ...prev,
          isStreaming: false,
          isComplete: true,
        }));

        options?.onComplete?.(accumulatedData);
      } catch (caughtError: unknown) {
        if (caughtError instanceof Error && caughtError.name === 'AbortError') {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isComplete: false,
          }));
          return;
        }

        const err = caughtError instanceof Error ? caughtError : new Error('Unknown error');
        setState({
          isStreaming: false,
          error: err,
          data: '',
          isComplete: false,
        });

        options?.onError?.(err);
      }
    },
    [endpoint, options]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    generate,
    cancel,
    state,
  };
}
