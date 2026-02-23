'use client';

import { useState, useCallback } from 'react';

interface UseImportMeasurementsReturn {
  mutate: (
    formData: FormData,
    options?: { onSuccess?: (data: unknown) => void; onError?: (error: unknown) => void }
  ) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

export function useImportMeasurements(): UseImportMeasurementsReturn {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      formData: FormData,
      options?: { onSuccess?: (data: unknown) => void; onError?: (error: unknown) => void }
    ) => {
      setIsPending(true);
      setError(null);

      try {
        const response = await fetch('/api/analytics/body-measurements/import', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Import failed');
        }

        const data = await response.json();
        options?.onSuccess?.(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error(String(err)));
        options?.onError?.(err);
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { mutate, isPending, error };
}
