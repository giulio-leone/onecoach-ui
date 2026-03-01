'use client';
import { cn } from '@giulio-leone/lib-design-system';
import { Button, ScrollArea, ScrollBar } from '@giulio-leone/ui';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
/**
 * Suggestion Component - AI Elements v6
 *
 * Clickable suggestion pills for quick actions with glassmorphism styling,
 * horizontal scrolling, and hover animations.
 *
 * @see https://v6.ai-sdk.dev/elements/components/suggestion
 */
export type SuggestionsProps = ComponentProps<typeof ScrollArea> & {
  label?: ReactNode;
};
export const Suggestions = ({ className, children, label, ...props }: SuggestionsProps) => (
  <div className="w-full space-y-3">
    {label && (
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
        <SparklesIcon className="text-primary-500 size-4" />
        <span>{label}</span>
      </div>
    )}
    <ScrollArea className="w-full overflow-x-auto pb-2 whitespace-nowrap" {...props}>
      <div className={cn('flex w-max flex-nowrap items-center gap-2', className)}>{children}</div>
      <ScrollBar className="mt-1 h-1.5" orientation="horizontal" />
    </ScrollArea>
  </div>
);
export type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
  icon?: ReactNode;
  showArrow?: boolean;
};
export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = 'outline',
  size = 'sm',
  icon,
  showArrow = false,
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };
  return (
    <Button
      className={cn(
        // Base
        'group cursor-pointer gap-2 rounded-full px-4',
        // Glassmorphism
        'bg-white/70 dark:bg-white/[0.06]',
        'backdrop-blur-sm',
        'border border-neutral-200/50 dark:border-white/[0.08]',
        // Text
        'text-neutral-700 dark:text-neutral-300',
        // Hover
        'hover:bg-primary-50 hover:dark:bg-primary-900/30',
        'hover:border-primary-300 hover:dark:border-primary-700',
        'hover:text-primary-700 hover:dark:text-primary-300',
        'hover:shadow-primary-500/10 hover:shadow-md',
        // Active
        'active:scale-[0.98]',
        // Transition
        'transition-all duration-200',
        className
      )}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {icon}
      <span>{children || suggestion}</span>
      {showArrow && (
        <ArrowRightIcon
          className={cn(
            'size-3.5 text-neutral-400',
            '-translate-x-1 opacity-0 transition-all',
            'group-hover:translate-x-0 group-hover:opacity-100',
            'group-hover:text-primary-500'
          )}
        />
      )}
    </Button>
  );
};
