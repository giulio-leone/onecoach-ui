'use client';

import { useTranslations } from 'next-intl';

import { Plan, PlanHeader, PlanTitle, PlanDescription, PlanContent } from './plan';
import { Task, TaskTrigger, TaskContent, type TaskStatus } from './task';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Unified Event Interface (matching Mesh Stream Protocol)
export interface GenerationLogEvent {
  type: string;
  timestamp?: Date | string;
  // Standard fields
  message?: string;
  data?: {
    // Agent Start
    agent?: string;
    label?: string;
    description?: string; // legacy support
    role?: string; // legacy support

    // Progress
    percentage?: number;
    progress?: number; // legacy support

    // Complete
    durationMs?: number;
    duration?: number; // legacy support
    result?: unknown;

    // Error
    error?: string | { message: string };

    // Step
    step?: string;
  };
}

interface GenerationLogProps {
  title: string;
  description: string;
  events: GenerationLogEvent[];
  isGenerating: boolean;
  className?: string;
}

export function GenerationLog({
  title,
  description,
  events,
  isGenerating,
  className,
}: GenerationLogProps) {
  const t = useTranslations('common');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Filter relevant events for display
  const relevantEvents = events.filter((event) =>
    [
      'agent_start',
      'agent_complete',
      'agent_error',
      'agent_step',
      'phase_start',
      'phase_complete',
    ].includes(event.type)
  );

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [relevantEvents.length, autoScroll]);

  // Handle manual scroll interaction
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop >= clientHeight - 10; // tolerance
    setAutoScroll(isAtBottom);
  };

  return (
    <Plan defaultOpen isStreaming={isGenerating} className={className}>
      <PlanHeader>
        <PlanTitle>{title}</PlanTitle>
        <PlanDescription>{description}</PlanDescription>
      </PlanHeader>
      <PlanContent>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 max-h-[400px] min-h-[100px] space-y-2 overflow-y-auto pr-2"
        >
          <AnimatePresence initial={false}>
            {relevantEvents.map((event, i) => {
              const { status, title, details } = normalizeEvent(event);

              // Unique key fallback
              const key = `${event.type}-${i}-${event.timestamp ? new Date(event.timestamp).getTime() : 'nts'}`;

              return (
                <Task key={key} defaultOpen={false} status={status}>
                  <TaskTrigger title={title} status={status} meta={details?.duration} />
                  {details?.content && (
                    <TaskContent>
                      <p className="text-xs break-words">{details.content}</p>
                    </TaskContent>
                  )}
                </Task>
              );
            })}
          </AnimatePresence>

          {isGenerating && relevantEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-24 items-center justify-center text-sm text-neutral-400"
            >
              {t('generation_log.inizializzazione_orchestrator')}
            </motion.div>
          )}
        </div>
      </PlanContent>
    </Plan>
  );
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function normalizeEvent(event: GenerationLogEvent): {
  status: TaskStatus;
  title: string;
  details?: { duration?: string; content?: string };
} {
  const { type, data } = event;
  const agentName = data?.label || data?.description || data?.agent || data?.role || 'System';

  let status: TaskStatus = 'pending';
  let title = event.message || type;
  let details = undefined;

  switch (type) {
    case 'agent_start':
    case 'phase_start':
      status = 'active';
      title = agentName;
      break;

    case 'agent_complete':
    case 'phase_complete':
      status = 'completed';
      title = `Completato: ${data?.agent || data?.role || 'Agent'}`;
      if (data?.durationMs || data?.duration) {
        details = {
          duration: `${Math.round(data.durationMs || data.duration || 0)}ms`,
        };
      }
      break;

    case 'agent_error':
      status = 'error';
      title = `Errore: ${data?.agent || data?.role || 'Agent'}`;
      const errorMessage = typeof data?.error === 'string' ? data.error : data?.error?.message;
      details = { content: errorMessage || 'Unknown error' };
      break;

    case 'agent_step':
      status = 'completed';
      title = data?.step || event.message || 'Step completato';
      break;
  }

  return { status, title, details };
}
