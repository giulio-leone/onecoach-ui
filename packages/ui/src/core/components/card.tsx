/**
 * Card Component
 *
 * Mobile-first, responsive card with design tokens
 * Premium dark mode optimized
 */

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';

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
    light: 'bg-white/60 dark:bg-neutral-900/95 backdrop-blur-md',
    medium: 'bg-white/70 dark:bg-neutral-900/95 backdrop-blur-xl',
    heavy: 'bg-white/80 dark:bg-neutral-900 backdrop-blur-2xl',
  };

  const variantStyles = {
    default: cn(
      'bg-background-base',
      'rounded-2xl shadow-sm dark:shadow-lg dark:shadow-black/20',
      'border border-neutral-200/60 dark:border-neutral-800/60'
    ),
    elevated: cn(
      'bg-background-elevated',
      'rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30',
      'border border-neutral-100 dark:border-neutral-800/50'
    ),
    bordered: cn(
      'bg-background-base',
      'rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/20',
      'border border-neutral-200 dark:border-neutral-800/60'
    ),
    interactive: cn(
      'bg-background-base',
      'rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60',
      'hover:border-blue-400/50 dark:hover:border-blue-500/40',
      'hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/30',
      'transition-all duration-300 cursor-pointer'
    ),
    glass: cn(
      glassIntensityClasses[glassIntensity],
      'rounded-2xl shadow-lg dark:shadow-xl dark:shadow-black/25',
      'border border-neutral-200/40 dark:border-neutral-700/40',
      'transition-all duration-300 text-neutral-900 dark:text-white'
    ),
    'glass-strong': cn(
      glassIntensityClasses.heavy,
      'rounded-3xl shadow-2xl dark:shadow-2xl dark:shadow-black/30',
      'border border-neutral-200/50 dark:border-neutral-700/50',
      'transition-all duration-300 text-neutral-900 dark:text-white'
    ),
    'glass-premium': cn(
      glassIntensityClasses.heavy,
      'rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]',
      'border border-neutral-200/40 dark:border-neutral-700/30',
      'transition-all duration-700 text-neutral-900 dark:text-white',
      'relative overflow-hidden group/premium'
    ),
    'glass-vibrant': cn(
      glassIntensityClasses.heavy,
      'rounded-[2rem] shadow-[0_20px_40px_rgba(59,130,246,0.15)] dark:shadow-[0_20px_40px_rgba(59,130,246,0.1)]',
      'border border-blue-400/30 dark:border-blue-500/20',
      'transition-all duration-500 text-neutral-900 dark:text-white',
      'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5'
    ),
    hover: cn(
      'bg-background-base',
      'rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60',
      'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/30',
      'hover:border-blue-400/30 dark:hover:border-blue-500/30',
      'transition-all duration-300'
    ),
  };

  return (
    <div className={cn(variantStyles[variant], paddingStyles[padding], className)} {...props}>
      {/* Gradient Background/Border Effect for Glass variants */}
      {(variant === 'glass' || variant === 'glass-strong') && gradient && (
        <>
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
          <div
            className="absolute inset-0 -z-20 rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
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
