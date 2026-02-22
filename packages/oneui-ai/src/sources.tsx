'use client';

import NextImage from 'next/image';
import { cn } from '@giulio-leone/lib-design-system';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@giulio-leone/ui';
import { BookOpenIcon, ChevronDownIcon, ExternalLinkIcon, GlobeIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

/**
 * Sources Component - AI Elements v6
 *
 * Displays sources/citations used by AI with glassmorphism styling,
 * collapsible content, and external link indicators.
 *
 * @see https://v6.ai-sdk.dev/elements/components/sources
 */

export type SourcesProps = ComponentProps<'div'>;

export const Sources = ({ className, ref, ...props }: SourcesProps) => (
  <Collapsible
    ref={ref as any}
    className={cn(
      // Base
      'not-prose mb-4 overflow-hidden rounded-xl',
      // Glassmorphism
      'bg-gradient-to-br from-sky-500/5 to-blue-500/5',
      'dark:from-sky-500/10 dark:to-blue-500/10',
      'backdrop-blur-sm',
      'border border-sky-200/30 dark:border-sky-500/20',
      className
    )}
    {...props}
  />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = ({ className, count, children, ...props }: SourcesTriggerProps) => (
  <CollapsibleTrigger
    className={cn(
      // Layout
      'group flex w-full items-center gap-3 px-4 py-3',
      // Typography
      'text-sm font-medium',
      // Colors
      'text-sky-700 dark:text-sky-300',
      // Hover
      'hover:bg-sky-500/5 dark:hover:bg-sky-500/10',
      // Focus
      'focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:outline-none',
      // Transition
      'transition-all duration-200',
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        <BookOpenIcon className="size-4 text-sky-500" />
        <span className="flex-1 text-left">
          {count === 1 ? 'Utilizzata 1 fonte' : `Utilizzate ${count} fonti`}
        </span>
        <ChevronDownIcon
          className={cn(
            'size-4 text-sky-500 transition-transform duration-300',
            'group-data-[state=open]:rotate-180'
          )}
        />
      </>
    )}
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({ className, ...props }: SourcesContentProps) => (
  <CollapsibleContent
    className={cn(
      // Layout
      'px-4 pt-0 pb-4',
      // Animation
      'data-[state=closed]:animate-out data-[state=open]:animate-in',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
      'outline-none',
      className
    )}
    {...props}
  >
    <div className="flex flex-col gap-2 border-t border-sky-200/30 pt-2 dark:border-sky-500/20">
      {props.children}
    </div>
  </CollapsibleContent>
);

export type SourceProps = ComponentProps<'a'> & {
  favicon?: string;
};

export const Source = ({ href, title, favicon, children, className, ...props }: SourceProps) => (
  <a
    className={cn(
      // Layout
      'group flex items-center gap-3 rounded-lg px-3 py-2',
      // Hover
      'hover:bg-sky-500/10 dark:hover:bg-sky-500/15',
      // Focus
      'focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:outline-none',
      // Transition
      'transition-all duration-200',
      className
    )}
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children ?? (
      <>
        {favicon ? (
          <div className="relative size-4 shrink-0">
            <NextImage alt="" className="rounded-sm" fill src={favicon} unoptimized />
          </div>
        ) : (
          <GlobeIcon className="size-4 text-sky-500" />
        )}
        <span className="flex-1 truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {title}
        </span>
        <ExternalLinkIcon
          className={cn(
            'size-3.5 text-neutral-400',
            'opacity-0 transition-opacity group-hover:opacity-100'
          )}
        />
      </>
    )}
  </a>
);
