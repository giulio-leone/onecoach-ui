/**
 * useAutoSave Hook
 *
 * Combines debounce + API call + optimistic updates for auto-saving data.
 * Provides smooth UX with automatic save indicator.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebouncedCallback } from './use-debounce';

export interface AutoSaveOptions<T> {
  delay?: number; // Debounce delay in ms (default: 500)
  onSaveStart?: () => void;
  onSaveSuccess?: (data: T) => void;
  onSaveError?: (error: Error) => void;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<T>,
  options: AutoSaveOptions<T> = {}
) {
  const { delay = 500, onSaveStart, onSaveSuccess, onSaveError } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
  });

  const isMountedRef = useRef(false);
  const previousDataRef = useRef<T>(data);

  // Track if component is mounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const performSave = async (dataToSave: T) => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    if (onSaveStart) {
      onSaveStart();
    }

    try {
      const result = await saveFunction(dataToSave);

      if (isMountedRef.current) {
        setState({
          isSaving: false,
          lastSaved: new Date(),
          error: null,
        });

        if (onSaveSuccess) {
          onSaveSuccess(result);
        }
      }
    } catch (error: unknown) {
      const saveError = error instanceof Error ? error : new Error('Save failed');

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: saveError,
        }));

        if (onSaveError) {
          onSaveError(saveError);
        }
      }
    }
  };

  const debouncedSave = useDebouncedCallback((dataToSave: T) => {
    void performSave(dataToSave);
  }, delay);

  // Auto-save when data changes
  useEffect(() => {
    // Skip initial mount
    if (!isMountedRef.current) {
      previousDataRef.current = data;
      return;
    }

    // Skip if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    previousDataRef.current = data;
    debouncedSave(data);
  }, [data, debouncedSave]);

  // Manual save function (bypasses debounce)
  const saveNow = async () => {
    await performSave(data);
  };

  return {
    ...state,
    saveNow,
  };
}
