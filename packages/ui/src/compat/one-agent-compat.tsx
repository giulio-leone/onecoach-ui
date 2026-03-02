/**
 * Compatibility shim for @giulio-leone/one-agent imports.
 *
 * Provides local definitions for types, hooks, and components that were
 * previously imported from one-agent. This allows onecoach-ui to compile
 * without depending on the legacy one-agent package.
 */

'use client';

import React, { useState, useCallback } from 'react';

// ============================================================================
// Types from @giulio-leone/one-agent/hooks
// ============================================================================

export interface ProgressField {
  step: string;
  userMessage: string;
  adminDetails?: string;
  estimatedProgress: number;
  iconHint?: 'search' | 'analyze' | 'compare' | 'filter' | 'loading' | 'success' | 'error';
  toolName?: string;
}

// ============================================================================
// Types from @giulio-leone/one-agent (mesh)
// ============================================================================

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
  | { type: 'agent_complete'; data: { role: AgentRole; output: unknown; durationMs: number } }
  | { type: 'agent_error'; data: { role: AgentRole; error: string } }
  | { type: 'mesh_complete'; data: { output: TOutput; totalDurationMs: number } }
  | { type: 'mesh_error'; data: { error: string } };

// ============================================================================
// Types from @giulio-leone/one-agent/chat/types
// ============================================================================

export type ScreenContextType = Record<string, unknown>;

// ============================================================================
// Hooks from @giulio-leone/one-agent/hooks
// ============================================================================

export interface AdminModeState {
  isAdmin: boolean;
  toggle: () => void;
}

export function useAdminMode(defaultValue = false): AdminModeState {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem('onecoach-admin-mode');
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const toggle = useCallback(() => {
    setIsAdmin((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('onecoach-admin-mode', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { isAdmin, toggle };
}

// ============================================================================
// Components from @giulio-leone/one-agent/hooks
// ============================================================================

export interface AgentEventListProps {
  events: ProgressField[];
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
}

const ICON_MAP: Record<string, string> = {
  search: '🔍',
  analyze: '📊',
  compare: '⚖️',
  filter: '🔎',
  loading: '⏳',
  success: '✅',
  error: '❌',
};

export function AgentEventList({ events, isAdmin = false, onToggleAdmin }: AgentEventListProps) {
  if (!events.length) return null;

  return (
    <div className="space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Agent Progress</span>
        {onToggleAdmin && (
          <button
            onClick={onToggleAdmin}
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            {isAdmin ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span>{ICON_MAP[event.iconHint ?? 'loading'] ?? '⏳'}</span>
          <div className="flex-1">
            <p className="text-neutral-700 dark:text-neutral-300">{event.userMessage}</p>
            {isAdmin && event.adminDetails && (
              <p className="mt-0.5 text-xs text-neutral-400">{event.adminDetails}</p>
            )}
          </div>
          <span className="text-xs text-neutral-400">{event.estimatedProgress}%</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Hooks from @giulio-leone/one-agent (copilot)
// ============================================================================

export function useGlobalCopilotContext(_options: { debug?: boolean } = {}) {
  return {
    domain: null as string | null,
    screenContext: {} as ScreenContextType,
    setScreenContext: (_ctx: ScreenContextType) => {},
  };
}

// ============================================================================
// Components from @giulio-leone/one-agent (copilot)
// ============================================================================

export interface CopilotDomainProviderProps {
  domain: string;
  workoutData?: unknown;
  nutritionData?: unknown;
  children: React.ReactNode;
}

export function CopilotDomainProvider({ children }: CopilotDomainProviderProps) {
  return <>{children}</>;
}

// ============================================================================
// Chat client from @giulio-leone/one-agent/chat/client
// ============================================================================

export interface UnifiedChatProps {
  mode?: 'fullscreen' | 'sidebar' | 'floating';
  [key: string]: unknown;
}

export function UnifiedChat(_props: UnifiedChatProps) {
  return null; // Placeholder — chat is now rendered via gauss-chat-react
}
