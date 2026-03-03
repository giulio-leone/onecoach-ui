export interface ProgressField {
  step: string;
  userMessage: string;
  adminDetails?: string;
  estimatedProgress: number;
  iconHint?: 'search' | 'analyze' | 'compare' | 'filter' | 'loading' | 'success' | 'error';
  toolName?: string;
}

export enum AgentRole {
  COORDINATOR = 'coordinator',
  COPILOT = 'copilot',
  CALORIE_CALCULATION = 'calorie_calculation',
  MEAL_PLANNING = 'meal_planning',
  FOOD_SELECTION = 'food_selection',
  EXERCISE_SELECTION = 'exercise_selection',
  WORKOUT_PLANNING = 'workout_planning',
  DAY_GENERATION = 'day_generation',
  PROGRESSION = 'progression',
  VALIDATION = 'validation',
  ASSEMBLY = 'assembly',
}

export type AgentRoleType = AgentRole | string;

export type MeshEvent<TOutput = unknown> =
  | { type: 'agent_start'; data: { role: AgentRole; description: string } }
  | { type: 'agent_progress'; data: { role: AgentRole; progress: number; message: string } }
  | {
      type: 'agent_complete';
      data: { role: AgentRole; output: unknown; durationMs: number; duration?: number };
    }
  | {
      type: 'agent_error';
      data: { role: AgentRole; error: string | { message: string }; retrying?: boolean };
    }
  | {
      type: 'agent_log';
      data: { role: AgentRole; message: string; timestamp?: string; metadata?: unknown };
    }
  | { type: 'delegation'; data: { to: string; task: string } }
  | {
      type: 'retry';
      data: { role: AgentRole; attempt: number; maxAttempts: number };
    }
  | {
      type: 'validation';
      data: { isValid: boolean; score?: number; issues?: unknown[] };
    }
  | { type: 'complete'; data: { output?: TOutput | null } }
  | { type: 'mesh_complete'; data: { output: TOutput; totalDurationMs: number } }
  | { type: 'mesh_error'; data: { error: string } };
