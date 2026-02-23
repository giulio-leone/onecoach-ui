/**
 * Types for AI Settings Admin Components
 *
 * Note: Prisma enums are mirrored locally for client-side compatibility.
 * @prisma/client cannot be imported in browser context.
 */

// UserRole values (mirrored from Prisma for client-side use)
export const USER_ROLES = ['USER', 'ADMIN', 'COACH', 'SUPER_ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// AIProvider values (mirrored from Prisma for client-side use)
export const AI_PROVIDERS = [
  'GOOGLE',
  'ANTHROPIC',
  'OPENAI',
  'XAI',
  'OPENROUTER',
  'MINIMAX',
  'GEMINI_CLI',
] as const;
export type AIProvider = (typeof AI_PROVIDERS)[number];

// OperationType values (mirrored from Prisma for client-side use)
export const OPERATION_TYPES = [
  'GENERAL_CHAT',
  'VISION_ANALYSIS',
  'FOOD_LABEL_ANALYSIS',
  'MEAL_SEGMENTATION',
  'PLAN_GENERATION',
  'PLAN_MODIFICATION',
  'PLAN_RECALCULATION',
  'EXERCISE_GENERATION',
  'EXERCISE_AUTOCOMPLETE',
  'ANALYTICS_INSIGHTS',
  'PROGRESS_ANALYSIS',
  'WORKOUT_IMPORT',
  'COMPLEXITY_EVALUATION',
  'CHAT_GENERATION',
  'NUTRITION_GENERATION',
  'WORKOUT_GENERATION',
  'ONEAGENDA_GENERATION',
  'LIVE_COACHING',
] as const;

export type OperationType = (typeof OPERATION_TYPES)[number];

// AI Chat Feature enum (matching Prisma)
export type AIChatFeature =
  | 'MODEL_SELECTOR'
  | 'SPEECH_RECOGNITION'
  | 'CHECKPOINT'
  | 'CONTEXT'
  | 'CONVERSATION'
  | 'SOURCES'
  | 'SUGGESTION'
  | 'TASK'
  | 'ARTIFACT'
  | 'WEB_PREVIEW'
  | 'REASONING'
  | 'QUEUE';

// Framework Feature enum
export type FrameworkFeature =
  | 'consensus_system'
  | 'skills_system'
  | 'learning_feedback_loop'
  | 'intelligent_mode_selection'
  | 'auto_decomposition'
  | 'adaptive_recovery'
  | 'cost_monitoring'
  | 'orchestration_tracing'
  | 'workout_generation_retry'
  | 'generation_recovery'
  | 'import_models'
  | 'workout_import'; // alias legacy

export interface AIModel {
  id: string;
  provider: AIProvider;
  modelId: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  maxTokens: number;
  contextWindow: number;
  inputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  // Custom endpoint URL (es. "https://api.openai.com/v1")
  endpoint: string | null;
  // Riferimento a quale API key usare (es. "OPENAI_API_KEY")
  apiKeyRef: string | null;
  // OpenRouter provider slug (es. "deepinfra", "together") for provider routing
  preferredProvider: string | null;
  sortOrder: number;
  metadata?: Record<string, unknown> | null;
}

export interface FeatureConfig {
  id: string;
  feature: AIChatFeature;
  isEnabled: boolean;
  enabledForRoles: UserRole[];
  description: string | null;
  config: Record<string, unknown> | null;
}

export interface ModelAccess {
  id: string;
  modelId: string;
  modelName: string;
  role: UserRole;
  canSelect: boolean;
}

export interface FrameworkConfig {
  id: string;
  feature: FrameworkFeature;
  isEnabled: boolean;
  config: Record<string, unknown> | null;
  description: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

export interface CopilotAdminConfig {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
}

export interface ChatUsageStats {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  messagesByProvider: Record<string, number>;
  tokensByProvider: Record<string, number>;
  costByProvider: Record<string, number>;
  messagesByModel: Record<string, number>;
  dailyStats: Array<{
    date: string;
    messages: number;
    tokens: number;
    cost: number;
  }>;
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  coachCount: number;
  userCount: number;
}

// Tab types
export type AISettingsTab =
  | 'models'
  | 'features'
  | 'framework'
  | 'operations'
  | 'copilot'
  | 'analytics'
  | 'conversations';

export interface OperationConfig {
  id: string;
  operationType: OperationType;
  model: string;
  creditCost: number;
  maxTokens: number;
  thinkingBudget: number;
  isActive: boolean;
  updatedAt?: string;
}

// Feature metadata for UI
export interface FeatureMetadata {
  label: string;
  description: string;
  icon: string;
  category: 'core' | 'ui' | 'advanced';
}

// Framework feature metadata for UI
export interface FrameworkFeatureMetadata {
  label: string;
  description: string;
  icon: string;
  configSchema: Record<
    string,
    {
      type: 'boolean' | 'number' | 'string' | 'select' | 'multiselect';
      label: string;
      description?: string;
      options?: Array<{ value: string; label: string }>;
      min?: number;
      max?: number;
      step?: number;
    }
  >;
}
