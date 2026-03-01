'use client';

/**
 * usePersistentVersionedState Hook
 *
 * Extends useVersionedState with database persistence for version history.
 * Supports workout programs, nutrition plans, and agenda projects.
 * 
 * ARCHITECTURE:
 * - Undo/Redo operates on in-memory state for instant response
 * - Version history is persisted to database on save points
 * - Restoring a version loads from database and updates local state
 *
 * @example
 * const versioning = usePersistentVersionedState({
 *   domain: 'workout',
 *   entityId: programId,
 *   initialState: program,
 *   onSave: saveProgram,
 * });
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVersionedState, type UseVersionedStateReturn, type VersionSnapshot } from './use-versioned-state';

// ============================================================================
// Types
// ============================================================================

/** Supported domains for persistent versioning */
export type VersioningDomain = 'workout' | 'nutrition' | 'project';

/** Database version record structure */
export interface PersistedVersion<T = unknown> {
  id: string;
  version: number;
  state: T;
  createdAt: Date;
  createdBy: string;
  description?: string;
}

/** API configuration for version persistence */
export interface VersionPersistenceApi<T> {
  /** Fetch version history from database */
  fetchHistory: (entityId: string) => Promise<PersistedVersion<T>[]>;
  /** Save a new version to database */
  saveVersion: (entityId: string, state: T, description?: string) => Promise<PersistedVersion<T>>;
  /** Restore to a specific version */
  restoreVersion: (entityId: string, versionNumber: number) => Promise<T>;
}

/** Options for persistent versioned state */
export interface UsePersistentVersionedStateOptions<T> {
  /** Domain type (workout, nutrition, project) */
  domain: VersioningDomain;
  /** Entity ID (program ID, plan ID, project ID) */
  entityId: string | null;
  /** Initial state value */
  initialState: T;
  /** Maximum in-memory history (default: 20) */
  maxHistory?: number;
  /** Debounce for in-memory snapshots (default: 2000ms) */
  debounceMs?: number;
  /** Custom save handler - if provided, saves are automatic */
  onSave?: (state: T) => Promise<void>;
  /** Enable automatic version persistence on significant changes */
  autoPersist?: boolean;
}

/** Return type extends base with persistence features */
export interface UsePersistentVersionedStateReturn<T> extends UseVersionedStateReturn<T> {
  /** Persisted version history from database */
  persistedHistory: PersistedVersion<T>[];
  /** Loading state for database operations */
  isLoadingHistory: boolean;
  /** Save current state as a new persisted version */
  persistVersion: (description?: string) => Promise<void>;
  /** Restore from a persisted database version */
  restorePersistedVersion: (versionNumber: number) => Promise<void>;
  /** Refresh version history from database */
  refreshHistory: () => Promise<void>;
}

// ============================================================================
// API Utilities
// ============================================================================

function getApiEndpoint(domain: VersioningDomain, entityId: string): string {
  switch (domain) {
    case 'workout':
      return `/api/workouts/${entityId}/versions`;
    case 'nutrition':
      return `/api/nutrition/${entityId}/versions`;
    case 'project':
      return `/api/projects/${entityId}/versions`;
    default:
      throw new Error(`Unknown domain: ${domain}`);
  }
}

async function fetchVersionHistory<T>(
  domain: VersioningDomain,
  entityId: string
): Promise<PersistedVersion<T>[]> {
  const response = await fetch(getApiEndpoint(domain, entityId));
  if (!response.ok) {
    throw new Error(`Failed to fetch version history: ${response.statusText}`);
  }
  const data = await response.json();
  return data.versions ?? [];
}

async function saveVersionToDb<T>(
  domain: VersioningDomain,
  entityId: string,
  state: T,
  description?: string
): Promise<PersistedVersion<T>> {
  const response = await fetch(getApiEndpoint(domain, entityId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, description }),
  });
  if (!response.ok) {
    throw new Error(`Failed to save version: ${response.statusText}`);
  }
  return response.json();
}

async function restoreVersionFromDb<T>(
  domain: VersioningDomain,
  entityId: string,
  versionNumber: number
): Promise<T> {
  const response = await fetch(`${getApiEndpoint(domain, entityId)}/${versionNumber}/restore`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to restore version: ${response.statusText}`);
  }
  const data = await response.json();
  return data.state;
}

// ============================================================================
// Hook
// ============================================================================

export function usePersistentVersionedState<T>({
  domain,
  entityId,
  initialState,
  maxHistory = 20,
  debounceMs = 2000,
  onSave,
  // autoPersist reserved for future use
}: UsePersistentVersionedStateOptions<T>): UsePersistentVersionedStateReturn<T> {
  // Use the base in-memory versioned state for undo/redo
  const baseVersioning = useVersionedState<T>({
    initialState,
    maxHistory,
    debounceMs,
  });

  // Persisted history from database
  const [persistedHistory, setPersistedHistory] = useState<PersistedVersion<T>[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch history on mount and when entityId changes
  const refreshHistory = useCallback(async () => {
    if (!entityId) return;

    setIsLoadingHistory(true);
    try {
      const history = await fetchVersionHistory<T>(domain, entityId);
      setPersistedHistory(history);
    } catch (error) {
      console.error('[PersistentVersionedState] Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [domain, entityId]);

  // Load history on mount
  useEffect(() => {
    if (entityId) {
      refreshHistory();
    }
  }, [entityId, refreshHistory]);

  // Save current state as a new version
  const persistVersion = useCallback(
    async (description?: string) => {
      if (!entityId) return;

      try {
        const newVersion = await saveVersionToDb(domain, entityId, baseVersioning.state, description);
        setPersistedHistory((prev) => [newVersion, ...prev]);
      } catch (error) {
        console.error('[PersistentVersionedState] Failed to persist version:', error);
        throw error;
      }
    },
    [domain, entityId, baseVersioning.state]
  );

  // Restore from a persisted version
  const restorePersistedVersion = useCallback(
    async (versionNumber: number) => {
      if (!entityId) return;

      try {
        const restoredState = await restoreVersionFromDb<T>(domain, entityId, versionNumber);
        baseVersioning.setState(restoredState);
        
        // Optionally trigger save after restore
        if (onSave) {
          await onSave(restoredState);
        }
        
        // Refresh history after restore
        await refreshHistory();
      } catch (error) {
        console.error('[PersistentVersionedState] Failed to restore version:', error);
        throw error;
      }
    },
    [domain, entityId, baseVersioning, onSave, refreshHistory]
  );

  // Convert persisted history to snapshot format for compatibility
  const combinedHistory = useMemo((): VersionSnapshot<T>[] => {
    // In-memory snapshots take precedence (for recent changes)
    const inMemory = baseVersioning.history;
    
    // Add persisted versions that aren't already in in-memory
    const persistedAsSnapshots: VersionSnapshot<T>[] = persistedHistory.map((pv) => ({
      id: pv.id,
      state: pv.state,
      timestamp: new Date(pv.createdAt),
      description: pv.description ?? `Version ${pv.version}`,
    }));
    
    return [...inMemory, ...persistedAsSnapshots];
  }, [baseVersioning.history, persistedHistory]);

  return {
    // Base versioning functionality (undo/redo)
    state: baseVersioning.state,
    setState: baseVersioning.setState,
    undo: baseVersioning.undo,
    redo: baseVersioning.redo,
    canUndo: baseVersioning.canUndo,
    canRedo: baseVersioning.canRedo,
    
    // Combined history (in-memory + persisted)
    history: combinedHistory,
    currentVersionIndex: baseVersioning.currentVersionIndex,
    restoreVersion: baseVersioning.restoreVersion,
    
    // Diff utilities
    getDiff: baseVersioning.getDiff,
    
    // Manual controls
    createSnapshot: baseVersioning.createSnapshot,
    clearHistory: baseVersioning.clearHistory,
    
    // Persistence-specific
    persistedHistory,
    isLoadingHistory,
    persistVersion,
    restorePersistedVersion,
    refreshHistory,
  };
}
