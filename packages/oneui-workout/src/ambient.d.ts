/**
 * Ambient module declarations for packages that use app-level or aliased imports.
 * These modules exist at the Next.js app level but not in individual packages.
 */

// next-intl app navigation (exists in apps/next/app/navigation.ts)
declare module 'app/navigation' {
  export const useRouter: () => {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => void;
  };
  export const Link: React.FC<{
    href: string;
    children?: React.ReactNode;
    className?: string;
    [key: string]: any;
  }>;
  export const usePathname: () => string;
  export const redirect: (url: string) => never;
}

// Features subpath aliases (actual packages are @giulio-leone/features-*)
declare module '@giulio-leone/features/food/hooks' {
  export const useFood: (...args: any[]) => any;
  export const useFoods: (...args: any[]) => any;
  export const useCreateFood: (...args: any[]) => any;
  export const useUpdateFood: (...args: any[]) => any;
  export const useUpdateFoodWithAI: (...args: any[]) => any;
  export const useBatchFoodOperations: (...args: any[]) => any;
  export const useFoodSearch: (...args: any[]) => any;
  export const useFoodSelection: (...args: any[]) => any;
  export const useDeleteFood: (...args: any[]) => any;
  export const useFoodFilters: (...args: any[]) => any;
  export const useFoodCategories: (...args: any[]) => any;
}

declare module '@giulio-leone/features/exercise/hooks' {
  export const useExercise: (...args: any[]) => any;
  export const useExercises: (...args: any[]) => any;
  export const useCreateExercise: (...args: any[]) => any;
  export const useUpdateExercise: (...args: any[]) => any;
  export const useDeleteExercise: (...args: any[]) => any;
  export const useBatchExerciseOperations: (...args: any[]) => any;
  export const useExerciseFilters: (...args: any[]) => any;
  export const useExerciseImport: (...args: any[]) => any;
  export const useExerciseExport: (...args: any[]) => any;
  export const useExerciseApproval: (...args: any[]) => any;
}

declare module '@giulio-leone/features/coach/hooks' {
  export const useCoachClients: (...args: any[]) => any;
  export const useCoachDashboardPlans: (...args: any[]) => any;
  export type CoachDashboardStats = any;
  export type MarketplacePlanCardProps = any;
}

declare module '@giulio-leone/features/workout/hooks' {
  export const useOneRepMax: (...args: any[]) => any;
  export type MissingOneRM = any;
}

// Next.js app-level path aliases (used in ui-chat)
declare module '@/lib/chat' {
  export const useCoachChat: (...args: any[]) => any;
  export const useChat: (...args: any[]) => any;
  export const useChatStream: (...args: any[]) => any;
  export type UIMessage = any;
  export type MessagePart = any;
  export type ChatMessage = any;
  export type ChatConfig = any;
}

declare module '@/components/ai-elements/conversation' {
  export const Conversation: React.FC<any>;
  export const ConversationUI: React.FC<any>;
  export const ConversationContent: React.FC<any>;
  export const ConversationScrollButton: React.FC<any>;
  export const ConversationEmptyState: React.FC<any>;
  const DefaultExport: React.FC<any>;
  export default DefaultExport;
}

declare module '@/components/ai-elements/message' {
  export const Message: React.FC<any>;
  export const MessageContent: React.FC<any>;
  export const MessageResponse: React.FC<any>;
  export const MessageActions: React.FC<any>;
}

declare module '@/components/ai-elements/reasoning' {
  export const Reasoning: React.FC<any>;
  export const ReasoningTrigger: React.FC<any>;
  export const ReasoningContent: React.FC<any>;
}

// Subpath exports not yet defined
declare module '@giulio-leone/lib-workout/intensity-calculator' {
  export const calculateIntensity: (...args: any[]) => any;
  export const getIntensityZone: (...args: any[]) => any;
  export const estimateOneRMFromReps: (...args: any[]) => any;
  export type IntensityZone = any;
}

declare module '@giulio-leone/lib-stores/header-actions.store' {
  export const useHeaderActions: (...args: any[]) => any;
  export const useHeaderActionsStore: (...args: any[]) => any;
}

declare module '@giulio-leone/lib-api-client/queries/coach.queries' {
  export const coachQueries: any;
  export const useCoachQuery: (...args: any[]) => any;
  export type CoachClient = any;
}

declare module '@giulio-leone/lib-api/queries/credits.queries' {
  export const creditsQueries: any;
  export const creditsKeys: any;
  export const useCreditBalance: (...args: any[]) => any;
  export const useCreditHistory: (...args: any[]) => any;
  export const useCreditsQuery: (...args: any[]) => any;
}

// lib-visual-builder subpath exports
declare module '@giulio-leone/lib-visual-builder/hooks' {
  export const useVisualBuilder: (...args: any[]) => any;
  export const useVisualBuilderState: (...args: any[]) => any;
  export const useBuilder: (...args: any[]) => any;
  export const useSkills: (...args: any[]) => any;
  export const useWorkflows: (...args: any[]) => any;
}

declare module '@giulio-leone/lib-visual-builder/types' {
  export type VisualBuilderConfig = any;
  export type VisualBuilderNode = any;
  export type VisualBuilderEdge = any;
  export type BuilderState = any;
  export type SkillNode = any;
  export type SkillEdge = any;
  export type SkillTreeConfig = any;
  export type Skill = any;
  export type SkillFormData = any;
  export type Workflow = any;
  export type WorkflowFormData = any;
  export type NodeType = any;
}

// Additional UI subpath exports
declare module '@giulio-leone/ui/dialog' {
  export const Dialog: React.FC<any>;
  export const DialogContent: React.FC<any>;
  export const DialogHeader: React.FC<any>;
  export const DialogTitle: React.FC<any>;
  export const DialogDescription: React.FC<any>;
  export const DialogFooter: React.FC<any>;
  export const DialogClose: React.FC<any>;
  export const DialogTrigger: React.FC<any>;
  export const DialogOverlay: React.FC<any>;
  export const DialogPortal: React.FC<any>;
}

declare module '@giulio-leone/ui/components' {
  export const LoadingState: React.FC<any>;
  export const EmptyState: React.FC<any>;
  export const ErrorState: React.FC<any>;
}

declare module '@/components/ai-elements/loader' {
  export const Loader: React.FC<any>;
}

declare module '@/components/ai-elements/task' {
  export const Task: React.FC<any>;
  export const TaskTrigger: React.FC<any>;
  export const TaskContent: React.FC<any>;
  export const TaskItem: React.FC<any>;
}

// ai-elements tool component
declare module '@/components/ai-elements/tool' {
  export const Tool: React.FC<any>;
  export const ToolHeader: React.FC<any>;
  export const ToolContent: React.FC<any>;
  export const ToolInput: React.FC<any>;
  export const ToolOutput: React.FC<any>;
}

// ai-elements plan component
declare module '@/components/ai-elements/plan' {
  export const Plan: React.FC<any>;
  export const PlanHeader: React.FC<any>;
  export const PlanTitle: React.FC<any>;
  export const PlanDescription: React.FC<any>;
  export const PlanAction: React.FC<any>;
  export const PlanContent: React.FC<any>;
  export const PlanFooter: React.FC<any>;
  export const PlanTrigger: React.FC<any>;
}

declare module '@giulio-leone/one-workout' {
  export type WorkoutImportResult = any;
  export const importWorkout: (...args: any[]) => any;
  export const getWeekAndDayFromDate: (...args: any[]) => any;
  export const getWorkoutProgramWeek: (...args: any[]) => any;
  export const getExerciseSets: (...args: any[]) => any;
  export const calculateWeightFromIntensity: (...args: any[]) => any;
  export const calculateIntensityFromWeight: (...args: any[]) => any;
  export const REPS_OPTIONS: any;
  export const WEIGHT_OPTIONS: any;
  export const INTENSITY_OPTIONS: any;
  export const RPE_OPTIONS: any;
  export const REST_OPTIONS: any;
}

declare module '@giulio-leone/lib-core' {
  export type DirectConversation = any;
  export type DirectConversationWithUser = any;
  export type DirectMessageWithSender = any;
  export type ConversationMessage = any;
  export const createId: (...args: any[]) => string;
  export const generateId: (...args: any[]) => string;
}

declare module '@giulio-leone/ui/visual-builder' {
  export const VisualBuilder: React.FC<any>;
  export const VisualBuilderShell: React.FC<any>;
  export const VisualBuilderCanvas: React.FC<any>;
  export const VisualBuilderToolbar: React.FC<any>;
  export const VisualBuilderNodeEditor: React.FC<any>;
  export const DayEditorShell: React.FC<any>;
}

declare module '@giulio-leone/lib-api/queries/credits.queries' {
  export const useCreditBalance: (...args: any[]) => any;
  export const useCreditHistory: (...args: any[]) => any;
  export const creditsQueries: any;
}

declare module '@giulio-leone/hooks' {
  export const useRealtimeInvalidation: (...args: any[]) => any;
  export const useRealtimeInvalidator: (...args: any[]) => any;
  export const useAuth: (...args: any[]) => any;
  export const useForm: (...args: any[]) => any;
  export const useMaxesListRealtime: (...args: any[]) => any;
  export const useUserActiveGenerations: (...args: any[]) => any;
  export const useDebounce: (...args: any[]) => any;
  export const useAutoSave: (...args: any[]) => any;
  export const useVisualBuilderState: (...args: any[]) => any;
  export type WorkflowRun = any;
  export type WorkflowRunStatus = any;
  export const useAllAdminFoodsRealtime: (...args: any[]) => any;
  export const useAllAdminExercisesRealtime: (...args: any[]) => any;
  export const useWorkflowRuns: (...args: any[]) => any;
}

declare module '@giulio-leone/lib-exercise' {
  export type LocalizedExercise = any;
  export type ExerciseTranslationView = any;
  export type Exercise = any;
  export const ExerciseService: any;
  export const ExerciseAdminService: any;
}

declare module '@giulio-leone/lib-api' {
  export const apiClient: any;
  export const createApiClient: (...args: any[]) => any;
  export const logError: (...args: any[]) => void;
  export const mapErrorToApiResponse: (...args: any[]) => any;
  export const handleApiError: (...args: any[]) => any;
  export type Food = any;
  export type FoodsResponse = any;
  export type FoodListParams = any;
  export type ExercisesResponse = any;
  export type Exercise = any;
  export type ExerciseListParams = any;
  export type PaginatedResponse<T = any> = any;
}
