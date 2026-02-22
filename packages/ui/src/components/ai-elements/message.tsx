/**
 * Message Component
 *
 * Bolla messaggio con supporto completo per AI SDK v6 parts[].
 * Renderizza text, tool-invocation, reasoning, source-url.
 */

'use client';

import { useState, forwardRef, type ReactNode, type ComponentProps } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check, User } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ============================================================================
// Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

// ============================================================================
// Message Container
// ============================================================================

export interface MessageProps extends ComponentProps<typeof motion.div> {
  /** Ruolo: user o assistant */
  from: MessageRole;
  children: ReactNode;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ from, className, children, ...props }, ref) => {
    const isUser = from === 'user';

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'group flex w-full gap-4',
          isUser ? 'flex-row-reverse' : 'flex-row',
          isUser ? 'is-user' : 'is-assistant',
          className
        )}
        {...props}
      >
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          {isUser ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-indigo-600 shadow-sm dark:border-white/10 dark:bg-indigo-900/50 dark:text-indigo-300">
              <User size={18} />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Bot size={20} />
            </div>
          )}
        </div>

        {/* Content wrapper */}
        <div className={cn('relative max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
          {children}
        </div>
      </motion.div>
    );
  }
);
Message.displayName = 'Message';

// ============================================================================
// Message Content (bubble)
// ============================================================================

export interface MessageContentProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden px-6 py-4 text-sm shadow-sm backdrop-blur-md transition-all',
        // User styling
        'group-[.is-user]:rounded-2xl group-[.is-user]:rounded-tr-sm',
        'group-[.is-user]:bg-indigo-600 group-[.is-user]:text-white',
        'group-[.is-user]:shadow-indigo-500/20',
        // Assistant styling
        'group-[.is-assistant]:rounded-2xl group-[.is-assistant]:rounded-tl-sm',
        'group-[.is-assistant]:bg-white/70 group-[.is-assistant]:text-neutral-900',
        'group-[.is-assistant]:ring-1 group-[.is-assistant]:ring-neutral-200/50',
        'dark:group-[.is-assistant]:bg-neutral-800/60 dark:group-[.is-assistant]:text-neutral-100',
        'dark:group-[.is-assistant]:ring-white/10',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
);
MessageContent.displayName = 'MessageContent';

// ============================================================================
// Message Response (markdown text)
// ============================================================================

export interface MessageResponseProps extends ComponentProps<'div'> {
  children: string;
}

export const MessageResponse = forwardRef<HTMLDivElement, MessageResponseProps>(
  ({ className, children, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Markdown Content */}
        <div
          className={cn(
            'prose prose-sm max-w-none leading-relaxed break-words',
            'group-[.is-user]:prose-invert',
            'group-[.is-assistant]:prose-neutral dark:group-[.is-assistant]:prose-invert'
          )}
        >
          <ReactMarkdown
            components={{
              code({ className, children, ref: _ref, node: _node, ...codeProps }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;

                if (isInline) {
                  return (
                    <code
                      className={cn(
                        'rounded px-1.5 py-0.5 font-mono text-xs font-medium',
                        'group-[.is-user]:bg-white/20 group-[.is-user]:text-white',
                        'group-[.is-assistant]:bg-neutral-100 group-[.is-assistant]:text-indigo-600',
                        'dark:group-[.is-assistant]:bg-white/10 dark:group-[.is-assistant]:text-indigo-300'
                      )}
                      {...codeProps}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative my-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-white/10">
                    <div className="flex items-center justify-between bg-neutral-100 px-3 py-2 text-[10px] text-neutral-500 dark:bg-[#121418] dark:text-neutral-400">
                      <span className="font-mono font-medium uppercase">{match[1]}</span>
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
                      </div>
                    </div>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              },
              a: ({ ref: _ref, node: _node, ...linkProps }) => (
                <a
                  {...linkProps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'font-medium underline underline-offset-2 transition-colors',
                    'group-[.is-user]:text-white group-[.is-user]:hover:text-white/80',
                    'group-[.is-assistant]:text-indigo-600 group-[.is-assistant]:hover:text-indigo-500',
                    'dark:group-[.is-assistant]:text-indigo-400 dark:group-[.is-assistant]:hover:text-indigo-300'
                  )}
                />
              ),
              ul: ({ ref: _ref, node: _node, ...ulProps }) => <ul className="my-2 list-disc space-y-1 pl-4" {...ulProps} />,
              ol: ({ ref: _ref, node: _node, ...olProps }) => (
                <ol className="my-2 list-decimal space-y-1 pl-4" {...olProps} />
              ),
            }}
          >
            {children}
          </ReactMarkdown>
        </div>

        {/* Copy Action */}
        <div className="mt-2 flex items-center gap-2 px-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
              'group-[.is-user]:bg-white/20 group-[.is-user]:text-white group-[.is-user]:hover:bg-white/30',
              'group-[.is-assistant]:bg-neutral-100 group-[.is-assistant]:text-neutral-500',
              'group-[.is-assistant]:hover:bg-neutral-200 group-[.is-assistant]:hover:text-neutral-900',
              'dark:group-[.is-assistant]:bg-white/5 dark:group-[.is-assistant]:text-neutral-400',
              'dark:group-[.is-assistant]:hover:bg-white/10 dark:group-[.is-assistant]:hover:text-white'
            )}
          >
            {copied ? (
              <Check
                size={12}
                className="group-[.is-assistant]:text-emerald-500 group-[.is-user]:text-white"
              />
            ) : (
              <Copy size={12} />
            )}
            {copied ? 'Copiato' : 'Copia'}
          </button>
        </div>
      </div>
    );
  }
);
MessageResponse.displayName = 'MessageResponse';

// ============================================================================
// Message Actions (per assistant)
// ============================================================================

export interface MessageActionsProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
MessageActions.displayName = 'MessageActions';

// ============================================================================
// Message Action Button
// ============================================================================

export interface MessageActionProps extends ComponentProps<'button'> {
  label?: string;
  children: ReactNode;
}

export const MessageAction = forwardRef<HTMLButtonElement, MessageActionProps>(
  ({ label, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
        'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900',
        'dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white',
        className
      )}
      title={label}
      {...props}
    >
      {children}
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
);
MessageAction.displayName = 'MessageAction';
