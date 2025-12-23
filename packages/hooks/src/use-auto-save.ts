/**
 * useAutoSave Hook
 *
 * Combines debounce + API call + optimistic updates for auto-saving data.
 * Provides smooth UX with automatic save indicator.
 * 
 * Enhanced Features:
 * - `enabled` flag for conditional autosave (e.g., only for existing programs)
 * - `hasPendingChanges` state for unsaved changes indicator
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from './use-debounce';

export interface AutoSaveOptions<T> {
  /** Debounce delay in ms (default: 2000 for autosave) */
  delay?: number;
  /** Enable/disable autosave (default: true). Set to false for new items. */
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveSuccess?: (data: T) => void;
  onSaveError?: (error: Error) => void;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  /** True when there are unsaved changes pending */
  hasPendingChanges: boolean;
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<T | void>,
  options: AutoSaveOptions<T> = {}
) {
  const { 
    delay = 2000, 
    enabled = true, 
    onSaveStart, 
    onSaveSuccess, 
    onSaveError 
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    hasPendingChanges: false,
  });

  const isMountedRef = useRef(false);
  const previousDataRef = useRef<T>(data);
  const initialDataRef = useRef<T>(data);

  // Track if component is mounted
  useEffect(() => {
    isMountedRef.current = true;
    initialDataRef.current = data;
    return () => {
      isMountedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSave = useCallback(async (dataToSave: T) => {
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
          hasPendingChanges: false,
        });

        if (onSaveSuccess) {
          onSaveSuccess(result as T);
        }
      }
    } catch (error: unknown) {
      const saveError = error instanceof Error ? error : new Error('Save failed');

      if (isMountedRef.current) {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: saveError,
          // Keep pending changes true on error so user knows data not saved
          hasPendingChanges: true,
        }));

        if (onSaveError) {
          onSaveError(saveError);
        }
      }
    }
  }, [saveFunction, onSaveStart, onSaveSuccess, onSaveError]);

  const debouncedSave = useDebouncedCallback((dataToSave: T) => {
    void performSave(dataToSave);
  }, delay);

  // Auto-save when data changes (only if enabled)
  useEffect(() => {
    // Skip initial mount
    if (!isMountedRef.current) {
      previousDataRef.current = data;
      return;
    }

    // Skip if data hasn't changed
    const currentDataJson = JSON.stringify(data);
    const previousDataJson = JSON.stringify(previousDataRef.current);
    
    if (currentDataJson === previousDataJson) {
      return;
    }

    previousDataRef.current = data;
    
    // Mark as having pending changes
    setState((prev) => ({ ...prev, hasPendingChanges: true }));

    // Only trigger autosave if enabled
    if (enabled) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);

  // Manual save function (bypasses debounce)
  const saveNow = useCallback(async () => {
    await performSave(data);
  }, [data, performSave]);

  // Reset pending changes (useful after manual save or navigation)
  const resetPendingChanges = useCallback(() => {
    setState((prev) => ({ ...prev, hasPendingChanges: false }));
  }, []);

  return {
    ...state,
    saveNow,
    resetPendingChanges,
  };
}

