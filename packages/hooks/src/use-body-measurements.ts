/**
 * useBodyMeasurements Hook
 *
 * CRUD operations for body measurements with optimistic updates.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BodyMeasurement } from "@onecoach/types-analytics";

/**
 * Get all body measurements
 */
async function getBodyMeasurements(): Promise<BodyMeasurement[]> {
  const response = await fetch('/api/analytics/body-measurements');

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Errore nel recupero delle misurazioni' }));
    throw new Error(error.error || 'Errore nel recupero delle misurazioni');
  }

  const data = await response.json();
  return data.measurements || [];
}

/**
 * Create a new body measurement
 */
async function createBodyMeasurement(
  data: Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<BodyMeasurement> {
  const response = await fetch('/api/analytics/body-measurements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Errore nella creazione della misurazione' }));
    throw new Error(error.error || 'Errore nella creazione della misurazione');
  }

  const result = await response.json();
  return result.measurement;
}

/**
 * Update a body measurement
 */
async function updateBodyMeasurement(
  id: string,
  data: Partial<Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<BodyMeasurement> {
  const response = await fetch(`/api/analytics/body-measurements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Errore nell'aggiornamento della misurazione" }));
    throw new Error(error.error || "Errore nell'aggiornamento della misurazione");
  }

  const result = await response.json();
  return result.measurement;
}

/**
 * Delete a body measurement
 */
async function deleteBodyMeasurement(id: string): Promise<void> {
  const response = await fetch(`/api/analytics/body-measurements/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Errore nell'eliminazione della misurazione" }));
    throw new Error(error.error || "Errore nell'eliminazione della misurazione");
  }
}

export interface UseBodyMeasurementsReturn {
  measurements: BodyMeasurement[];
  isLoading: boolean;
  error: Error | null;
  createMeasurement: (
    data: Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateMeasurement: (
    id: string,
    data: Partial<Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBodyMeasurements(): UseBodyMeasurementsReturn {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // For arrays, we manage optimistic updates manually

  const fetchMeasurements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetched = await getBodyMeasurements();
      setMeasurements(fetched);
    } catch (caughtError: unknown) {
      const error =
        caughtError instanceof Error
          ? caughtError
          : new Error('Errore nel recupero delle misurazioni');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const createMeasurement = useCallback(
    async (data: Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticMeasurement: BodyMeasurement = {
        ...data,
        id: tempId,
        userId: '', // Will be set by API
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setMeasurements((prev) => [...prev, optimisticMeasurement]);

      try {
        const created = await createBodyMeasurement(data);
        setMeasurements((prev) =>
          prev.map((m: BodyMeasurement) => (m.id === tempId ? created : m))
        );
      } catch (caughtError: unknown) {
        // Rollback on error
        setMeasurements((prev) => prev.filter((m: any) => m.id !== tempId));
        throw caughtError;
      }
    },
    []
  );

  const updateMeasurement = useCallback(
    async (
      id: string,
      data: Partial<Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ) => {
      const existing = measurements.find((m: any) => m.id === id);
      if (!existing) return;

      const optimisticMeasurement: BodyMeasurement = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setMeasurements((prev) =>
        prev.map((m: BodyMeasurement) => (m.id === id ? optimisticMeasurement : m))
      );

      try {
        const updated = await updateBodyMeasurement(id, data);
        setMeasurements((prev) => prev.map((m: BodyMeasurement) => (m.id === id ? updated : m)));
      } catch (caughtError: unknown) {
        // Rollback on error
        setMeasurements((prev) => prev.map((m: any) => (m.id === id ? existing : m)));
        throw caughtError;
      }
    },
    [measurements]
  );

  const deleteMeasurement = useCallback(
    async (id: string) => {
      const toDelete = measurements.find((m: any) => m.id === id);
      if (!toDelete) return;

      // Optimistic update
      setMeasurements((prev) => prev.filter((m: BodyMeasurement) => m.id !== id));

      try {
        await deleteBodyMeasurement(id);
      } catch (caughtError: unknown) {
        // Rollback on error
        setMeasurements((prev) =>
          [...prev, toDelete].sort(
            (a: BodyMeasurement, b: BodyMeasurement) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
        throw caughtError;
      }
    },
    [measurements]
  );

  return {
    measurements,
    isLoading,
    error,
    createMeasurement,
    updateMeasurement,
    deleteMeasurement,
    refetch: fetchMeasurements,
  };
}
