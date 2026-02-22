import { useState, useCallback } from 'react';
import type { MeshEvent } from '@giulio-leone/one-agent';
import { apiClient } from '@giulio-leone/lib-api-client';

export interface GenerationStreamEvent<TOutput = unknown> {
  type: MeshEvent<TOutput>['type'];
  timestamp: Date;
  data: MeshEvent<TOutput>['data'];
  message: string;
}

export interface GenerationState<TOutput> {
  isGenerating: boolean;
  isStreaming: boolean;
  progress: number;
  currentMessage: string;
  error: string | null;
  result: TOutput | null;
  streamEvents: GenerationStreamEvent<TOutput>[];
  logs: Array<{
    role: string;
    message: string;
    timestamp: Date;
    metadata?: unknown;
  }>;
}

export interface GenerationCallbacks<TOutput> {
  onProgress?: (progress: number, message: string) => void;
  onChunk?: (content: string) => void;
  onComplete?: (result: TOutput) => void;
  onError?: (error: string) => void;
}

export interface CreateGenerationHookConfig<TOutput> {
  endpoint: string;
  streamEndpoint: string;
  asyncEndpoint?: string;
  getEventMessage?: (event: MeshEvent<TOutput>) => string;
}

export type UseGenerationHook<TInput, TOutput> = (
  callbacks?: GenerationCallbacks<TOutput>
) => GenerationState<TOutput> & {
  generate: (input: TInput) => Promise<TOutput>;
  generateStream: (input: TInput) => Promise<TOutput | null>;
  reset: () => void;
};

const DEFAULT_MESSAGE = (event: MeshEvent<unknown>): string => {
  switch (event.type) {
    case 'agent_start':
      return `🚀 Starting ${event.data.description || event.data.role}`;
    case 'agent_complete':
      return `✅ ${event.data.role} completed (${event.data.duration || 0}ms)`;
    case 'delegation':
      return `📤 Delegating to ${event.data.to}: ${event.data.task}`;
    case 'agent_error':
      return `❌ Error in ${event.data.role}: ${event.data.error?.message || 'Unknown error'}`;
    case 'retry':
      return `🔄 Retrying ${event.data.role} (attempt ${event.data.attempt}/${event.data.maxAttempts})`;
    case 'validation':
      return `✓ Validation: ${event.data.isValid ? 'Passed' : 'Failed'} (score: ${event.data.score || 0})`;
    case 'agent_log':
      return `📝 [${event.data.role}] ${event.data.message}`;
    case 'complete':
      return '🎉 Generation complete!';
    default:
      return `${event.type}`;
  }
};

const buildUrl = (baseUrl: string, endpoint: string) => {
  if (!baseUrl) return endpoint;
  const sanitizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${sanitizedBase}${endpoint}`;
};

function resolveBaseUrl(): string {
  try {
    return apiClient.getBaseUrl();
  } catch (_error: unknown) {
    return '';
  }
}

function parseEventLine<TOutput>(line: string): MeshEvent<TOutput> | null {
  if (!line.startsWith('data: ')) {
    return null;
  }

  const payload = line.slice(6);
  if (!payload || payload === '[DONE]') {
    return null;
  }

  try {
    return JSON.parse(payload) as MeshEvent<TOutput>;
  } catch (error: unknown) {
    console.warn('Unable to parse stream payload', error, payload);
    return null;
  }
}

function createStreamEvent<TOutput>(
  event: MeshEvent<TOutput>,
  getMessage: (event: MeshEvent<TOutput>) => string
): GenerationStreamEvent<TOutput> {
  return {
    type: event.type,
    timestamp: new Date(),
    data: event.data,
    message: getMessage(event),
  };
}

export function createGenerationHook<TInput, TOutput>(
  config: CreateGenerationHookConfig<TOutput>
): UseGenerationHook<TInput, TOutput> {
  const getMessage = config.getEventMessage ?? DEFAULT_MESSAGE;

  return function useGeneration(callbacks?: GenerationCallbacks<TOutput>) {
    const [state, setState] = useState<GenerationState<TOutput>>({
      isGenerating: false,
      isStreaming: false,
      progress: 0,
      currentMessage: '',
      error: null,
      result: null,
      streamEvents: [],
      logs: [],
    });

    const reset = useCallback(() => {
      setState({
        isGenerating: false,
        isStreaming: false,
        progress: 0,
        currentMessage: '',
        error: null,
        result: null,
        streamEvents: [],
        logs: [],
      });
    }, []);

    const generate = useCallback(
      async (input: TInput) => {
        setState((prev) => ({
          ...prev,
          isGenerating: true,
          error: null,
          result: null,
          logs: [],
        }));

        try {
          const response = await apiClient.post<TOutput | { success: boolean; result: TOutput }>(
            config.endpoint,
            input
          );

          // Extract result if wrapped in { success: true, result: ... }
          const data =
            response &&
            typeof response === 'object' &&
            'result' in response &&
            'success' in response
              ? (response as { success: boolean; result: TOutput }).result
              : (response as TOutput);

          setState((prev) => ({
            ...prev,
            isGenerating: false,
            progress: 100,
            result: data,
            currentMessage: 'Complete!',
          }));

          callbacks?.onComplete?.(data);
          return data;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';

          setState((prev) => ({
            ...prev,
            isGenerating: false,
            error: message,
          }));

          callbacks?.onError?.(message);
          throw error;
        }
      },
      [callbacks]
    );

    const generateStream = useCallback(
      async (input: TInput) => {
        setState((prev) => ({
          ...prev,
          isStreaming: true,
          isGenerating: true,
          error: null,
          result: null,
          progress: 0,
          currentMessage: '',
          streamEvents: [],
          logs: [],
        }));

        // ASYNC POLLING MODE
        if (config.asyncEndpoint) {
          try {
            const baseUrl = resolveBaseUrl();
            const startUrl = buildUrl(baseUrl, config.asyncEndpoint);

            // 1. Start Job
            const startRes = await fetch(startUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            });

            if (!startRes.ok) {
              const err = await startRes.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to start generation');
            }
            const { jobId } = await startRes.json();

            // 2. Poll
            let isComplete = false;
            let finalResult: TOutput | null = null;
            let lastProgress = 0;

            while (!isComplete) {
              await new Promise((r) => setTimeout(r, 1000));
              const statusUrl = buildUrl(baseUrl, `/api/generation/${jobId}`);
              const statusRes = await fetch(statusUrl);

              if (!statusRes.ok) throw new Error('Polling failed');
              const plan = await statusRes.json();

              // Update Progress
              const progress = plan.progress || 0;
              const currentRole = (plan.metadata as any)?.currentRole;
              const message = plan.metadata?.lastMessage || '';

              setState((prev) => {
                const newEvents = [...prev.streamEvents];

                if (currentRole) {
                  const lastEvent = newEvents.length > 0 ? newEvents[newEvents.length - 1] : null;
                  const lastRole = (lastEvent?.data as any)?.role;

                  if (lastRole !== currentRole) {
                    newEvents.push({
                      type: 'agent_start',
                      timestamp: new Date(),
                      data: { role: currentRole, description: message },
                      message: `Starting ${currentRole}...`,
                    });
                  } else if (message && message !== prev.currentMessage) {
                    newEvents.push({
                      type: 'agent_progress',
                      timestamp: new Date(),
                      data: { role: currentRole, message, progress },
                      message: message,
                    });
                  }
                } else if (message && message !== prev.currentMessage) {
                  newEvents.push({
                    type: 'agent_progress',
                    timestamp: new Date(),
                    data: { role: 'coordinator' as any, message, progress },
                    message: message,
                  });
                }

                return {
                  ...prev,
                  progress,
                  currentMessage: message || prev.currentMessage,
                  streamEvents: newEvents,
                };
              });

              if (progress > lastProgress) {
                callbacks?.onProgress?.(progress, message);
                lastProgress = progress;
              }

              if (plan.status === 'COMPLETED') {
                isComplete = true;
                finalResult = plan.result as TOutput;
                setState((prev) => ({
                  ...prev,
                  isGenerating: false,
                  isStreaming: false,
                  result: finalResult,
                  progress: 100,
                  currentMessage: 'Complete!',
                }));
                callbacks?.onComplete?.(finalResult!);
              } else if (plan.status === 'FAILED') {
                throw new Error(plan.errorMessage || 'Generation failed');
              }
            }
            return finalResult;
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setState((prev) => ({
              ...prev,
              isGenerating: false,
              isStreaming: false,
              error: message,
            }));
            callbacks?.onError?.(message);
            return null;
          }
        }

        // STREAMING MODE (Legacy)
        const baseUrl = resolveBaseUrl();
        const url = buildUrl(baseUrl, config.streamEndpoint);
        let finalResult: TOutput | null = null;

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });

          if (!response.ok) {
            let errorMessage = `Stream failed (${response.status} ${response.statusText})`;

            try {
              const errorData = await response.json();
              if (errorData && typeof errorData === 'object') {
                // Gestisce errorData.error come stringa o oggetto
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
            } catch {
              // Se il parsing JSON fallisce, usa il messaggio di default
              const text = await response.text().catch(() => '');
              if (text) {
                errorMessage = text.length > 200 ? `${text.slice(0, 200)}...` : text;
              }
            }

            throw new Error(errorMessage);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line) continue;

              callbacks?.onChunk?.(line);

              const event = parseEventLine<TOutput>(line);
              if (!event) continue;



              switch (event.type) {

                case 'agent_start': {
                  const role = event.data.role;
                  setState((prev) => {
                    const exists = prev.streamEvents.some(
                      (e) => e.type === 'agent_start' && (e.data as any)?.role === role
                    );
                    
                    // If exists, just update the message, don't add to log
                    if (exists) {
                      return {
                        ...prev,
                        currentMessage: `Starting ${event.data.description || role}...`,
                      };
                    }

                    return {
                      ...prev,
                      currentMessage: `Starting ${event.data.description || role}...`,
                      streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                    };
                  });
                  break;
                }
                case 'agent_progress':
                  setState((prev) => ({
                    ...prev,
                    streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                    progress: event.data.progress ?? prev.progress,
                    currentMessage: event.data.message ?? prev.currentMessage,
                  }));
                  if (typeof event.data.message === 'string') {
                    callbacks?.onProgress?.(event.data.progress ?? 0, event.data.message);
                  }
                  break;
                case 'agent_complete':
                  setState((prev) => ({
                    ...prev,
                    streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                    currentMessage: `${event.data.role} completed (${event.data.duration ?? 0}ms)`,
                  }));
                  break;
                case 'delegation':
                  setState((prev) => ({
                    ...prev,
                    streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                    currentMessage: `Delegating to ${event.data.to}: ${event.data.task}`,
                  }));
                  break;
                case 'agent_error':
                  setState((prev) => ({
                      ...prev,
                      streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                  }));

                  if (!event.data.retrying) {
                    const agentErrorMessage =
                      (event.data.error &&
                        (typeof event.data.error === 'string'
                          ? event.data.error
                          : typeof event.data.error === 'object' && event.data.error.message
                            ? String(event.data.error.message)
                            : null)) ||
                      'Agent error';
                    throw new Error(agentErrorMessage);
                  }
                  setState((prev) => ({
                    ...prev,
                    currentMessage: `Retrying ${event.data.role}...`,
                  }));
                  break;
                case 'validation':
                  setState((prev) => ({
                      ...prev,
                      streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                  }));
                  if (!event.data.isValid) {
                    console.warn('Validation issues:', event.data.issues);
                  }
                  break;
                case 'agent_log':
                  setState((prev) => ({
                    ...prev,
                    streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                    logs: [
                      ...prev.logs,
                      {
                        role: event.data.role,
                        message: event.data.message,
                        timestamp: new Date(event.data.timestamp),
                        metadata: event.data.metadata,
                      },
                    ],
                  }));
                  break;
                case 'complete':
                  finalResult = event.data.output;
                  setState((prev) => ({
                    ...prev,
                    streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                    isGenerating: false,
                    isStreaming: false,
                    result: event.data.output,
                    progress: 100,
                    currentMessage: 'Complete!',
                  }));
                  if (event.data.output) {
                    callbacks?.onComplete?.(event.data.output);
                  }
                  break;
                default:
                  setState((prev) => ({
                      ...prev,
                      streamEvents: [...prev.streamEvents, createStreamEvent(event, getMessage)],
                  }));
                  break;
              }
            }
          }

          setState((prev) => ({
            ...prev,
            isGenerating: false,
            isStreaming: false,
          }));

          return finalResult;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';

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
      [callbacks]
    );

    return {
      ...state,
      generate,
      generateStream,
      reset,
    };
  };
}
