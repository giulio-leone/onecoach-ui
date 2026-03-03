'use client';

import React from 'react';

export interface ProgressField {
  step: string;
  userMessage: string;
  adminDetails?: string;
  estimatedProgress: number;
  iconHint?: 'search' | 'analyze' | 'compare' | 'filter' | 'loading' | 'success' | 'error';
  toolName?: string;
}

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
