/**
 * Workout Builder Components
 *
 * Visual editors for workout program elements:
 * - WarmupEditor: Warmup section configuration
 * - SupersetEditor: Linked back-to-back exercises
 * - CircuitEditor: Round-based circuit training
 * - CardioEditor: Cardio machine exercises
 * - ElementTypeSelector: Modal for choosing element type
 */

export { WarmupEditor } from './warmup-editor';
export { SupersetEditor } from './superset-editor';
export { CircuitEditor } from './circuit-editor';
export { CardioEditor } from './cardio-editor';
export { DayEditor } from './day-editor';
export { ElementTypeSelector } from './element-type-selector';
export { WorkoutVisualBuilder } from './workout-visual-builder';

// Re-export types from SSOT
export type { WorkoutElementType } from '@onecoach/schemas';

