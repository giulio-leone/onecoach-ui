'use client';

import { type ReactNode } from 'react';
import { cn } from '@giulio-leone/lib-design-system';

interface ChatLayoutWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ChatLayoutWrapper({ children, className }: ChatLayoutWrapperProps) {
  return (
    <div
      className={cn(
        'relative flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden',
        className
      )}
    >
      {/* Background - Premium gradient mesh (Nano Banana Pro Style) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Light mode - Smooth, clean look */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.08),_transparent_60%)] dark:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.05),_transparent_60%)] dark:hidden" />

        {/* Dark mode - Deep, rich, organic gradients */}
        <div className="absolute inset-0 hidden bg-[#0a0a0c] dark:block" />
        {/* Primary Glow (Right Top) */}
        <div className="absolute -top-40 -right-40 hidden h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[128px] dark:block" />
        {/* Secondary Glow (Left Bottom) */}
        <div className="absolute -bottom-40 -left-40 hidden h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px] dark:block" />
        {/* Center Accent */}
        <div className="absolute top-1/2 left-1/2 hidden h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[96px] dark:block" />
      </div>

      {children}
    </div>
  );
}
