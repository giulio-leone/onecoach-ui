/**
 * SelectionCard Component - Web
 *
 * Web version using HTML elements instead of React Native components
 */

'use client';

import React from 'react';
import { cn } from '@onecoach/lib-design-system';
import { Card } from './card';

export interface SelectionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  image?: string;
  className?: string;
  badge?: string;
  contentClassName?: string;
  compact?: boolean;
  // Support onPress for compatibility with React Native API
  onPress?: () => void;
}

export function SelectionCard({
  title,
  description,
  selected,
  icon,
  image,
  className,
  badge,
  contentClassName,
  compact,
  onClick,
  onPress,
  ...props
}: SelectionCardProps) {
  // Support both onClick (web) and onPress (for compatibility)
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full text-left transition-all duration-300',
        selected ? 'scale-[1.02]' : 'hover:scale-[1.01]',
        className
      )}
      {...props}
    >
      <Card
        variant={selected ? 'glass-vibrant' : 'glass-premium'}
        glassIntensity={selected ? 'heavy' : 'light'}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          compact && 'rounded-xl',
          selected 
            ? cn(
                'ring-2 ring-blue-500/60 dark:ring-blue-400/50',
                compact ? 'shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'shadow-[0_0_30px_rgba(59,130,246,0.25)] scale-[1.01]'
              )
            : 'hover:bg-white/50 dark:hover:bg-neutral-800/50 ring-1 ring-white/15 dark:ring-white/5'
        )}
      >
        {/* Selection Glow Effect - More subtle */}
        {selected && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-400/5" />
        )}
        {image && (
          <div className={cn('relative w-full overflow-hidden', compact ? 'h-16 lg:h-20' : 'h-32')}>
            <img src={image} alt={title} className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-900/90" />
          </div>
        )}

        <div className={cn(compact ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5', contentClassName)}>
          <div
            className={cn(
              'flex flex-row justify-between gap-2',
              description ? 'items-start' : 'items-center'
            )}
          >
            <div className="flex-1 overflow-hidden">
              {icon && (
                <div
                  className={cn(
                    'transition-all self-start inline-flex items-center justify-center',
                    compact ? 'mb-1 p-1 rounded-lg' : 'mb-2.5 p-2 rounded-xl',
                    selected
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                      : 'bg-neutral-100/80 text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400'
                  )}
                >
                  {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
                    className: cn((icon as React.ReactElement<any>).props.className, compact ? 'h-3 w-3' : 'h-4 w-4') 
                  }) : icon}
                </div>
              )}

              <div className="flex flex-row items-center gap-1.5">
                <span
                  className={cn(
                    'font-semibold transition-colors truncate leading-tight',
                    compact ? 'text-[11px] sm:text-xs' : 'text-sm sm:text-base',
                    selected
                      ? 'text-blue-700 dark:text-blue-100'
                      : 'text-neutral-800 dark:text-neutral-100'
                  )}
                >
                  {title}
                </span>
                {badge && (
                  <span className="shrink-0 rounded-full bg-blue-100/80 px-1.5 py-0.5 text-[7px] font-bold text-blue-700 uppercase dark:bg-blue-900/50 dark:text-blue-200">
                    {badge}
                  </span>
                )}
              </div>

              {description && (
                <p
                  className={cn(
                    'leading-snug',
                    compact ? 'mt-0.5 text-[9px] sm:text-[10px]' : 'mt-1 text-[11px] sm:text-xs',
                    selected
                      ? 'text-blue-600/80 dark:text-blue-200/70'
                      : 'text-neutral-500 dark:text-neutral-400'
                  )}
                >
                  {description}
                </p>
              )}
            </div>

            <div
              className={cn(
                'shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-200',
                compact ? 'h-3.5 w-3.5' : 'h-5 w-5',
                selected
                  ? 'bg-blue-500 border-blue-500 dark:bg-blue-400 dark:border-blue-400'
                  : 'bg-transparent border-neutral-300 dark:border-neutral-600'
              )}
            >
              {selected && <div className={cn('rounded-full bg-white', compact ? 'h-1.5 w-1.5' : 'h-2 w-2')} />}
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}
