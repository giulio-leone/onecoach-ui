/**
 * Agent Components Index
 *
 * Componenti moderni per la generazione di piani
 * Seguendo principi KISS, DRY, SOLID
 */

// UI Building Blocks
export { AgentFormField } from './form-field';
export {
  AgentSettingsPanel,
  PROVIDER_OPTIONS,
  MODEL_OPTIONS,
  DEFAULT_MODELS,
} from './settings-panel';
export { StreamingOutputPanel } from './output-panel';

// Componenti Generator
export { NutritionGenerator } from './nutrition-generator';
// WorkoutGenerator è in app/features/workouts

export * from './mesh-wizard';

