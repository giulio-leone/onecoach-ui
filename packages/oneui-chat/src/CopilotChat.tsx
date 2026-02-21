'use client';

import { useTranslations } from 'next-intl';
/**
 * CopilotChat Component
 *
 * Componente chat moderno usando AI Elements e useCoachChat.
 * SSOT per rendering chat con supporto completo AI SDK v6.
 *
 * Features:
 * - AI Elements per UI
 * - Supporto reasoning/thinking
 * - Tool calls rendering
 * - Streaming response
 * - Dark mode
 */

import { useRef, useEffect, useCallback, useState, memo, useMemo, type ReactNode } from 'react';
import { CheckIcon, RefreshCw, Sparkles, StopCircle, X } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { useCoachChat } from '@/lib/chat';
import type { UIMessage, MessagePart } from '@/lib/chat';

// AI Elements Components
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputButton,
  PromptInputTools,
} from '@onecoach/ui';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning';

// Stores
import { useCopilotActiveContextStore, selectMcpActiveContext } from '@onecoach/lib-stores';
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Loader } from '@/components/ai-elements/loader';
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanAction,
  PlanContent,
  PlanFooter,
  PlanTrigger,
} from '@/components/ai-elements/plan';
import { Task, TaskTrigger, TaskContent, TaskItem } from '@/components/ai-elements/task';

import { logger } from '@onecoach/lib-shared';
// ============================================================================
// Types
// ============================================================================

// Tipi inline per evitare dipendenze circolari con l'orchestrator

/**
 * Estrae in modo robusto i dati di orchestrazione da un risultato tool
 * senza affidarsi alla forma esatta dell'oggetto.
 *
 * Supporta:
 * - OrchestrationResult completo (plan.groups[])
 * - Struttura semplificata (plan.steps[] direttamente, es. createNutritionPlan)
 * - Plan annidato dentro `output.plan` o altri livelli intermedi.
 * - Streaming status con status/phase/message
 */
function extractOrchestration(result: unknown): {
  plan: {
    goal?: string;
    steps?: Array<{
      id: string;
      title: string;
      status: string;
    }>;
    groups?: Array<{
      id: string;
      title: string;
      description?: string;
      steps: Array<{
        id: string;
        title: string;
        description?: string;
        status: 'pending' | 'in_progress' | 'completed' | 'failed';
        toolName?: string;
        error?: string;
      }>;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
    }>;
    reasoning?: string;
    [key: string]: unknown;
  };
  success?: boolean;
  error?: string;
  stats?: {
    duration?: number;
    stepsExecuted?: number;
    totalSteps?: number;
    completedSteps?: number;
    failedSteps?: number;
    totalRetries?: number;
  };
  progress?: number;
  // Streaming status fields
  status?: string;
  phase?: string;
  message?: string;
} | null {
  if (!result || typeof result !== 'object') return null;

  const visited = new Set<unknown>();
  const queue: Record<string, unknown>[] = [result as Record<string, unknown>];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);

    const candidatePlan = node.plan as
      | {
          goal?: string;
          steps?: Array<{ id: string; title: string; status: string }>;
          groups?: Array<{
            id: string;
            title: string;
            description?: string;
            steps: Array<{
              id: string;
              title: string;
              description?: string;
              status: 'pending' | 'in_progress' | 'completed' | 'failed';
              toolName?: string;
              error?: string;
            }>;
            status: 'pending' | 'in_progress' | 'completed' | 'failed';
          }>;
          reasoning?: string;
          [key: string]: unknown;
        }
      | undefined;

    if (candidatePlan && typeof candidatePlan === 'object') {
      const hasGroups =
        Array.isArray(candidatePlan.groups) &&
        candidatePlan.groups.every(
          (
            group
          ): group is {
            id: string;
            title: string;
            description?: string;
            steps: Array<{
              id: string;
              title: string;
              description?: string;
              status: 'pending' | 'in_progress' | 'completed' | 'failed';
              toolName?: string;
              error?: string;
            }>;
            status: 'pending' | 'in_progress' | 'completed' | 'failed';
          } =>
            Boolean(group) &&
            typeof group === 'object' &&
            'steps' in group &&
            Array.isArray((group as { steps?: unknown }).steps)
        );
      const hasSteps =
        Array.isArray(candidatePlan.steps) &&
        candidatePlan.steps.length > 0 &&
        candidatePlan.steps.every(
          (s) => s && typeof s === 'object' && 'id' in s && 'title' in s && 'status' in s
        );

      if (hasGroups || hasSteps) {
        const rawStats = 'stats' in node ? node.stats : undefined;
        const parsedStats =
          rawStats && typeof rawStats === 'object'
            ? (rawStats as {
                duration?: number;
                stepsExecuted?: number;
                totalSteps?: number;
                completedSteps?: number;
                failedSteps?: number;
                totalRetries?: number;
              })
            : undefined;

        return {
          plan: candidatePlan,
          success: 'success' in node ? (node.success as boolean | undefined) : undefined,
          error: 'error' in node ? String(node.error) : undefined,
          stats: parsedStats,
          progress: 'progress' in node ? Number(node.progress) : undefined,
          // Streaming status fields
          status: 'status' in node ? String(node.status) : undefined,
          phase: 'phase' in node ? String(node.phase) : undefined,
          message: 'message' in node ? String(node.message) : undefined,
        };
      }
    }

    // BFS sui figli oggetto
    for (const value of Object.values(node)) {
      if (value && typeof value === 'object') {
        queue.push(value as Record<string, unknown>);
      }
    }
  }

  return null;
}

export interface CopilotChatProps {
  /** Dominio contestuale */
  domain?: string;
  /** ID conversazione esistente */
  conversationId?: string | null;
  /** Callback alla chiusura */
  onClose?: () => void;
  /** Classe CSS aggiuntiva */
  className?: string;
  /** Titolo custom */
  title?: string;
  /** Descrizione custom */
  description?: string;
  /** Placeholder input */
  placeholder?: string;
  /** Messaggi iniziali di benvenuto */
  welcomeMessage?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Componente per renderizzare le parti del messaggio
 */
const MessagePartRenderer = memo(({ part, index }: { part: MessagePart; index: number }) => {
  const t = useTranslations('common');

  // === Hooks must be called unconditionally at the top level ===
  const notifyToolModification = useCopilotActiveContextStore((s) => s.notifyToolModification);

  // Derive tool-related values unconditionally (safe for non-tool parts)
  const isToolPart =
    part.type === 'tool-call' || part.type === 'tool-result' || part.type.startsWith('tool-');

  const partWithToolName = part as MessagePart & { toolName?: string; state?: string };
  const extractedToolName = isToolPart
    ? partWithToolName.toolName ||
      (part.type.startsWith('tool-') && part.type !== 'tool-call' && part.type !== 'tool-result'
        ? part.type.replace('tool-', '')
        : 'Tool')
    : '';

  const toolPart = part as MessagePart & {
    toolCallId: string;
    toolName: string;
    args?: Record<string, unknown>;
    input?: Record<string, unknown>;
    result?: unknown;
    output?: unknown;
  };

  const toolResult = isToolPart
    ? toolPart.output !== undefined
      ? toolPart.output
      : toolPart.result
    : undefined;

  const state = isToolPart
    ? part.type === 'tool-call' || partWithToolName.state === 'input-available'
      ? 'input-available'
      : 'output-available'
    : 'input-available';

  // === useEffect for tool modification notification (always called, guards internally) ===
  useEffect(() => {
    if (!isToolPart) return;

    // Debug: Log all conditions
    console.log('[CopilotChat] Modification detection check:', {
      toolName: extractedToolName,
      hasToolResult: toolResult !== undefined,
      state,
      toolResultType: typeof toolResult,
    });

    if (toolResult === undefined || state !== 'output-available') {
      console.log('[CopilotChat] Skipping: toolResult undefined or state not output-available');
      return;
    }

    const result = toolResult as Record<string, unknown> | undefined;
    console.log('[CopilotChat] Checking result:', {
      result,
      success: result?.success,
      programId: result?.programId,
    });

    if (!result || result.success !== true) {
      console.log('[CopilotChat] Skipping: result.success is not true');
      return;
    }

    // Detect workout modification tools
    if (extractedToolName === 'workout_apply_modification' && result.programId) {
      console.log('[CopilotChat] 🔔 Calling notifyToolModification for workout:', result.programId);
      notifyToolModification('workout', result.programId as string, extractedToolName);
    }
    // Detect nutrition modification tools
    else if (extractedToolName === 'nutrition_apply_modification' && result.planId) {
      notifyToolModification('nutrition', result.planId as string, extractedToolName);
    }
    // Detect oneagenda modification tools
    else if (extractedToolName === 'oneagenda_apply_modification' && result.projectId) {
      notifyToolModification('oneagenda', result.projectId as string, extractedToolName);
    }
  }, [isToolPart, toolResult, state, extractedToolName, notifyToolModification]);

  // === Conditional returns AFTER all hooks ===
  if (part.type === 'text') {
    return <MessageResponse key={index}>{part.text}</MessageResponse>;
  }

  if (part.type === 'reasoning') {
    return (
      <Reasoning key={index} isStreaming={false}>
        <ReasoningTrigger />
        <ReasoningContent>
          {(part.reasoning || '') as string}
        </ReasoningContent>
      </Reasoning>
    );
  }

  // Handle AI SDK v6 dynamic tool types: 'tool-{toolName}' format
  // Also handles legacy 'tool-call' and 'tool-result' types
  if (isToolPart) {
    const toolArgs = toolPart.input || toolPart.args;

    // Generic orchestration visualization - works for any tool returning orchestration data
    // Debug logging disponibile solo in development per evitare rumore in produzione
    if (toolResult !== undefined && process.env.NODE_ENV === 'development') {
      logger.warn('[DEBUG CopilotChat] Tool result structure:', {
        toolName: extractedToolName,
        partType: part.type,
        hasResult: !!toolResult,
        resultType: typeof toolResult,
        resultKeys:
          toolResult && typeof toolResult === 'object'
            ? Object.keys(toolResult as Record<string, unknown>)
            : [],
      });
    }

    const orchestration = toolResult !== undefined ? extractOrchestration(toolResult) : null;

    if (orchestration) {
      const {
        plan,
        success,
        error,
        stats,
        progress: progressFromResult,
        status: orchestrationStatus,
        message: orchestrationMessage,
      } = orchestration;

      // Handle both structures: groups[] or steps[] directly
      const allSteps: Array<{
        id: string;
        title: string;
        status: string;
        description?: string;
        toolName?: string;
        error?: string;
      }> = plan.groups ? plan.groups.flatMap((group) => group.steps) : plan.steps || [];

      // Determine if still streaming (any step in progress or pending)
      const hasInProgressSteps = allSteps.some(
        (step) => step.status === 'in_progress' || step.status === 'pending'
      );
      const isStreaming = success !== true && hasInProgressSteps;

      // Calculate progress percentage
      const totalSteps = stats?.totalSteps || allSteps.length;
      const completedSteps =
        stats?.completedSteps ||
        stats?.stepsExecuted ||
        allSteps.filter((s: { status: string }) => s.status === 'completed').length;
      const progressPercentage =
        progressFromResult !== undefined
          ? progressFromResult
          : totalSteps > 0
            ? Math.round((completedSteps / totalSteps) * 100)
            : 0;

      // Friendly tool display names
      const toolDisplayNames: Record<string, string> = {
        createNutritionPlan: 'Piano Nutrizionale',
        createWorkoutPlan: 'Piano di Allenamento',
        createWorkoutProgram: 'Programma Allenamento',
        executeOrchestration: 'Orchestrazione',
        runOrchestrator: 'Orchestrazione',
      };
      const toolDisplayName =
        toolDisplayNames[extractedToolName] || extractedToolName || 'Orchestrazione';

      // Get status-based title
      const getStatusTitle = () => {
        if (success === true) return `✅ ${toolDisplayName} Completato`;
        if (error) return `❌ Errore ${toolDisplayName}`;
        if (orchestrationStatus === 'planning') return `🧠 Pianificazione ${toolDisplayName}`;
        if (orchestrationStatus === 'executing') return `⚙️ Esecuzione ${toolDisplayName}`;
        if (orchestrationStatus === 'completed') return `✅ ${toolDisplayName} Completato`;
        return `🔄 ${toolDisplayName} in corso...`;
      };

      return (
        <Plan key={index} isStreaming={isStreaming} defaultOpen={true}>
          <PlanHeader>
            <div className="flex-1">
              <PlanTitle>{getStatusTitle()}</PlanTitle>
              <PlanDescription>
                {orchestrationMessage ||
                  String(plan.goal || plan.reasoning || `Esecuzione di ${toolDisplayName}...`)}
              </PlanDescription>
            </div>
            <PlanAction>
              <PlanTrigger />
            </PlanAction>
          </PlanHeader>
          <PlanContent>
            {plan.groups && plan.groups.length > 0 ? (
              // Full structure with groups
              <div className="space-y-4">
                {plan.groups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    {group.title && (
                      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {group.title}
                      </h4>
                    )}
                    {group.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {group.description}
                      </p>
                    )}
                    {group.steps.length > 0 && (
                      <div className="space-y-2">
                        {group.steps.map((step) => (
                          <Task key={step.id} defaultOpen={step.status === 'in_progress'}>
                            <TaskTrigger title={String(step.title || 'Task')}>
                              <div className="flex items-center gap-2 text-sm">
                                {step.status === 'completed' && (
                                  <CheckIcon className="size-4 text-green-500" />
                                )}
                                {step.status === 'in_progress' && (
                                  <div className="border-primary-500 size-4 animate-spin rounded-full border-2 border-t-transparent" />
                                )}
                                {step.status === 'pending' && (
                                  <div className="size-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                                )}
                                {step.status === 'failed' && (
                                  <div className="size-4 rounded-full border-2 border-red-500 bg-red-500" />
                                )}
                                <span
                                  className={cn(
                                    step.status === 'completed' &&
                                      'text-green-600 dark:text-green-400',
                                    step.status === 'in_progress' &&
                                      'text-primary-600 dark:text-primary-400',
                                    step.status === 'pending' &&
                                      'text-neutral-500 dark:text-neutral-400',
                                    step.status === 'failed' && 'text-red-600 dark:text-red-400'
                                  )}
                                >
                                  {step.title}
                                </span>
                              </div>
                            </TaskTrigger>
                            <TaskContent>
                              <TaskItem>
                                {step.description && (
                                  <p className="mb-1 text-xs text-neutral-600 dark:text-neutral-400">
                                    {step.description}
                                  </p>
                                )}
                                {step.status === 'completed' && 'Completato'}
                                {step.status === 'in_progress' && 'In esecuzione...'}
                                {step.status === 'pending' && 'In attesa'}
                                {step.status === 'failed' && (
                                  <span className="text-red-600 dark:text-red-400">
                                    {step.error || 'Fallito'}
                                  </span>
                                )}
                                {step.toolName && (
                                  <span className="ml-2 text-xs text-neutral-500">
                                    {t('common.copilotchat.tool')}
                                    {step.toolName})
                                  </span>
                                )}
                              </TaskItem>
                            </TaskContent>
                          </Task>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : allSteps.length > 0 ? (
              // Simplified structure with steps directly
              <div className="space-y-2">
                {allSteps.map((step: { id: string; title: string; status: string }) => (
                  <Task key={step.id} defaultOpen={step.status === 'in_progress'}>
                    <TaskTrigger title={String(step.title || 'Task')}>
                      <div className="flex items-center gap-2 text-sm">
                        {step.status === 'completed' && (
                          <CheckIcon className="size-4 text-green-500" />
                        )}
                        {step.status === 'in_progress' && (
                          <div className="border-primary-500 size-4 animate-spin rounded-full border-2 border-t-transparent" />
                        )}
                        {step.status === 'pending' && (
                          <div className="size-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                        )}
                        {step.status === 'failed' && (
                          <div className="size-4 rounded-full border-2 border-red-500 bg-red-500" />
                        )}
                        <span
                          className={cn(
                            step.status === 'completed' && 'text-green-600 dark:text-green-400',
                            step.status === 'in_progress' &&
                              'text-primary-600 dark:text-primary-400',
                            step.status === 'pending' && 'text-neutral-500 dark:text-neutral-400',
                            step.status === 'failed' && 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                    </TaskTrigger>
                    <TaskContent>
                      <TaskItem>
                        {step.status === 'completed' && 'Completato'}
                        {step.status === 'in_progress' && 'In esecuzione...'}
                        {step.status === 'pending' && 'In attesa'}
                        {step.status === 'failed' && (
                          <span className="text-red-600 dark:text-red-400">Fallito</span>
                        )}
                      </TaskItem>
                    </TaskContent>
                  </Task>
                ))}
              </div>
            ) : null}
            {/* Progress bar */}
            {totalSteps > 0 && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Progresso</span>
                  <span>
                    {progressPercentage}% ({completedSteps}/{totalSteps})
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="from-primary-500 h-full bg-gradient-to-r to-violet-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </PlanContent>
          {success && stats && (
            <PlanFooter className="text-xs text-neutral-500 dark:text-neutral-400">
              {'completedSteps' in stats &&
                stats.completedSteps !== undefined &&
                `Completati: ${stats.completedSteps}`}
              {'failedSteps' in stats &&
                stats.failedSteps !== undefined &&
                ` | Falliti: ${stats.failedSteps}`}
              {'totalRetries' in stats &&
                stats.totalRetries !== undefined &&
                ` | Retry: ${stats.totalRetries}`}
              {'duration' in stats &&
                stats.duration !== undefined &&
                ` | Durata: ${(stats.duration / 1000).toFixed(1)}s`}
            </PlanFooter>
          )}
          {error && (
            <PlanFooter className="text-xs text-red-500 dark:text-red-400">
              {t('common.copilotchat.errore')}
              {error}
            </PlanFooter>
          )}
        </Plan>
      );
    }

    // Cast result to proper type for ToolOutput (JSONValue | ReactNode | undefined)
    const outputValue =
      toolResult !== undefined
        ? typeof toolResult === 'object'
          ? toolResult
          : String(toolResult)
        : undefined;

    return (
      <Tool key={index} defaultOpen={false}>
        <ToolHeader
          title={extractedToolName}
          type={`tool-${part.type === 'tool-call' ? 'invocation' : 'result'}`}
          state={state}
        />
        <ToolContent>
          {toolArgs && <ToolInput input={toolArgs} />}
          {outputValue !== undefined && (
            <ToolOutput output={outputValue as React.ReactNode} errorText={undefined} />
          )}
        </ToolContent>
      </Tool>
    );
  }

  return null;
});

MessagePartRenderer.displayName = 'MessagePartRenderer';

/**
 * Componente singolo messaggio
 */
const ChatMessage = memo(({ message }: { message: UIMessage }) => {
  const isUser = message.role === 'user';

  // Se il messaggio ha parti, renderizzale
  if (message.parts && message.parts.length > 0) {
    return (
      <Message from={message.role}>
        <MessageContent className={cn(isUser && 'bg-primary text-primary-foreground')}>
          {message.parts.map((part: MessagePart, idx: number) => (
            <MessagePartRenderer key={idx} part={part} index={idx} />
          ))}
        </MessageContent>
      </Message>
    );
  }

  // Fallback per messaggi con solo content
  return (
    <Message from={message.role}>
      <MessageContent className={cn(isUser && 'bg-primary text-primary-foreground')}>
        <MessageResponse>{message.content}</MessageResponse>
      </MessageContent>
    </Message>
  );
});

ChatMessage.displayName = 'ChatMessage';

// ============================================================================
// Main Component
// ============================================================================

export function CopilotChat({
  domain = 'general',
  conversationId: externalConversationId,
  onClose,
  className,
  title = 'Copilot',
  description = 'Assistente AI intelligente',
  placeholder = 'Scrivi un messaggio...',
  welcomeMessage,
}: CopilotChatProps) {
  const t = useTranslations('common');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const activeContext = useCopilotActiveContextStore();

  // Prepare context for AI
  const mcpContext = useMemo(() => {
    const ctx = selectMcpActiveContext(activeContext);

    // Transform for API (indices to numbers)
    return {
      ...ctx,
      workout: ctx.workout
        ? {
            ...ctx.workout,
            weekNumber: ctx.workout.weekIndex !== null ? ctx.workout.weekIndex + 1 : undefined,
            dayNumber: ctx.workout.dayIndex !== null ? ctx.workout.dayIndex + 1 : undefined,
          }
        : undefined,
      liveSession: ctx.liveSession ? { ...ctx.liveSession } : undefined,
    };
  }, [activeContext]);

  // Hook chat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    reload,
    isLoading,
    isStreaming,
    error,
  } = useCoachChat({
    conversationId: externalConversationId,
    body: {
      domain,
      reasoning: true,
      tier: 'balanced',
      context: mcpContext, // Inject active context
    },
    onFinish: () => {
      setShowWelcome(false);
    },
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Cmd/Ctrl + Enter to stop
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isStreaming) {
        e.preventDefault();
        stop();
      }
    },
    [isStreaming, stop]
  );

  // Determine if we should show empty state
  const showEmptyState = messages.length === 0 && showWelcome;

  return (
    <div className={cn('bg-background flex h-full flex-col', className)} onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
            <Sparkles className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <Conversation className="flex-1">
        <ConversationContent className="p-4">
          {showEmptyState ? (
            <ConversationEmptyState
              icon={<Sparkles className="text-primary h-10 w-10" />}
              title={t('common.copilotchat.inizia_una_conversazione')}
              description={welcomeMessage || `Chiedimi qualsiasi cosa su ${domain}.`}
            />
          ) : (
            <>
              {messages.map((message: UIMessage) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Loader size={20} />
                </div>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 text-destructive mx-4 mb-2 rounded-lg p-3 text-sm">
          <p>
            {t('common.copilotchat.errore')}
            {error.message}
          </p>
          <button onClick={() => reload()} className="mt-2 text-xs underline hover:no-underline">
            Riprova
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <PromptInput isLoading={isLoading}>
            <PromptInputTextarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[60px]"
            />
            <PromptInputFooter>
              <PromptInputTools>
                {isStreaming && (
                  <PromptInputButton onClick={stop} variant="ghost" size="sm" aria-label="Stop">
                    <StopCircle className="h-4 w-4" />
                  </PromptInputButton>
                )}
                {messages.length > 0 && !isLoading && (
                  <PromptInputButton
                    onClick={() => reload()}
                    variant="ghost"
                    size="sm"
                    aria-label="Ricarica"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </PromptInputButton>
                )}
              </PromptInputTools>
              <PromptInputSubmit
                status={isStreaming ? 'streaming' : isLoading ? 'submitted' : 'ready'}
                onStop={stop}
                disabled={!input.trim() || isLoading}
              />
            </PromptInputFooter>
          </PromptInput>
        </form>
      </div>
    </div>
  );
}

export default CopilotChat;
