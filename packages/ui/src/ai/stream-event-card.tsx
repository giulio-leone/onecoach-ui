/**
 * StreamEventCard Component (Web)
 *
 * Componente moderno per visualizzare eventi di stream
 * Design user-friendly per utenti normali, JSON visibile solo per admin
 */

'use client';

import { useMemo, useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Send,
  AlertCircle,
  RefreshCw,
  FileCheck,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { animations } from '@giulio-leone/lib-design-system/animations';

export type StreamEvent = {
  type: string;
  timestamp: Date;
  data: unknown;
  message: string;
};

interface StreamEventCardProps {
  event: StreamEvent;
  isAdmin?: boolean;
  index?: number;
}

const metaFields = new Set(['role', 'duration', 'description', 'from', 'to', 'task']);

/**
 * Estrae l'output JSON dall'evento
 */
function extractOutput(event: StreamEvent) {
  const { data, type } = event;

  if (data && typeof data === 'object') {
    if ('output' in data && data.output !== undefined) {
      return data.output;
    }

    if (type === 'agent_complete' && 'result' in data) {
      return data.result;
    }

    if (type === 'validation') {
      return data;
    }

    if (type === 'complete' && 'output' in data) {
      return data.output;
    }
  }

  return null;
}

/**
 * Calcola i dati da mostrare (escludendo meta fields)
 */
function computeDataToShow(event: StreamEvent) {
  const { data } = event;

  if (!data || typeof data !== 'object') {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!metaFields.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Ottiene il colore dell'icona in base al tipo di evento
 */
function getEventIconColor(type: string): string {
  switch (type) {
    case 'agent_start':
      return 'text-primary-600 dark:text-primary-400';
    case 'agent_complete':
      return 'text-green-600 dark:text-green-400';
    case 'delegation':
      return 'text-secondary-600 dark:text-secondary-400';
    case 'agent_error':
      return 'text-red-600 dark:text-red-400';
    case 'retry':
      return 'text-amber-600 dark:text-amber-400';
    case 'validation':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'complete':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-neutral-600 dark:text-neutral-400';
  }
}

/**
 * Converte messaggi tecnici in messaggi user-friendly
 */
function getUserFriendlyMessage(message: string, type: string): string {
  // Rimuove emoji e formatta
  const cleaned = message.replace(/[🚀✅📤❌🔄✓🎉]/g, '').trim();

  // Mapping specifico per tipo
  if (type === 'agent_start') {
    if (cleaned.toLowerCase().includes('starting')) {
      return cleaned.replace(/^starting\s*/i, '').trim() || 'Avvio processo...';
    }
  }

  if (type === 'agent_complete') {
    if (cleaned.toLowerCase().includes('completed')) {
      const match = cleaned.match(/(\w+)\s+completed/i);
      if (match) {
        return `${match[1]} completato con successo`;
      }
    }
  }

  if (type === 'delegation') {
    if (cleaned.toLowerCase().includes('delegating')) {
      const match = cleaned.match(/to\s+(\w+):\s*(.+)/i);
      if (match) {
        return `Delegato a ${match[1]}: ${match[2]}`;
      }
    }
  }

  return cleaned || 'Processo in corso...';
}

/**
 * Componente helper per renderizzare l'icona dell'evento
 * Usa switch diretto per evitare creazione componente durante render
 */
function EventIcon({
  type, className }: { type: string; className: string }) {
  switch (type) {
    case 'agent_start':
      return <Rocket className={className} />;
    case 'agent_complete':
      return <CheckCircle2 className={className} />;
    case 'delegation':
      return <Send className={className} />;
    case 'agent_error':
      return <AlertCircle className={className} />;
    case 'retry':
      return <RefreshCw className={className} />;
    case 'validation':
      return <FileCheck className={className} />;
    case 'complete':
      return <Sparkles className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export function StreamEventCard({ event, isAdmin = false, index = 0 }: StreamEventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const output = useMemo(() => extractOutput(event), [event]);
  const hasOutput = output !== null && output !== undefined;

  const dataToShow = useMemo(() => computeDataToShow(event), [event]);

  const shouldShowData =
    isAdmin &&
    (event.type === 'agent_complete' ||
      event.type === 'validation' ||
      event.type === 'complete' ||
      Object.keys(dataToShow).length > 0);

  const iconColor = getEventIconColor(event.type);
  const userFriendlyMessage = getUserFriendlyMessage(event.message, event.type);

  const toggle = () => {
    if (shouldShowData) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className={cn(
        'group mb-3 overflow-hidden rounded-xl border shadow-sm transition-all duration-200',
        darkModeClasses.card.base,
        'hover:shadow-md',
        animations.fadeIn,
        animations.slideUp
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex w-full items-start gap-4 p-4 text-left transition-colors',
          shouldShowData && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50',
          !shouldShowData && 'cursor-default'
        )}
        disabled={!shouldShowData}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-neutral-100 dark:bg-white/[0.04]',
              'transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
            )}
          >
            <EventIcon type={event.type} className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          {/* Message */}
          <p className={cn('text-sm font-medium', darkModeClasses.text.primary)}>
            {userFriendlyMessage}
          </p>

          {/* Metadata - solo per admin o informazioni essenziali */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={cn('text-neutral-500 dark:text-neutral-400')}>
              {event.timestamp.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>

            {(() => {
              if (!isAdmin || !event.data || typeof event.data !== 'object') return null;
              const data = event.data as Record<string, unknown>;
              if ('role' in data && data.role) {
                return (
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-300">
                    {String(data.role)}
                  </span>
                );
              }
              return null;
            })()}

            {(() => {
              if (!isAdmin || !event.data || typeof event.data !== 'object') return null;
              const data = event.data as Record<string, unknown>;
              if ('duration' in data && data.duration !== undefined) {
                return (
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {typeof data.duration === 'number'
                      ? `${(data.duration / 1000).toFixed(1)}s`
                      : String(data.duration)}
                  </span>
                );
              }
              return null;
            })()}

            {(() => {
              if (!isAdmin || !event.data || typeof event.data !== 'object') return null;
              const data = event.data as Record<string, unknown>;
              if ('tokensUsed' in data && data.tokensUsed !== undefined) {
                return (
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {String(data.tokensUsed)} tokens
                  </span>
                );
              }
              return null;
            })()}

            {(() => {
              if (!isAdmin || !event.data || typeof event.data !== 'object') return null;
              const data = event.data as Record<string, unknown>;
              if ('costUSD' in data && typeof data.costUSD === 'number') {
                return (
                  <span className="text-neutral-500 dark:text-neutral-400">
                    ${data.costUSD.toFixed(6)}
                  </span>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Expand/Collapse Icon - solo per admin */}
        {shouldShowData && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-neutral-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-neutral-400" />
            )}
          </div>
        )}
      </button>

      {/* Expanded Content - solo per admin */}
      {isExpanded && shouldShowData && isAdmin && (
        <div
          className={cn(
            'border-t border-neutral-200/60 bg-neutral-50 px-4 py-3 dark:border-white/[0.08] dark:bg-neutral-900/70',
            animations.slideDown
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              {hasOutput ? 'Output JSON:' : 'Dati evento:'}
            </span>
          </div>
          <div className="max-h-64 overflow-auto rounded-lg bg-neutral-950 px-3 py-2">
            <pre className="font-mono text-[11px] leading-5 text-emerald-300">
              {JSON.stringify(output ?? dataToShow ?? event.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
