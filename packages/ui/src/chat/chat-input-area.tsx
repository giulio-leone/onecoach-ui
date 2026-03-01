'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

interface ChatInputAreaProps {
  children: ReactNode;
  className?: string;
}

export const ChatInputArea = memo(function ChatInputArea({
  children,
  className,
}: ChatInputAreaProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 mx-auto w-full max-w-3xl shrink-0 px-3 pt-2 pb-4 sm:px-4 sm:pb-6',
        className
      )}
    >
      <div className="group focus-within:shadow-primary-500/20 relative rounded-3xl bg-white/70 p-1 shadow-lg backdrop-blur-xl transition-all duration-300 focus-within:shadow-2xl hover:shadow-xl dark:bg-white/[0.06] dark:shadow-black/50">
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-white/10 p-[1px] opacity-100 dark:from-white/10 dark:to-white/5"
          style={{ zIndex: -1 }}
        />
        {children}
      </div>
    </div>
  );
});
