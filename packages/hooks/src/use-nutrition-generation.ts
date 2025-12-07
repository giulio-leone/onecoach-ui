import type {
  PatternNutritionGenerationInput,
  PatternNutritionGenerationOutput,
} from '@OneCoach/one-agent';
import {
  createGenerationHook,
  type GenerationCallbacks,
  type GenerationStreamEvent,
  type GenerationState,
} from './utils/create-generation-hook';

const useNutritionGenerationBase = createGenerationHook<
  PatternNutritionGenerationInput,
  PatternNutritionGenerationOutput
>({
  endpoint: '/api/nutrition/generate',
  streamEndpoint: '/api/nutrition/generate-stream',
});

export function useNutritionGeneration(
  callbacks?: GenerationCallbacks<PatternNutritionGenerationOutput>
): GenerationState<PatternNutritionGenerationOutput> & {
  generate: (input: PatternNutritionGenerationInput) => Promise<PatternNutritionGenerationOutput>;
  generateStream: (
    input: PatternNutritionGenerationInput
  ) => Promise<PatternNutritionGenerationOutput | null>;
  reset: () => void;
} {
  return useNutritionGenerationBase(callbacks);
}

export type NutritionGenerationState = GenerationState<PatternNutritionGenerationOutput>;
export type NutritionGenerationStreamEvent =
  GenerationStreamEvent<PatternNutritionGenerationOutput>;
