'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ClipboardAction = 'copy' | 'cut';

export interface ClipboardItem<T> {
  data: T;
  action: ClipboardAction;
  sourceId?: string;
}

export interface ClipboardContextValue<T> {
  /** Current clipboard item */
  item: ClipboardItem<T> | null;
  /** Copy data to clipboard */
  copy: (data: T, sourceId?: string) => void;
  /** Cut data to clipboard (will trigger onConsumeCut on paste) */
  cut: (data: T, sourceId?: string) => void;
  /** Paste and return clipboard data. Clears clipboard if it was a cut operation. */
  paste: () => T | null;
  /** Clear clipboard */
  clear: () => void;
  /** Check if clipboard has an item */
  hasItem: () => boolean;
  /** Check if current item is a cut operation */
  isCut: () => boolean;
}

// ============================================================================
// Factory for creating typed clipboard contexts
// ============================================================================

/**
 * Creates a typed clipboard context and provider.
 * Use this factory to create domain-specific clipboards (Meal, Food, Exercise, etc.)
 *
 * @example
 * const { Provider: MealClipboardProvider, useClipboard: useMealClipboard } = createClipboardContext<Meal>();
 */
export function createClipboardContext<T>() {
  const Context = createContext<ClipboardContextValue<T> | null>(null);

  function Provider({
    children,
    onConsumeCut,
  }: {
    children: ReactNode;
    /** Called when a cut item is pasted, providing the original data for removal */
    onConsumeCut?: (data: T, sourceId?: string) => void;
  }) {
    const [clipboardItem, setClipboardItem] = useState<ClipboardItem<T> | null>(null);

    const copy = useCallback((data: T, sourceId?: string) => {
      setClipboardItem({ data, action: 'copy', sourceId });
    }, []);

    const cut = useCallback((data: T, sourceId?: string) => {
      setClipboardItem({ data, action: 'cut', sourceId });
    }, []);

    const paste = useCallback(() => {
      if (!clipboardItem) return null;

      const { data, action, sourceId } = clipboardItem;

      if (action === 'cut') {
        onConsumeCut?.(data, sourceId);
        setClipboardItem(null);
      }

      return data;
    }, [clipboardItem, onConsumeCut]);

    const clear = useCallback(() => {
      setClipboardItem(null);
    }, []);

    const hasItem = useCallback(() => clipboardItem !== null, [clipboardItem]);

    const isCut = useCallback(() => clipboardItem?.action === 'cut', [clipboardItem]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo<ClipboardContextValue<T>>(
      () => ({
        item: clipboardItem,
        copy,
        cut,
        paste,
        clear,
        hasItem,
        isCut,
      }),
      [clipboardItem, copy, cut, paste, clear, hasItem, isCut]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useClipboard(): ClipboardContextValue<T> {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useClipboard must be used within its Provider');
    }
    return context;
  }

  return { Provider, useClipboard, Context };
}

// ============================================================================
// Utility: Deep clone with new IDs
// ============================================================================

/**
 * Creates a deep clone of an item, replacing all `id` properties with new unique IDs.
 * Handles nested arrays recursively.
 *
 * @param item - The item to clone
 * @param generateId - Function to generate new IDs (e.g., createId from lib-shared)
 */
export function cloneWithNewIds<T>(item: T, generateId: () => string): T {
  if (item === null || typeof item !== 'object') {
    return item;
  }

  if (Array.isArray(item)) {
    return item.map((element: any) => cloneWithNewIds(element, generateId)) as T;
  }

  const cloned = { ...item } as Record<string, unknown>;

  // Replace id if it exists
  if ('id' in cloned && typeof cloned.id === 'string') {
    cloned.id = generateId();
  }

  // Recursively clone nested objects/arrays
  for (const key of Object.keys(cloned)) {
    const value = cloned[key];
    if (value !== null && typeof value === 'object') {
      cloned[key] = cloneWithNewIds(value, generateId);
    }
  }

  return cloned as T;
}
