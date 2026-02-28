'use client';

import { memo, type ReactNode } from 'react';
import { SettingsIcon } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

interface ChatHeaderProps {
  credits: number;
  role: string | undefined;
  modelSelector?: ReactNode;
  className?: string;
}

export const ChatHeader = memo(function ChatHeader({
  credits: _credits,
  role: _role,
  modelSelector,
  className,
}: ChatHeaderProps) {
  void _credits;
  void _role;

  return (
    <div
      className={cn(
        'relative z-10 flex items-center justify-end border-b px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-3',
        'border-neutral-200/50 bg-white/50 dark:border-white/[0.06] dark:bg-neutral-900/50',
        className
      )}
    >
      {/* Right: Model Selector Slot */}
      {modelSelector && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <SettingsIcon className="size-4" />
          </div>
          {modelSelector}
        </div>
      )}
    </div>
  );
});
