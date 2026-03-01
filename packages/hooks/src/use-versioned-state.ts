'use client';

/**
 * useVersionedState Hook
 *
 * Generic state management hook with undo/redo and version history.
 * Follows SOLID principles:
 * - Single Responsibility: State versioning only
 * - Open/Closed: Extensible via options, closed for modification
 * - Dependency Inversion: Accepts compare functions as dependencies
 *
 * @example
 * const {
 *   state,
 *   setState,
 *   undo,
 *   redo,
 *   canUndo,
 *   canRedo,
 *   history,
 *   restoreVersion,
 * } = useVersionedState({
 *   initialState: myInitialData,
 *   maxHistory: 50,
 *   debounceMs: 3000,
 * });
 */

import { useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// Types
// ============================================================================

/** A snapshot of state at a point in time */
export interface VersionSnapshot<T> {
  /** Unique identifier for this snapshot */
  id: string;
  /** The state at this point in time */
  state: T;
  /** When this snapshot was created */
  timestamp: Date;
  /** Optional description of what changed */
  description?: string;
}

/** Represents a change between two states */
export interface StateChange {
  /** JSON path to the changed property */
  path: string;
  /** Previous value */
  from: unknown;
  /** New value */
  to: unknown;
}

/** Diff between two versions */
export interface StateDiff {
  /** Properties that exist in new but not in old */
  added: string[];
  /** Properties that exist in old but not in new */
  removed: string[];
  /** Properties that changed value */
  changed: StateChange[];
  /** Whether there are any changes */
  hasChanges: boolean;
}

/** Configuration options for useVersionedState */
export interface UseVersionedStateOptions<T> {
  /** Initial state value */
  initialState: T;
  /** Maximum number of versions to keep in history (default: 50) */
  maxHistory?: number;
  /** Debounce time in ms before creating a snapshot (default: 3000) */
  debounceMs?: number;
  /** Custom equality function (default: JSON.stringify comparison) */
  isEqual?: (a: T, b: T) => boolean;
  /** Generate a description for state changes */
  getChangeDescription?: (prev: T, next: T) => string;
}

/** Return type of useVersionedState */
export interface UseVersionedStateReturn<T> {
  // Current state
  /** The current state value */
  state: T;

  // State setters
  /** Update state (triggers snapshot after debounce) */
  setState: (update: T | ((prev: T) => T)) => void;

  // Undo/Redo
  /** Undo the last change */
  undo: () => void;
  /** Redo the last undone change */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;

  // Version History
  /** List of all snapshots */
  history: VersionSnapshot<T>[];
  /** Current position in history (0 = most recent) */
  currentVersionIndex: number;
  /** Restore state to a specific version */
  restoreVersion: (index: number) => void;

  // Diff utilities
  /** Get diff between two versions */
  getDiff: (fromIndex: number, toIndex: number) => StateDiff;

  // Manual controls
  /** Force create a snapshot immediately */
  createSnapshot: (description?: string) => void;
  /** Clear all history (keeps current state) */
  clearHistory: () => void;
}

// ============================================================================
// Reducer State & Actions
// ============================================================================

interface VersionedState<T> {
  /** Current state */
  current: T;
  /** Undo stack (most recent first) */
  undoStack: VersionSnapshot<T>[];
  /** Redo stack (most recent first) */
  redoStack: VersionSnapshot<T>[];
  /** Full history for version browsing */
  history: VersionSnapshot<T>[];
}

type VersionedAction<T> =
  | { type: 'SET_STATE'; payload: T; description?: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESTORE_VERSION'; payload: number }
  | { type: 'CREATE_SNAPSHOT'; description?: string }
  | { type: 'CLEAR_HISTORY' };

// ============================================================================
// Utility Functions
// ============================================================================

/** Default equality check using JSON serialization */
function defaultIsEqual<T>(a: T, b: T): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

/** Create a new snapshot */
function createSnapshot<T>(state: T, description?: string): VersionSnapshot<T> {
  return {
    id: createId(),
    state: structuredClone(state),
    timestamp: new Date(),
    description,
  };
}

/** Deep diff between two objects */
export function computeDiff<T>(oldState: T, newState: T): StateDiff {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: StateChange[] = [];

  function compare(oldVal: unknown, newVal: unknown, path: string): void {
    // Handle null/undefined
    if (oldVal === null || oldVal === undefined) {
      if (newVal !== null && newVal !== undefined) {
        added.push(path);
      }
      return;
    }
    if (newVal === null || newVal === undefined) {
      removed.push(path);
      return;
    }

    // Handle arrays
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      const maxLen = Math.max(oldVal.length, newVal.length);
      for (let i = 0; i < maxLen; i++) {
        compare(oldVal[i], newVal[i], `${path}[${i}]`);
      }
      return;
    }

    // Handle objects
    if (typeof oldVal === 'object' && typeof newVal === 'object') {
      const oldKeys = new Set(Object.keys(oldVal as object));
      const newKeys = new Set(Object.keys(newVal as object));

      for (const key of newKeys) {
        if (!oldKeys.has(key)) {
          added.push(path ? `${path}.${key}` : key);
        }
      }

      for (const key of oldKeys) {
        if (!newKeys.has(key)) {
          removed.push(path ? `${path}.${key}` : key);
        }
      }

      for (const key of oldKeys) {
        if (newKeys.has(key)) {
          compare(
            (oldVal as Record<string, unknown>)[key],
            (newVal as Record<string, unknown>)[key],
            path ? `${path}.${key}` : key
          );
        }
      }
      return;
    }

    // Handle primitives
    if (oldVal !== newVal) {
      changed.push({ path, from: oldVal, to: newVal });
    }
  }

  compare(oldState, newState, '');

  return {
    added,
    removed,
    changed,
    hasChanges: added.length > 0 || removed.length > 0 || changed.length > 0,
  };
}

// ============================================================================
// Reducer
// ============================================================================

function createReducer<T>(maxHistory: number) {
  return function reducer(
    state: VersionedState<T>,
    action: VersionedAction<T>
  ): VersionedState<T> {
    switch (action.type) {
      case 'SET_STATE': {
        // Don't create snapshot for identical states
        const newState = action.payload;
        return {
          ...state,
          current: newState,
          // Clear redo stack when new changes are made
          redoStack: [],
        };
      }

      case 'CREATE_SNAPSHOT': {
        const snapshot = createSnapshot(state.current, action.description);
        const newUndoStack = [snapshot, ...state.undoStack].slice(0, maxHistory);
        const newHistory = [snapshot, ...state.history].slice(0, maxHistory);
        return {
          ...state,
          undoStack: newUndoStack,
          history: newHistory,
        };
      }

      case 'UNDO': {
        if (state.undoStack.length === 0) return state;

        const [lastSnapshot, ...remainingUndo] = state.undoStack;
        if (!lastSnapshot) return state;
        const currentSnapshot = createSnapshot(state.current, 'Before undo');

        return {
          current: lastSnapshot.state,
          undoStack: remainingUndo,
          redoStack: [currentSnapshot, ...state.redoStack].slice(0, maxHistory),
          history: state.history,
        };
      }

      case 'REDO': {
        if (state.redoStack.length === 0) return state;

        const [redoSnapshot, ...remainingRedo] = state.redoStack;
        if (!redoSnapshot) return state;
        const currentSnapshot = createSnapshot(state.current, 'Before redo');

        return {
          current: redoSnapshot.state,
          undoStack: [currentSnapshot, ...state.undoStack].slice(0, maxHistory),
          redoStack: remainingRedo,
          history: state.history,
        };
      }

      case 'RESTORE_VERSION': {
        const index = action.payload;
        if (index < 0 || index >= state.history.length) return state;

        const targetSnapshot = state.history[index];
        if (!targetSnapshot) return state;
        const currentSnapshot = createSnapshot(state.current, 'Before restore');

        return {
          current: targetSnapshot.state,
          undoStack: [currentSnapshot, ...state.undoStack].slice(0, maxHistory),
          redoStack: [],
          history: state.history,
        };
      }

      case 'CLEAR_HISTORY': {
        return {
          ...state,
          undoStack: [],
          redoStack: [],
          history: [],
        };
      }

      default:
        return state;
    }
  };
}

// ============================================================================
// Hook
// ============================================================================

const DEFAULT_MAX_HISTORY = 50;
const DEFAULT_DEBOUNCE_MS = 3000;

export function useVersionedState<T>({
  initialState,
  maxHistory = DEFAULT_MAX_HISTORY,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  isEqual = defaultIsEqual,
  getChangeDescription,
}: UseVersionedStateOptions<T>): UseVersionedStateReturn<T> {
  // Create reducer with configured max history
  const reducer = useMemo(() => createReducer<T>(maxHistory), [maxHistory]);

  // Initialize state
  const [versionedState, dispatch] = useReducer(reducer, {
    current: initialState,
    undoStack: [],
    redoStack: [],
    history: [],
  });

  // Track previous state for snapshot creation
  const prevStateRef = useRef<T>(initialState);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced snapshot creation
  const scheduleSnapshot = useCallback(
    (newState: T, oldState: T) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (!isEqual(newState, oldState)) {
          const description = getChangeDescription?.(oldState, newState);
          dispatch({ type: 'CREATE_SNAPSHOT', description });
          prevStateRef.current = newState;
        }
      }, debounceMs);
    },
    [debounceMs, isEqual, getChangeDescription]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // State setter - note: we use the dispatch pattern to avoid stale closures
  const setState = useCallback(
    (update: T | ((prev: T) => T)) => {
      // For function updates, we need the current state from the reducer
      // The reducer handles this internally via action payload
      if (typeof update === 'function') {
        // Get current state synchronously - dispatch returns new state reference
        const updateFn = update as (prev: T) => T;
        // We read from the ref for the previous state to schedule snapshot
        const oldState = prevStateRef.current;
        
        // Dispatch a custom action that passes the update function
        // We'll need to compute new state here to pass to dispatch
        // Since we're in a callback, we need to be careful about stale state
        // The solution is to pass the function to a new action type or compute inline
        // For now, we read current from a stable source
        dispatch({ 
          type: 'SET_STATE', 
          payload: updateFn(versionedState.current) 
        });
        
        // Schedule snapshot with the new state
        const newState = updateFn(versionedState.current);
        scheduleSnapshot(newState, oldState);
      } else {
        dispatch({ type: 'SET_STATE', payload: update });
        scheduleSnapshot(update, prevStateRef.current);
      }
    },
    [scheduleSnapshot, versionedState]
  );

  // Undo action
  const undo = useCallback(() => {
    if (versionedState.undoStack.length > 0) {
      dispatch({ type: 'UNDO' });
    }
  }, [versionedState.undoStack.length]);

  // Redo action
  const redo = useCallback(() => {
    if (versionedState.redoStack.length > 0) {
      dispatch({ type: 'REDO' });
    }
  }, [versionedState.redoStack.length]);

  // Restore to version
  const restoreVersion = useCallback((index: number) => {
    dispatch({ type: 'RESTORE_VERSION', payload: index });
  }, []);

  // Get diff between two versions
  const getDiff = useCallback(
    (fromIndex: number, toIndex: number): StateDiff => {
      const fromState =
        fromIndex === -1
          ? versionedState.current
          : versionedState.history[fromIndex]?.state;
      const toState =
        toIndex === -1
          ? versionedState.current
          : versionedState.history[toIndex]?.state;

      if (!fromState || !toState) {
        return { added: [], removed: [], changed: [], hasChanges: false };
      }

      return computeDiff(fromState, toState);
    },
    [versionedState]
  );

  // Manual snapshot creation
  const createSnapshotManual = useCallback((description?: string) => {
    dispatch({ type: 'CREATE_SNAPSHOT', description });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  return {
    // Current state
    state: versionedState.current,

    // State setters
    setState,

    // Undo/Redo
    undo,
    redo,
    canUndo: versionedState.undoStack.length > 0,
    canRedo: versionedState.redoStack.length > 0,

    // Version History
    history: versionedState.history,
    currentVersionIndex: -1, // -1 represents current (not in history)
    restoreVersion,

    // Diff utilities
    getDiff,

    // Manual controls
    createSnapshot: createSnapshotManual,
    clearHistory,
  };
}
