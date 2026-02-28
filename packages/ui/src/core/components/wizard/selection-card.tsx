/**
 * SelectionCard Component - Web
 *
 * Web version using HTML elements instead of React Native components
 */

'use client';

import React from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from '../card';

export interface SelectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  image?: string;
  className?: string;
  badge?: string;
  contentClassName?: string;
  compact?: boolean;
  disabled?: boolean;
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
  disabled,
  onClick,
  onPress,
  ...props
}: SelectionCardProps) {
  // Support both onClick (web) and onPress (for compatibility)
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (disabled) return;

    if (onClick) {
      onClick(e as React.MouseEvent<HTMLDivElement>);
    } else if (onPress) {
      onPress();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const role = props.role || 'button';
  const ariaProps =
    role === 'radio' || role === 'checkbox'
      ? { 'aria-checked': selected }
      : { 'aria-pressed': selected };

  return (
    <div
      role={role}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      {...ariaProps}
      className={cn(
        'w-full cursor-pointer touch-pan-y rounded-xl text-left transition-all duration-300 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected ? 'scale-[1.02]' : 'hover:scale-[1.01]',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
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
                'ring-2 ring-primary-500/60 dark:ring-primary-500/80',
                compact
                  ? 'shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  : 'scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.25)]'
              )
            : 'ring-1 ring-white/15 hover:bg-white/50 dark:bg-neutral-900/40 dark:ring-white/10 dark:hover:bg-white/5'
        )}
      >
        {/* Selection Glow Effect - More subtle */}
        {selected && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-400/5" />
        )}
        {image && (
          <div className={cn('relative w-full overflow-hidden', compact ? 'h-16 lg:h-20' : 'h-32')}>
            <img src={image} alt={title} className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-900/90" />
          </div>
        )}

        <div className={cn(compact ? 'p-2' : 'p-4 sm:p-5', contentClassName)}>
          <div
            className={cn(
              'flex flex-row justify-between gap-2',
              description ? 'items-start' : 'items-center'
            )}
          >
            <div className={cn('flex-1 overflow-hidden', compact && 'flex items-center gap-3')}>
              {icon && (
                <div
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center transition-all',
                    compact ? 'rounded-md p-1' : 'mb-2.5 self-start rounded-xl p-2',
                    selected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                      : 'bg-neutral-100/80 text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400'
                  )}
                >
                  {React.isValidElement(icon)
                    ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                        className: cn(
                          (icon as React.ReactElement<{ className?: string }>).props.className,
                          compact ? 'h-4 w-4' : 'h-4 w-4'
                        ),
                      })
                    : icon}
                </div>
              )}

              <div className={cn('flex min-w-0 flex-col', compact && 'flex-1')}>
                <div className="flex flex-row items-center gap-1.5">
                  <span
                    className={cn(
                      'truncate leading-tight font-semibold transition-colors',
                      compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base',
                      selected
                        ? 'text-primary-700 dark:text-primary-100'
                        : 'text-neutral-800 dark:text-neutral-100'
                    )}
                  >
                    {title}
                  </span>
                  {badge && (
                    <span className="shrink-0 rounded-full bg-primary-100/80 px-1.5 py-0.5 text-[7px] font-bold text-primary-700 uppercase dark:bg-primary-900/50 dark:text-primary-200">
                      {badge}
                    </span>
                  )}
                </div>

                {description && (
                  <p
                    className={cn(
                      'line-clamp-2 leading-snug',
                      compact
                        ? 'text-[10px] text-neutral-500 sm:text-[11px] dark:text-neutral-400'
                        : 'mt-1 text-[11px] text-neutral-500 sm:text-xs dark:text-neutral-400',
                      selected && 'text-primary-600/80 dark:text-primary-200/70'
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                compact ? 'h-3.5 w-3.5' : 'h-5 w-5',
                selected
                  ? 'border-primary-500 bg-primary-500 dark:border-primary-400 dark:bg-primary-400'
                  : 'border-neutral-300 bg-transparent dark:border-white/[0.1]'
              )}
            >
              {selected && (
                <div className={cn('rounded-full bg-white', compact ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
