/**
 * useChat Hook
 *
 * Hook per gestire chat con AI usando streaming
 * Supporta intent detection, workflow e message types multipli
 */

'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { useCompletion } from '@ai-sdk/react';
import type { ExtendedMessage } from '@onecoach/types';
import type { ModelTier } from '@onecoach/lib-ai';
import type { NutritionPlan } from '@onecoach/types';
import type { WorkoutProgram } from '@onecoach/types';
import { AI_REASONING_CONFIG } from '@onecoach/constants/models';

export interface ChatOptions {
  tier?: ModelTier;
  temperature?: number;
  provider?: string;
  model?: string;
  enableIntentDetection?: boolean;
  enableTools?: boolean;
  reasoning?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export function useChat(tier: ModelTier = 'balanced') {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [requiresMoreInfo, setRequiresMoreInfo] = useState(false);

  const { completion, complete, isLoading, stop, error, setCompletion } = useCompletion({
    api: '/api/chat',
    streamProtocol: 'text',
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, completion]);

  // Update assistant message when completion changes
  useEffect(() => {
    if (!completion) return;

    // Find or create assistant message
    startTransition(() => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];

        if (lastMessage?.role === 'assistant') {
          return prev.map((msg, idx) =>
            idx === prev.length - 1
              ? {
                  ...msg,
                  content: completion,
                }
              : msg
          );
        }

        return [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: completion,
            timestamp: new Date().toISOString(),
            type: 'text' as const,
          },
        ];
      });
    });
  }, [completion, currentIntent]);

  const sendMessage = useCallback(
    async (content: string, options?: ChatOptions) => {
      if (!content.trim() || isLoading) return;

      const currentTier = options?.tier ?? tier;

      // Add user message
      const userMessage: ExtendedMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages((prev) => [...prev, userMessage]);
      setCompletion(''); // Reset completion for new message
      setCurrentIntent(null);
      setRequiresMoreInfo(false);

      try {
        // Convert messages to API format
        const apiMessages = [...messages, userMessage].map((msg: ExtendedMessage) => ({
          role: msg.role,
          content: msg.content,
        }));

        const body: Record<string, unknown> = {
          messages: apiMessages,
          tier: currentTier,
          ...(options?.temperature && { temperature: options.temperature }),
          ...(options?.provider && { provider: options.provider }),
          ...(options?.model && { model: options.model }),
          enableIntentDetection: options?.enableIntentDetection ?? true,
          enableTools: options?.enableTools ?? true,
          reasoning: options?.reasoning ?? true,
          reasoningEffort: options?.reasoningEffort ?? AI_REASONING_CONFIG.DEFAULT_REASONING_EFFORT,
        };

        await complete('', { body });
      } catch (err: unknown) {
        console.error('Chat error:', err);
        // Error handling is done by useCompletion
      }
    },
    [messages, isLoading, tier, complete, setCompletion]
  );

  const addPlanPreview = useCallback(
    (
      planType: 'nutrition' | 'workout',
      planData: NutritionPlan | WorkoutProgram,
      planId?: string
    ) => {
      const planMessage: ExtendedMessage = {
        id: `plan_${Date.now()}`,
        role: 'assistant',
        content: `Piano ${planType === 'nutrition' ? 'nutrizionale' : 'workout'} generato`,
        timestamp: new Date().toISOString(),
        type: 'plan_preview',
        metadata: {
          planType,
          planData,
          planId,
        },
      };

      setMessages((prev) => [...prev, planMessage]);
    },
    []
  );

  const addFormRequest = useCallback(
    (
      fields: Array<{
        name: string;
        label: string;
        type: 'text' | 'number' | 'select' | 'multiselect';
        required: boolean;
        options?: string[];
      }>
    ) => {
      const formMessage: ExtendedMessage = {
        id: `form_${Date.now()}`,
        role: 'assistant',
        content: 'Ho bisogno di alcune informazioni per procedere',
        timestamp: new Date().toISOString(),
        type: 'form_request',
        metadata: {
          formFields: fields,
        },
      };

      setMessages((prev) => [...prev, formMessage]);
    },
    []
  );

  const addStatusMessage = useCallback(
    (content: string, statusType: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const statusMessage: ExtendedMessage = {
        id: `status_${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        type: 'status',
        metadata: {
          statusType,
        },
      };

      setMessages((prev) => [...prev, statusMessage]);
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCompletion('');
    setCurrentIntent(null);
    setRequiresMoreInfo(false);
  }, [setCompletion]);

  const deleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m: ExtendedMessage) => id !== m.id));
  }, []);

  return {
    messages,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Errore sconosciuto') : null,
    messagesEndRef,
    sendMessage,
    clearMessages,
    deleteMessage,
    stop,
    addPlanPreview,
    addFormRequest,
    addStatusMessage,
    currentIntent,
    requiresMoreInfo,
  };
}
