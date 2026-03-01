/**
 * Conversation Component
 *
 * Container per la lista messaggi con scroll automatico.
 * Ispirato ad AI Elements Conversation.
 */

'use client';

import React, { useRef, useEffect, forwardRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

// ============================================================================
// Conversation Container
// ============================================================================

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative flex min-h-0 flex-1 flex-col overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
);
Conversation.displayName = 'Conversation';

// ============================================================================
// Conversation Content (scrollable area)
// ============================================================================

export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ConversationContent = forwardRef<HTMLDivElement, ConversationContentProps>(
  ({ className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new content
    useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [children]);

    return (
      <div
        ref={ref || innerRef}
        className={cn(
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200',
          'dark:scrollbar-thumb-white/10',
          'flex-1 overflow-y-auto px-4 pt-6 pb-2 lg:px-8',
          className
        )}
        {...props}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <AnimatePresence mode="popLayout">{children}</AnimatePresence>
          <div ref={endRef} className="h-4" aria-hidden />
        </div>
      </div>
    );
  }
);
ConversationContent.displayName = 'ConversationContent';

// ============================================================================
// Conversation Empty State
// ============================================================================

export interface ConversationEmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function ConversationEmptyState({
  icon,
  title = 'Come posso aiutarti oggi?',
  description = 'Sono il tuo AI Coach personale. Chiedimi piani di allenamento, consigli nutrizionali o analizza i tuoi progressi.',
  className,
}: ConversationEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-20 text-center', className)}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-secondary-600 shadow-xl shadow-indigo-500/20">
        {icon || <MessageSquare className="h-10 w-10 text-white" />}
      </div>
      <h2 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>
      <p className="max-w-md text-neutral-500 dark:text-neutral-400">{description}</p>
    </motion.div>
  );
}

// ============================================================================
// Conversation Scroll Button
// ============================================================================

export interface ConversationScrollButtonProps {
  onClick?: () => void;
  show?: boolean;
  className?: string;
}

export function ConversationScrollButton({
  onClick,
  show = false,
  className,
}: ConversationScrollButtonProps) {
  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      onClick={onClick}
      className={cn(
        'absolute bottom-20 left-1/2 -translate-x-1/2',
        'flex items-center gap-2 rounded-full',
        'bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm',
        'dark:bg-white/[0.08]',
        'text-sm font-medium text-neutral-700 dark:text-neutral-200',
        'hover:bg-white dark:hover:bg-white/[0.08]',
        'transition-colors',
        className
      )}
    >
      <ChevronDown className="h-4 w-4" />
      Nuovi messaggi
    </motion.button>
  );
}
