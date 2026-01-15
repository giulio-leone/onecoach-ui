'use client';

import { useState, useCallback, useRef } from 'react';
import type { FlightAnalysis, FlightRecommendation } from './smart-analysis-panel';
import type { Flight } from './flight-card';
import type { ProgressField } from '@onecoach/one-agent-hooks';

// Re-export for convenience (DRY: single source of truth)
export type { ProgressField };

// ==================== TYPES ====================

export interface SmartSearchInput {
  flyFrom: string[];
  flyTo: string[];
  departureDate: string;
  returnDate?: string | null;
  maxResults?: number;
  currency?: string;
  preferences?: {
    priority?: 'price' | 'duration' | 'convenience';
    preferDirectFlights?: boolean;
    maxLayoverHours?: number;
    departureTimePreference?: 'morning' | 'afternoon' | 'evening' | 'any';
  };
}

export interface SmartSearchResult {
  tripType: 'one-way' | 'round-trip';
  outbound: Flight[];
  return?: Flight[];
  analysis: FlightAnalysis;
  recommendation: FlightRecommendation;
  alternatives?: FlightRecommendation[];
  metadata: {
    searchedAt: string;
    totalResults: number;
    cheapestPrice?: number;
    searchDurationMs?: number;
    agentVersion?: string;
  };
}

export interface SmartSearchState {
  isSearching: boolean;
  results: SmartSearchResult | null;
  error: string | null;
  /** v4.1: Real-time progress (0-100) */
  progress: number;
  /** v4.1: Current user-friendly message */
  userMessage: string;
  /** v4.1: All progress events received */
  events: ProgressField[];
  /** v4.1: Workflow run ID for resume capability */
  runId: string | null;
}

export interface UseSmartFlightSearchOptions {
  /** Use streaming API (default: true for v4.1) */
  streaming?: boolean;
  /** Show admin details in progress events */
  adminMode?: boolean;
  /** Max events to keep in state */
  maxEvents?: number;
}

// ==================== HOOK ====================

/**
 * Hook for AI-powered smart flight search
 *
 * v4.1: Now supports real-time streaming with progress updates.
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { search, isSearching, progress, userMessage, results } = useSmartFlightSearch();
 *
 * // Search with real-time progress
 * await search({
 *   flyFrom: ['FCO'],
 *   flyTo: ['CDG'],
 *   departureDate: '15/02/2025',
 * });
 *
 * // UI shows progress in real-time
 * <Progress value={progress} />
 * <p>{userMessage}</p>
 * ```
 */
export function useSmartFlightSearch(options: UseSmartFlightSearchOptions = {}) {
  const { streaming = true, maxEvents = 50 } = options;

  const [state, setState] = useState<SmartSearchState>({
    isSearching: false,
    results: null,
    error: null,
    progress: 0,
    userMessage: '',
    events: [],
    runId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Convert date format from dd/mm/yyyy to yyyy-mm-dd
   */
  const convertDate = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const [day, month, year] = parts;
    return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`;
  };

  /**
   * Search with streaming (v4.1)
   */
  const searchStreaming = useCallback(
    async (input: SmartSearchInput) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState({
        isSearching: true,
        results: null,
        error: null,
        progress: 0,
        userMessage: 'Connecting...',
        events: [],
        runId: null,
      });

      try {
        const response = await fetch('/api/flight/smart-search/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flyFrom: input.flyFrom,
            flyTo: input.flyTo,
            departureDate: convertDate(input.departureDate),
            returnDate: input.returnDate ? convertDate(input.returnDate) : undefined,
            maxResults: input.maxResults ?? 5,
            currency: input.currency ?? 'EUR',
            preferences: input.preferences ?? {
              priority: 'price',
              preferDirectFlights: true,
              maxLayoverHours: 4,
              departureTimePreference: 'any',
            },
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Search failed: ${response.status}`);
        }

        // Extract run ID from headers (lowercase for HTTP/2 compatibility)
        const runId = response.headers.get('x-workflow-run-id');
        if (runId) {
          setState((prev) => ({ ...prev, runId }));
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';
        let finalResult: SmartSearchResult | null = null;

        console.log('[useSmartFlightSearch] Starting stream processing...');

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[useSmartFlightSearch] Stream done, finalResult:', finalResult);
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
                console.log('[useSmartFlightSearch] Received [DONE] signal');
                continue;
              }

              const event = JSON.parse(jsonStr);
              console.log('[useSmartFlightSearch] Parsed event type:', event.type);

              // Handle progress events
              if (event.type === 'data-progress' || event.type === 'data') {
                const progressData = (event.data?.[0]?.data || event.data) as ProgressField;
                if (progressData?.step && progressData?.userMessage) {
                  setState((prev) => ({
                    ...prev,
                    progress: progressData.estimatedProgress ?? prev.progress,
                    userMessage: progressData.userMessage,
                    events: [...prev.events.slice(-(maxEvents - 1)), progressData],
                  }));
                }
              }

              // Handle finish event with result
              if (
                event.type === 'finish' ||
                event.type === 'complete' ||
                event.type === 'data-finish'
              ) {
                console.log('[useSmartFlightSearch] Finish event received:', event);
                const output = event.output || event.data?.output || event.data;
                console.log('[useSmartFlightSearch] Parsed output:', output);
                if (output?.tripType) {
                  finalResult = {
                    tripType: output.tripType,
                    outbound: output.outbound || [],
                    return: output.return,
                    analysis: output.analysis,
                    recommendation: output.recommendation,
                    alternatives: output.alternatives,
                    metadata: output.metadata,
                  };
                  console.log('[useSmartFlightSearch] Final result set:', finalResult);
                } else {
                  console.warn('[useSmartFlightSearch] No tripType in output, skipping');
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }

        // Update final state
        console.log('[useSmartFlightSearch] Setting final state, isSearching: false');
        setState((prev) => ({
          ...prev,
          isSearching: false,
          results: finalResult,
          progress: 100,
          userMessage: finalResult ? 'Complete!' : 'No results',
        }));
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;

        const message = error instanceof Error ? error.message : 'Search failed';
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error: message,
          userMessage: 'Error occurred',
        }));
      }
    },
    [maxEvents]
  );

  /**
   * Search with legacy API (non-streaming)
   */
  const searchLegacy = useCallback(async (input: SmartSearchInput) => {
    setState({
      isSearching: true,
      results: null,
      error: null,
      progress: 0,
      userMessage: 'Searching...',
      events: [],
      runId: null,
    });

    try {
      const response = await fetch('/api/flight/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flyFrom: input.flyFrom,
          flyTo: input.flyTo,
          departureDate: convertDate(input.departureDate),
          returnDate: input.returnDate ? convertDate(input.returnDate) : undefined,
          maxResults: input.maxResults ?? 5,
          currency: input.currency ?? 'EUR',
          preferences: input.preferences ?? {
            priority: 'price',
            preferDirectFlights: true,
            maxLayoverHours: 4,
            departureTimePreference: 'any',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      const results: SmartSearchResult = {
        tripType: data.tripType,
        outbound: data.outbound || [],
        return: data.return,
        analysis: data.analysis,
        recommendation: data.recommendation,
        alternatives: data.alternatives,
        metadata: data.metadata,
      };

      setState({
        isSearching: false,
        results,
        error: null,
        progress: 100,
        userMessage: 'Complete!',
        events: [],
        runId: data.runId || null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setState({
        isSearching: false,
        results: null,
        error: message,
        progress: 0,
        userMessage: '',
        events: [],
        runId: null,
      });
    }
  }, []);

  /**
   * Main search function - uses streaming by default
   */
  const search = useCallback(
    async (input: SmartSearchInput) => {
      if (streaming) {
        return searchStreaming(input);
      }
      return searchLegacy(input);
    },
    [streaming, searchStreaming, searchLegacy]
  );

  /**
   * Abort current search
   */
  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isSearching: false,
      userMessage: 'Cancelled',
    }));
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      isSearching: false,
      results: null,
      error: null,
      progress: 0,
      userMessage: '',
      events: [],
      runId: null,
    });
  }, []);

  return {
    ...state,
    search,
    abort,
    reset,
    /** Alias for backward compatibility */
    isLoading: state.isSearching,
    /** Latest event */
    latestEvent: state.events.length > 0 ? (state.events[state.events.length - 1] ?? null) : null,
  };
}

export default useSmartFlightSearch;
