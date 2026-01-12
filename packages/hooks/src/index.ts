/**
 * Hooks - Barrel Export
 *
 * Esporta solo utility hooks cross-feature.
 * Feature-specific hooks sono disponibili nei feature modules:
 * - @onecoach/features/workout/hooks
 * - @onecoach/features/nutrition/hooks
 * - @onecoach/features/exercise/hooks
 * - @onecoach/features/food/hooks
 * - @onecoach/features/analytics/hooks
 * - @onecoach/features/coach/hooks
 */

// Generation hooks (cross-feature utility)
export * from './use-workout-generation';
export * from './use-nutrition-generation';
export * from './use-exercise-generation';
export * from './use-food-generation';
export * from './use-app-navigation';
export * from './use-durable-generation'; // SDK v4.0 - Durable AI generation
export * from './use-workflow-runs'; // SDK v4.0 - Admin Realtime monitoring

// Cross-feature utility hooks
export * from './use-chat';
export * from './use-credits';
export * from './use-user-profile';
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
export * from './use-body-measurements';
export * from './use-navigation-persistence';

// Form handling hook
export * from './useForm';
export * from './use-oneagenda-generation';

// Visual Builder hooks
export * from './use-visual-builder-state';
export * from './use-versioned-state';
export * from './use-persistent-versioned-state';

export * from './use-import-measurements';
export * from './use-maxes-list-realtime';
export * from './use-all-admin-foods-realtime';
export * from './user-preferences';

