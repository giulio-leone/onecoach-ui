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
  | 'glass'
  | 'glass-strong'
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
      'bg-gradient-to-br from-white/40 to-white/10 dark:from-neutral-900/40 dark:to-neutral-900/10 backdrop-blur-md ring-1 ring-white/20 dark:ring-white/10',
    medium:
      'bg-gradient-to-br from-white/50 to-white/20 dark:from-neutral-900/50 dark:to-neutral-900/20 backdrop-blur-xl ring-1 ring-white/20 dark:ring-white/10',
    heavy:
      'bg-gradient-to-br from-white/70 to-white/40 dark:from-neutral-900/70 dark:to-neutral-900/40 backdrop-blur-2xl ring-1 ring-white/20 dark:ring-white/10',
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
      'rounded-2xl shadow-lg shadow-black/10 transition-all duration-300 text-neutral-900 dark:text-white',
      gradient && 'border-transparent'
    ),
    'glass-strong': cn(
      glassIntensityClasses.heavy,
      'rounded-2xl shadow-xl shadow-black/20 transition-all duration-300 text-neutral-900 dark:text-white'
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
