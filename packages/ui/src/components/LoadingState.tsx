/**
 * LoadingState Component
 *
 * A premium, highly visual loading experience.
 * Replaces generic spinners with a modern "Breathing Core" animation.
 * Optimized for Dark Mode & Glassmorphism.
 */

'use client';

import { cn } from '@onecoach/lib-design-system';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingState({ message, size = 'md', className }: LoadingStateProps) {
  // Size scaling for the orb
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
    xl: 'h-48 w-48',
  };

  return (
    <div
      className={cn(
        'animate-in fade-in flex flex-col items-center justify-center gap-8 p-8 duration-700',
        className
      )}
    >
      {/* The "Incredible" Graphic Orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring (Slow Spin) */}
        <div
          className={cn(
            'animate-spin-slow absolute rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 blur-2xl',
            sizeClasses[size]
          )}
        />

        {/* Middle Pulse Ring */}
        <div
          className={cn(
            'animate-ping-slow absolute rounded-full border border-white/10 opacity-50 shadow-[0_0_30px_rgba(99,102,241,0.2)]',
            sizeClasses[size]
          )}
        />

        {/* Inner Core (Breathing) */}
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-neutral-900 to-black shadow-2xl shadow-indigo-500/20 backdrop-blur-xl',
            sizeClasses[size]
          )}
        >
          {/* Core Light Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-50" />

          {/* Central Energy Dot */}
          <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" />

          {/* Orbiting Particle */}
          <div className="animate-spin-medium absolute inset-0">
            <div className="mt-2 ml-2 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </div>
        </div>
      </div>

      {/* Minimalist Text (Optional & Subtle) */}
      {message && (
        <div className="flex flex-col items-center gap-2">
          <span className="animate-pulse text-sm font-medium tracking-widest text-neutral-400 uppercase">
            {message}
          </span>
          {/* Progress Bar Line */}
          <div className="h-0.5 w-24 overflow-hidden rounded-full bg-neutral-800">
            <div className="animate-progress-indeterminate h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>
      )}
    </div>
  );
}
