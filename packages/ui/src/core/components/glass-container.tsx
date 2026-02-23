import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

export interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Complexity of the background gradients.
   * - 'minimal': Subtle static gradients.
   * - 'ambient': Slowly moving ambient blobs.
   * - 'intense': Stronger colors and more movement.
   */
  intensity?: 'minimal' | 'ambient' | 'intense';
}

/**
 * GlassContainer
 *
 * A premium full-screen or section container that provides the
 * ambient background context for Glassmorphism 2.0 components.
 */
export const GlassContainer = ({
  children,
  className,
  intensity = 'ambient',
  ...props
}: GlassContainerProps) => {
  return (
    <div
      className={cn('relative w-full overflow-hidden bg-neutral-50 dark:bg-[#050505]', className)}
      {...props}
    >
      {/* Ambient Background Layer */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Top Right Blob */}
        <div
          className={cn(
            'absolute -top-[10%] -right-[10%] rounded-full blur-[80px] dark:blur-[100px]',
            'bg-indigo-200/30 dark:bg-indigo-500/15',
            intensity === 'intense' && 'animate-pulse-slow',
            'h-[400px] w-[400px] md:h-[600px] md:w-[600px]'
          )}
        />

        {/* Bottom Left Blob */}
        <div
          className={cn(
            'absolute -bottom-[10%] -left-[10%] rounded-full blur-[80px] dark:blur-[100px]',
            'bg-blue-200/30 dark:bg-blue-500/15',
            intensity === 'intense' && 'animate-pulse-slow delay-700',
            'h-[400px] w-[400px] md:h-[600px] md:w-[600px]'
          )}
        />

        {/* Center Accent (visible mostly in intense mode) */}
        {intensity !== 'minimal' && (
          <div
            className={cn(
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
              'bg-purple-200/30 blur-[100px] dark:bg-purple-500/15',
              'h-[300px] w-[300px] md:h-[500px] md:w-[500px]'
            )}
          />
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};
