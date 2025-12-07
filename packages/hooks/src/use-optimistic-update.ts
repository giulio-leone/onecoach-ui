/**
 * useOptimisticUpdate Hook
 *
 * Optimistic update pattern with automatic rollback on error.
 * Provides smooth UX while API calls are in flight.
 */

'use client';

import { useState, useCallback } from 'react';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeUpdate = useCallback(
    async (optimisticData: T, apiCall: () => Promise<T>, options?: OptimisticUpdateOptions<T>) => {
      // Store previous data for rollback
      const previousData = data;

      // Apply optimistic update immediately
      setData(optimisticData);
      setIsLoading(true);
      setError(null);

      try {
        // Execute API call
        const result = await apiCall();

        // Update with server response
        setData(result);
        setIsLoading(false);

        // Call success callback
        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (_err: unknown) {
        // Rollback on error
        setData(previousData);
        const error = _err instanceof Error ? _err : new Error('Unknown error');
        setError(error);
        setIsLoading(false);

        // Call error callback
        if (options?.onError) {
          options.onError(error);
        }

        throw error;
      }
    },
    [data]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    executeUpdate,
    reset,
    setData, // Allow manual data updates
  };
}
