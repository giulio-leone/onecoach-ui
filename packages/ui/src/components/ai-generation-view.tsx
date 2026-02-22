'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../button';

// ----------------------------------------------------------------------------
// Types & Props
// ----------------------------------------------------------------------------

export interface AIGenerationLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface AIGenerationViewProps {
  title?: string;
  subtitle?: string;
  progress: number; // 0-100
  logs: AIGenerationLog[];
  isGenerating: boolean;
  isSuccess: boolean;
  error: string | null;
  successTitle?: string;
  successMessage?: string;
  successActionLabel?: string;
  onSuccessAction?: () => void;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode; // Slot for custom visualizer (e.g., MeshVisualizer)
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function AIGenerationView({
  title = 'AI Architect',
  subtitle = 'Generation in progress...',
  progress,
  logs,
  isGenerating,
  isSuccess,
  error,
  successTitle = 'Done!',
  successMessage = 'Generation completed successfully.',
  successActionLabel = 'Continue',
  onSuccessAction,
  onRetry,
  className,
  children,
}: AIGenerationViewProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      className={cn(
        'relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl ring-1 ring-white/10',
        className
      )}
    >
      {/* Header / Status */}
      <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between border-b border-white/5 bg-neutral-950/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {isSuccess ? 'Completed' : error ? 'Error' : title}
            </h3>
            <p className="text-xs text-neutral-400">
              {isSuccess ? 'Process finished' : error ? 'A problem occurred' : subtitle}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="relative h-[500px] w-full pt-16">
        {/* Custom Visualizer Slot (e.g. MeshVisualizer) */}
        {children || (
          <div className="flex h-full w-full items-center justify-center text-neutral-700">
            {/* Default placeholder if no visualizer provided */}
            <div className="h-64 w-64 rounded-full border border-dashed border-neutral-800" />
          </div>
        )}

        {/* Success Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-green-500/50"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </motion.div>
                <h2 className="mb-2 text-3xl font-bold text-white">{successTitle}</h2>
                <p className="mb-8 text-neutral-400">{successMessage}</p>
                {onSuccessAction && (
                  <Button variant="gradient-primary" onClick={onSuccessAction} className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>{successActionLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm"
            >
              <div className="max-w-md p-6 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 ring-1 ring-red-500/50">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Something went wrong</h3>
                <p className="mb-6 text-sm text-neutral-400">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="rounded-lg bg-white px-6 py-2 font-medium text-neutral-900 hover:bg-neutral-100"
                  >
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Log Stream Footer */}
      <div className="border-t border-white/5 bg-neutral-900/50 p-4 backdrop-blur-md">
        <div
          ref={logContainerRef}
          className="h-32 space-y-2 overflow-y-auto scroll-smooth pr-2 font-mono text-xs"
        >
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-start gap-2 rounded px-2 py-1',
                log.type === 'error'
                  ? 'bg-red-500/10 text-red-400'
                  : log.type === 'success'
                    ? 'bg-green-500/10 text-green-400'
                    : 'text-neutral-400'
              )}
            >
              <span className="shrink-0 opacity-50">
                {log.timestamp.toLocaleTimeString([], {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span>{log.message}</span>
            </motion.div>
          ))}
          {isGenerating && !isSuccess && !error && (
            <div className="flex items-center gap-2 px-2 py-1 text-blue-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
