import { useNavigationPersistence } from './use-navigation-persistence';
import { useForm as useBaseForm } from '@giulio-leone/lib-shared/hooks/use-form';
import type { UseFormOptions, UseFormReturn } from '@giulio-leone/lib-shared/hooks/use-form';

export type UsePersistentFormOptions<T extends object> = UseFormOptions<T> & {
  /**
   * Unique key for persistence.
   * If provided, form state will be persisted across navigation and reloads.
   */
  persistenceKey?: string;

  /**
   * Debounce time in ms for persistence.
   * Defaults to 0 (synchronous).
   * Recommended: 300-500ms for text inputs to improve performance.
   */
  persistenceDebounce?: number;
};

/**
 * Enhanced useForm with built-in persistence.
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   initialValues: { ... },
 *   onSubmit: async (v) => { ... },
 *   persistenceKey: 'my-feature-form', // Enables persistence
 * });
 * ```
 */
export function useForm<T extends object>(options: UsePersistentFormOptions<T>): UseFormReturn<T> {
  const { persistenceKey, persistenceDebounce = 0, ...baseOptions } = options;

  // Conditionally use persistence hook if key is provided
  // Note: Hooks cannot be conditional in React, but we can ignore the result if key is undefined.
  // However, 'useNavigationPersistence' requires a string key.
  // We'll use a dummy key if none provided, but won't use the values.
  // Better: We always call it, but with a "noop" key or similar, BUT that would persist "noop".
  // Best practice: We can't conditionally call hooks.
  // So we will use a stable hook call.

  const safeKey = persistenceKey || 'noop_form_persistence';

  // Use the persistence hook
  const [persistedValues, setPersistedValues, clearPersistedState] = useNavigationPersistence<T>(
    safeKey,
    baseOptions.initialValues,
    persistenceDebounce
  );

  // Intercept onSubmit to clear persistence on success
  const originalOnSubmit = baseOptions.onSubmit;
  const wrappedOnSubmit = async (values: T) => {
    await originalOnSubmit(values);
    if (persistenceKey) {
      clearPersistedState();
    }
  };

  // Pass controlled values to base hook if persistence is active
  const formProps = {
    ...baseOptions,
    onSubmit: wrappedOnSubmit,
    ...(persistenceKey
      ? {
          values: persistedValues,
          onValuesChange: setPersistedValues,
        }
      : {}),
  };

  return useBaseForm(formProps);
}
