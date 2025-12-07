import {
  createGenerationHook,
  type GenerationCallbacks,
  type GenerationStreamEvent,
  type GenerationState,
} from './utils/create-generation-hook';

export interface ExerciseGenerationInput {
  prompt: string;
  autoApprove?: boolean;
  mergeExisting?: boolean;
}

export interface ExerciseGenerationOutput {
  summary: string;
  createResult: {
    created: number;
    skipped: number;
    errors: number;
  } | null;
  updateResult: unknown[];
  deleteResult: unknown[];
  approvalResult: unknown[];
  plan: unknown;
}

const useExerciseGenerationBase = createGenerationHook<
  ExerciseGenerationInput,
  ExerciseGenerationOutput
>({
  endpoint: '/api/admin/exercises/ai',
  streamEndpoint: '/api/admin/exercises/ai/stream',
});

export function useExerciseGeneration(
  callbacks?: GenerationCallbacks<ExerciseGenerationOutput>
): GenerationState<ExerciseGenerationOutput> & {
  generate: (input: ExerciseGenerationInput) => Promise<ExerciseGenerationOutput>;
  generateStream: (input: ExerciseGenerationInput) => Promise<ExerciseGenerationOutput | null>;
  reset: () => void;
} {
  return useExerciseGenerationBase(callbacks);
}

export type ExerciseGenerationState = GenerationState<ExerciseGenerationOutput>;
export type ExerciseGenerationStreamEvent = GenerationStreamEvent<ExerciseGenerationOutput>;
