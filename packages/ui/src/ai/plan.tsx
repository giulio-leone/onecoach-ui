'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@giulio-leone/ui';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@giulio-leone/ui';
import { ChevronsUpDownIcon, Sparkles } from 'lucide-react';
import type { ComponentProps } from 'react';
import { createContext, useContext } from 'react';
import { SkeletonShimmer } from './shimmer';
import { motion } from 'framer-motion';

type PlanContextValue = {
  isStreaming: boolean;
};
const PlanContext = createContext<PlanContextValue | null>(null);
const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('Plan components must be used within Plan');
  }
  return context;
};

export type PlanProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  variant?: 'default' | 'glass' | 'ghost';
};

export const Plan = ({
  className,
  isStreaming = false,
  variant = 'default',
  children,
  ...props
}: PlanProps) => (
  <PlanContext.Provider value={{ isStreaming }}>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Collapsible asChild data-slot="plan" {...props}>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            // Default: Solid card
            variant === 'default' &&
              'rounded-xl border border-neutral-200 bg-white/80 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80',
            // Glass: Heavily blurred, meant to stand alone
            variant === 'glass' &&
              'rounded-xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-black/20',
            // Ghost: Transparent, meant to sit INSIDE another glass container
            variant === 'ghost' && 'border-0 bg-transparent shadow-none',

            isStreaming &&
              variant !== 'ghost' &&
              'border-blue-200/50 ring-1 ring-blue-500/30 dark:border-blue-500/30',
            className
          )}
        >
          {children}
        </div>
      </Collapsible>
    </motion.div>
  </PlanContext.Provider>
);

export type PlanHeaderProps = ComponentProps<typeof CardHeader>;
export const PlanHeader = ({ className, children, ...props }: PlanHeaderProps) => (
  <div className={cn('flex flex-row items-start justify-between p-6 pb-2', className)} {...props}>
    <div className="flex flex-col gap-1.5">{children}</div>
  </div>
);

export type PlanTitleProps = Omit<ComponentProps<typeof CardTitle>, 'children'> & {
  children: React.ReactNode;
};
export const PlanTitle = ({ children, className, ...props }: PlanTitleProps) => {
  const { isStreaming } = usePlan();
  return (
    <h3
      className={cn(
        'flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-white',
        className
      )}
      {...props}
    >
      {isStreaming && <Sparkles className="h-4 w-4 animate-pulse text-blue-500" />}
      {children}
    </h3>
  );
};

export type PlanDescriptionProps = Omit<ComponentProps<typeof CardDescription>, 'children'> & {
  children: React.ReactNode;
};
export const PlanDescription = ({ className, children, ...props }: PlanDescriptionProps) => {
  const { isStreaming } = usePlan();
  return (
    <div className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)} {...props}>
      {isStreaming ? <SkeletonShimmer className="w-full max-w-[300px]" /> : children}
    </div>
  );
};

/**
 * PlanAction
 * Container for actions in the header (e.g. toggle button)
 */
export const PlanAction = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('ml-auto flex items-center gap-2 pl-2', className)} {...props} />
);

export type PlanContentProps = ComponentProps<typeof CardContent>;
export const PlanContent = ({ className, ...props }: PlanContentProps) => (
  <CollapsibleContent asChild>
    <div className={cn('p-6 pt-2', className)} {...props} />
  </CollapsibleContent>
);

import { useTranslations } from 'next-intl';

export type PlanTriggerProps = ComponentProps<typeof CollapsibleTrigger>;
export const PlanTrigger = ({ className, ref, ...props }: PlanTriggerProps) => {
  const t = useTranslations();
  return (
    <CollapsibleTrigger asChild>
      <Button
        className={cn(
          'h-8 w-8 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300',
          className
        )}
        data-slot="plan-trigger"
        size="icon"
        variant="ghost"
        {...props}
      >
        <ChevronsUpDownIcon className="h-4 w-4" />
        <span className="sr-only">{t('common.plan.toggle_plan')}</span>
      </Button>
    </CollapsibleTrigger>
  );
};

export type PlanFooterProps = ComponentProps<'div'>;
export const PlanFooter = ({ className, ...props }: PlanFooterProps) => (
  <div
    className={cn(
      'border-t border-neutral-100 p-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400',
      className
    )}
    {...props}
  />
);
