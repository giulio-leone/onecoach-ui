/**
 * useLocalStorage Hook - Cross-platform
 *
 * Persist state in AsyncStorage for React Native.
 * Supports JSON serialization/deserialization.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load initial value from AsyncStorage
  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error: unknown) {
        console.error('LocalStorage error:', error);
      } finally {
        // noop
      }
    };

    loadValue();
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to AsyncStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to AsyncStorage
        AsyncStorage.setItem(key, JSON.stringify(valueToStore)).catch((error: unknown) => {
          console.error(`Error setting AsyncStorage key "${key}":`, error);
        });
      } catch (error: unknown) {
        console.error('LocalStorage error:', error);
      }
    },
    [key, storedValue]
  );

  // Function to remove from AsyncStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      AsyncStorage.removeItem(key).catch((error: unknown) => {
        console.error(`Error removing AsyncStorage key "${key}":`, error);
      });
    } catch (error: unknown) {
      console.error('LocalStorage error:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
