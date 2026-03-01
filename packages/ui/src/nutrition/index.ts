/**
 * @giulio-leone/ui/nutrition
 * Nutrition UI components for meal planning and tracking.
 */

// Dashboard
export { NutritionDashboard } from './nutrition-dashboard';
export { SavedNutritionPlans } from './saved-plans';
export type { SavedNutritionPlansRef } from './saved-plans';

// Builder
export * from './builder';

// Food
export * from './food';

// Live
export * from './live';

// Plan
export * from './plan';

// Quick Log (M6-I2)
export { QuickLog } from './quick-log';
export type { QuickLogProps, QuickLogEntry, QuickLogFood, QuickLogPreset } from './quick-log';

// Hydration Tracker (M6-I4)
export { HydrationTracker } from './hydration-tracker';
export type { HydrationTrackerProps, HydrationEntry } from './hydration-tracker';

// Diary (M21)
export * from './diary';
