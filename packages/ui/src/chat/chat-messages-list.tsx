'use client';

import { memo, type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

interface ChatMessagesListProps {
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyState?: ReactNode;
}

export const ChatMessagesList = memo(function ChatMessagesList({
  children,
  className,
  isEmpty,
  emptyState,
}: ChatMessagesListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [children]);

  return (
    <div className={cn('relative flex flex-1 flex-col overflow-hidden', className)}>
      <div className="scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 flex-1 overflow-y-auto">
        <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
          {isEmpty ? (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center">
              {emptyState}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {children}
              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
