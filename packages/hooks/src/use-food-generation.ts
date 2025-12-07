import {
  createGenerationHook,
  type GenerationCallbacks,
  type GenerationStreamEvent,
  type GenerationState,
} from './utils/create-generation-hook';

export interface FoodGenerationInput {
  prompt: string;
  mergeExisting?: boolean;
}

export interface FoodGenerationOutput {
  summary: string;
  createResult: {
    created: number;
    updated: number;
    skipped: number;
    createdItems: Array<{ id: string; name: string }>;
    updatedItems: Array<{ id: string; name: string }>;
    skippedNames: string[];
    errors: Array<{ name: string; reason: string }>;
  } | null;
}

const useFoodGenerationBase = createGenerationHook<FoodGenerationInput, FoodGenerationOutput>({
  endpoint: '/api/admin/foods/ai',
  streamEndpoint: '/api/admin/foods/ai/stream',
});

export function useFoodGeneration(
  callbacks?: GenerationCallbacks<FoodGenerationOutput>
): GenerationState<FoodGenerationOutput> & {
  generate: (input: FoodGenerationInput) => Promise<FoodGenerationOutput>;
  generateStream: (input: unknown) => Promise<FoodGenerationOutput | null>;
  reset: () => void;
} {
  const hook = useFoodGenerationBase(callbacks);
  return {
    ...hook,
    generateStream: (input: unknown) => hook.generateStream(input as FoodGenerationInput),
  };
}

export type FoodGenerationState = GenerationState<FoodGenerationOutput>;
export type FoodGenerationStreamEvent = GenerationStreamEvent<FoodGenerationOutput>;
