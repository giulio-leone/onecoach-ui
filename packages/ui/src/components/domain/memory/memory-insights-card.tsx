/**
 * Memory Insights Card
 *
 * Displays AI-generated insights and patterns.
 * KISS: Simple card component
 */

'use client';

import { Card } from '../../../card';
import type { MemoryPattern, MemoryInsight } from '@giulio-leone/lib-core/user-memory/types';
import { cn } from '@giulio-leone/lib-design-system';

export interface MemoryInsightsCardProps {
  patterns?: MemoryPattern[];
  insights?: MemoryInsight[];
  className?: string;
}

export function MemoryInsightsCard({
  patterns = [],
  insights = [],
  className,
}: MemoryInsightsCardProps) {
  if (patterns.length === 0 && insights.length === 0) {
    return null;
  }

  return (
    <Card variant="glass" padding="md" className={cn('space-y-6', className)}>
      {patterns.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Pattern Identificati
          </h3>
          <div className="space-y-3">
            {patterns.slice(0, 5).map((pattern, index) => (
              <div
                key={index}
                className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">{pattern.type}</p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {pattern.description}
                    </p>
                    {pattern.suggestions && pattern.suggestions.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-neutral-500 dark:text-neutral-500">
                        {pattern.suggestions.slice(0, 2).map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="ml-4 text-xs text-neutral-500 dark:text-neutral-400">
                    {Math.round(pattern.confidence * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Insights</h3>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className="border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 rounded-lg border p-4"
              >
                <p className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                  {insight.category}
                </p>
                <p className="mt-1 text-sm text-neutral-900 dark:text-white">{insight.insight}</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Basato su: {insight.basedOn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
