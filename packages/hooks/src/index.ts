/**
 * Hooks - Barrel Export
 *
 * Esporta solo utility hooks cross-feature.
 * Feature-specific hooks sono disponibili nei feature modules:
 * - @giulio-leone/features/workout/hooks
 * - @giulio-leone/features/nutrition/hooks
 * - @giulio-leone/features/exercise/hooks
 * - @giulio-leone/features/food/hooks
 * - @giulio-leone/features/analytics/hooks
 * - @giulio-leone/features/coach/hooks
 */

// Generation hooks (cross-feature utility)
export * from './use-workout-generation';
export * from './use-nutrition-generation';
export * from './use-exercise-generation';
export * from './use-food-generation';
export * from './use-app-navigation';
export * from './use-durable-generation'; // SDK v4.0 - Durable AI generation
export * from './use-workflow-runs'; // SDK v4.0 - Admin Realtime monitoring
export * from './use-user-active-generations'; // SDK v4.0 - User generation progress

// Cross-feature utility hooks
export * from './use-chat';
export * from './use-admin-check';
export * from './use-calendar-assignments';
export * from './use-calendar-navigation';

// Pure utility hooks (reusable across features)
export * from './use-async';
export * from './use-debounce';
export * from './use-local-storage';
export * from './use-optimistic-update';
export * from './use-auto-save';
export * from './use-expansion-state';
export * from './use-planning-progress';
export * from './use-memory';
export * from './use-navigation-persistence';

// Form handling hook
export * from './useForm';
export * from './use-oneagenda-generation';

// Visual Builder hooks
export * from './use-visual-builder-state';
export * from './use-versioned-state';
export * from './use-persistent-versioned-state';

export * from './use-import-measurements';
export * from './user-preferences';

// Realtime hooks (Supabase realtime sync)
export * from './realtime';
