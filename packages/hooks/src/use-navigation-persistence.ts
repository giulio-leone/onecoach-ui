import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigationStateStore } from '@OneCoach/lib-stores';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook per persistere lo stato di un componente attraverso la navigazione e refresh (sessionStorage).
 * Sfrutta Zustand come "Single Source of Truth".
 *
 * @param key Identificativo univoco per questo stato
 * @param initialState Valore iniziale (usato se non c'è nulla nello store)
 * @param debounceTimeMs (Opzionale) Tempo di debounce.
 *                       Se > 0: Usa uno stato locale bufferizzato e sincronizza asincronamente con Zustand.
 *                       Se = 0: (Default) Scrive e legge direttamente da Zustand (Sincrono).
 *
 * @returns [state, setState, clearState]
 */
export function useNavigationPersistence<T>(
  key: string,
  initialState: T,
  debounceTimeMs: number = 0
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 1. Accesso diretto allo store (Reattività Zustand-native)
  // Usiamo useShallow per evitare re-render se l'oggetto states cambia ma la nostra chiave no.
  const storedState = useNavigationStateStore(useShallow((s) => s.states[key] as T | undefined));
  const saveStateToStore = useNavigationStateStore((s) => s.saveState);
  const clearStoredState = useNavigationStateStore((s) => s.clearState);

  // Se stiamo usando il debounce, abbiamo bisogno di uno stato locale (buffer)
  // Se NO debounce, lo stato locale è inutile duplicazione, ma dobbiamo mantenere l'API coerente.
  // Per semplicità e performance UI immediata, usiamo useState inizializzato dallo store.
  const [localState, setLocalState] = useState<T>(() => {
    return storedState !== undefined ? storedState : initialState;
  });

  // Se il valore nello store cambia esternamente (es. reset globale), allineiamo lo stato locale
  // Questo rende Zustand la "Single Source of Truth" anche per il buffer locale
  useEffect(() => {
    if (storedState !== undefined && JSON.stringify(storedState) !== JSON.stringify(localState)) {
      setLocalState(storedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedState]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setLocalState((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;

        if (debounceTimeMs > 0) {
          // Debounced: Update local UI immediately, Store later
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            saveStateToStore(key, newValue);
          }, debounceTimeMs);
        } else {
          // Direct: Update Store immediately (Zustand persist middleware handles IO sync)
          saveStateToStore(key, newValue);
        }

        return newValue;
      });
    },
    [key, saveStateToStore, debounceTimeMs]
  );

  const clearState = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    clearStoredState(key);
    setLocalState(initialState);
  }, [key, clearStoredState, initialState]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [localState, setState, clearState];
}
