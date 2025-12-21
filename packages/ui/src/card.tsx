/**
 * Card Component
 *
 * Mobile-first, responsive card with design tokens
 * Deep dark mode optimized
 */

import React from 'react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
  | 'default'
  | 'elevated'
  | 'bordered'
  | 'interactive'
  | 'glass'
  | 'glass-strong'
  | 'glass-premium'
  | 'glass-vibrant'
  | 'hover';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glassIntensity?: 'light' | 'medium' | 'heavy';
  gradient?: boolean;
  children: React.ReactNode;
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export const Card = ({
  variant = 'default',
  padding = 'md',
  glassIntensity = 'medium',
  gradient = false,
  children,
  className = '',
  ...props
}: CardProps) => {
  const glassIntensityClasses = {
    light:
      'bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md ring-1 ring-white/30 dark:ring-white/10',
    medium:
      'bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl ring-1 ring-white/40 dark:ring-white/15',
    heavy:
      'bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl ring-1 ring-white/50 dark:ring-white/20',
  };

  const variantStyles = {
    default: cn(
      darkModeClasses.card.base,
      'rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800'
    ),
    elevated: cn(
      darkModeClasses.card.elevated,
      'rounded-2xl shadow-xl shadow-neutral-900/5 dark:shadow-neutral-900/20 border border-neutral-100 dark:border-neutral-700'
    ),
    bordered: cn(
      darkModeClasses.card.base,
      'rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700'
    ),
    interactive: cn(
      darkModeClasses.card.interactive,
      'rounded-2xl border border-transparent hover:border-primary-500/20 dark:hover:border-primary-400/20 transition-all duration-300 cursor-pointer'
    ),
    glass: cn(
      glassIntensityClasses[glassIntensity],
      'rounded-2xl shadow-lg border border-white/20 dark:border-white/5 transition-all duration-300 text-neutral-900 dark:text-white'
    ),
    'glass-strong': cn(
      glassIntensityClasses.heavy,
      'rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 transition-all duration-300 text-neutral-900 dark:text-white'
    ),
    'glass-premium': cn(
      glassIntensityClasses.heavy,
      'rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 transition-all duration-700 text-neutral-900 dark:text-white',
      'relative overflow-hidden group/premium',
      'ring-1 ring-inset ring-white/20 dark:ring-white/5',
      'bg-gradient-to-br from-white/10 to-transparent dark:from-white/5'
    ),
    'glass-vibrant': cn(
      glassIntensityClasses.heavy,
      'rounded-[2.5rem] shadow-[0_20px_40px_rgba(59,130,246,0.25)] border border-blue-500/30 dark:border-blue-400/20 transition-all duration-500 text-neutral-900 dark:text-white',
      'bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10'
    ),
    hover: cn(
      darkModeClasses.card.interactive,
      'rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/20 transition-all duration-300'
    ),
  };

  return (
    <div className={cn(variantStyles[variant], paddingStyles[padding], className)} {...props}>
      {/* Gradient Background/Border Effect for Glass variants */}
      {(variant === 'glass' || variant === 'glass-strong') && gradient && (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10 rounded-2xl" />
          <div
            className="absolute inset-0 -z-20 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 rounded-2xl"
            aria-hidden="true"
          />
        </>
      )}
      {children}
    </div>
  );
};

// Structural subcomponents (shadcn-like API)
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      data-slot="card-header"
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
    data-slot="card-title"
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}
    data-slot="card-description"
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} data-slot="card-content" {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      data-slot="card-footer"
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// Simple action row aligned to the right, for headers/toolbars
const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('ml-auto flex items-center gap-2', className)}
      data-slot="card-action"
      {...props}
    />
  )
);
CardAction.displayName = 'CardAction';

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction };
