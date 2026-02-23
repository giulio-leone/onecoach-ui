/**
 * Ambient module declarations for app-level imports that cannot be resolved
 * from within the onecoach-ui submodule.
 *
 * All @giulio-leone/* packages are resolved via:
 * - workspace dependencies in package.json
 * - tsconfig paths from the root tsconfig.base.json
 *
 * Only app-level aliases (@/, app/) remain here as they reference
 * code in apps/next/ which is outside the package graph.
 */

// next-intl app navigation (exists in apps/next/navigation.ts)
declare module 'app/navigation' {
  import type { ComponentPropsWithoutRef } from 'react';

  export const useRouter: () => {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => void;
  };

  interface LinkProps extends Omit<ComponentPropsWithoutRef<'a'>, 'href'> {
    href: string;
    children?: React.ReactNode;
    locale?: string;
    prefetch?: boolean;
  }
  export const Link: React.FC<LinkProps>;
  export const usePathname: () => string;
  export const redirect: (url: string) => never;
}

// Next.js app-level path aliases (used in ui-chat)
declare module '@/lib/chat' {
  import type { Message as AIMessage } from 'ai';

  export interface UIMessage extends AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  }
  export interface MessagePart {
    type: string;
    content: string;
  }
  export interface ChatMessage {
    id: string;
    role: string;
    content: string;
    createdAt?: Date;
  }
  export interface ChatConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
  export function useCoachChat(config?: ChatConfig): Record<string, unknown>;
  export function useChat(config?: ChatConfig): Record<string, unknown>;
  export function useChatStream(config?: ChatConfig): Record<string, unknown>;
}

// AI Elements components (exist in @giulio-leone/ui but imported via @/ alias in ui-chat)
declare module '@/components/ai-elements/conversation' {
  export const Conversation: React.FC<Record<string, unknown>>;
  export const ConversationUI: React.FC<Record<string, unknown>>;
  export const ConversationContent: React.FC<Record<string, unknown>>;
  export const ConversationScrollButton: React.FC<Record<string, unknown>>;
  export const ConversationEmptyState: React.FC<Record<string, unknown>>;
  const DefaultExport: React.FC<Record<string, unknown>>;
  export default DefaultExport;
}

declare module '@/components/ai-elements/message' {
  export const Message: React.FC<Record<string, unknown>>;
  export const MessageContent: React.FC<Record<string, unknown>>;
  export const MessageResponse: React.FC<Record<string, unknown>>;
  export const MessageActions: React.FC<Record<string, unknown>>;
}

declare module '@/components/ai-elements/reasoning' {
  export const Reasoning: React.FC<Record<string, unknown>>;
  export const ReasoningTrigger: React.FC<Record<string, unknown>>;
  export const ReasoningContent: React.FC<Record<string, unknown>>;
}

declare module '@/components/ai-elements/loader' {
  export const Loader: React.FC<Record<string, unknown>>;
}

declare module '@/components/ai-elements/task' {
  export const Task: React.FC<Record<string, unknown>>;
  export const TaskTrigger: React.FC<Record<string, unknown>>;
  export const TaskContent: React.FC<Record<string, unknown>>;
  export const TaskItem: React.FC<Record<string, unknown>>;
}

declare module '@/components/ai-elements/tool' {
  export const Tool: React.FC<Record<string, unknown>>;
  export const ToolHeader: React.FC<Record<string, unknown>>;
  export const ToolContent: React.FC<Record<string, unknown>>;
  export const ToolInput: React.FC<Record<string, unknown>>;
  export const ToolOutput: React.FC<Record<string, unknown>>;
}

declare module '@/components/ai-elements/plan' {
  export const Plan: React.FC<Record<string, unknown>>;
  export const PlanHeader: React.FC<Record<string, unknown>>;
  export const PlanTitle: React.FC<Record<string, unknown>>;
  export const PlanDescription: React.FC<Record<string, unknown>>;
  export const PlanAction: React.FC<Record<string, unknown>>;
  export const PlanContent: React.FC<Record<string, unknown>>;
  export const PlanFooter: React.FC<Record<string, unknown>>;
  export const PlanTrigger: React.FC<Record<string, unknown>>;
}
