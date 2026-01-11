'use client';

import { cn } from '@onecoach/lib-design-system';
import { motion } from 'motion/react';
import { type CSSProperties, type ElementType, memo, useMemo } from 'react';

/**
 * Shimmer Component - AI Elements v6
 *
 * Animated text shimmer effect for loading states and AI thinking indicators.
 * Uses a gradient sweep animation for premium visual feedback.
 *
 * @see https://v6.ai-sdk.dev/elements/components/shimmer
 */

export type TextShimmerProps = {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

const ShimmerComponent = ({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) => {
  const dynamicSpread = useMemo(() => (children?.length ?? 0) * spread, [children, spread]);

  const style = useMemo(
    () =>
      ({
        '--spread': `${dynamicSpread}px`,
        backgroundImage:
          'var(--bg), linear-gradient(oklch(var(--neutral-500)), oklch(var(--neutral-500)))',
      }) as CSSProperties,
    [dynamicSpread]
  );

  // Create the appropriate motion component based on 'as' prop
  // Default to 'span' for inline text to avoid hydration issues with nested <p> tags
  const MotionComponent = Component === 'span' ? motion.span : motion.p;

  return (
    <MotionComponent
      animate={{ backgroundPosition: '0% center' }}
      className={cn(
        // Base
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent',
        '[background-repeat:no-repeat,padding-box]',
        // Premium gradient with primary color
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),oklch(var(--primary-500)),#0000_calc(50%+var(--spread)))]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      style={style}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: 'linear',
      }}
    >
      {children}
    </MotionComponent>
  );
};

export const Shimmer = memo(ShimmerComponent);

/**
 * SkeletonShimmer - Block-level shimmer for content placeholders
 */
export type SkeletonShimmerProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
};

export const SkeletonShimmer = memo(
  ({ className, width, height = '1rem' }: SkeletonShimmerProps) => (
    <motion.div
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      className={cn(
        'rounded-md',
        'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
        'dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800',
        'bg-[length:200%_100%]',
        className
      )}
      style={{ width, height }}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
        ease: 'linear',
      }}
    />
  )
);

SkeletonShimmer.displayName = 'SkeletonShimmer';
