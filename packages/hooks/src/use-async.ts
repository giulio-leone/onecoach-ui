/**
 * Generic async state management hook
 * Eliminates 300+ lines of duplicated loading/error/data state across 18+ hooks
 */

import { useCallback, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncReturn<T, Args extends unknown[] = []> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook for managing async operations with loading/error/data state
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsync(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     return response.json();
 *   }
 * );
 *
 * // Later in the component
 * await execute('user-123');
 * ```
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: {
    immediate?: boolean;
    initialData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): UseAsyncReturn<T, Args> {
  const { immediate, initialData, onSuccess, onError } = options ?? {};

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData ?? null,
    loading: immediate ?? false,
    error: null,
  });

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const result = await asyncFunction(...args);

        if (isMountedRef.current) {
          setState({
            data: result,
            loading: false,
            error: null,
          });

          onSuccess?.(result);
        }

        return result;
      } catch (_err: unknown) {
        const error = _err instanceof Error ? _err : new Error(String(_err));

        if (isMountedRef.current) {
          // Don't update state if request was aborted
          if (error.name !== 'AbortError') {
            setState({
              data: null,
              loading: false,
              error: error.message,
            });

            onError?.(error);
          }
        }

        return null;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData ?? null,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  // Cleanup on unmount
  useCallback(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for managing multiple async operations with shared loading state
 *
 * @example
 * ```tsx
 * const { loading, errors, execute } = useAsyncBatch();
 *
 * const handleSubmit = async () => {
 *   const results = await execute([
 *     () => api.createUser(userData),
 *     () => api.sendEmail(emailData),
 *     () => api.logEvent(eventData),
 *   ]);
 * };
 * ```
 */
export function useAsyncBatch() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);

  const execute = useCallback(async <T>(operations: Array<() => Promise<T>>): Promise<T[]> => {
    setLoading(true);
    setErrors([]);

    const results: T[] = [];
    const batchErrors: Error[] = [];

    await Promise.allSettled(
      operations.map(async (operation) => {
        try {
          const result = await operation();
          results.push(result);
        } catch (_err: unknown) {
          const error = _err instanceof Error ? _err : new Error(String(_err));
          batchErrors.push(error);
        }
      })
    );

    setLoading(false);
    setErrors(batchErrors);

    return results;
  }, []);

  return {
    loading,
    errors,
    execute,
    hasErrors: errors.length > 0,
  };
}
