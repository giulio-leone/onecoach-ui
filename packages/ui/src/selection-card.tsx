/**
 * SelectionCard Component - Web
 *
 * Web version using HTML elements instead of React Native components
 */

'use client';

import React from 'react';
import { cn } from '@onecoach/lib-design-system';
import { GlassCard } from './glass-card';

export interface SelectionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  selected?: boolean;
  icon?: React.ReactNode;
  image?: string;
  className?: string;
  badge?: string;
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
      <GlassCard
        intensity={selected ? 'heavy' : 'light'}
        variant={selected ? 'active' : 'default'}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          selected ? 'shadow-md' : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'
        )}
      >
        {image && (
          <div className="relative h-32 w-full overflow-hidden">
            <img src={image} alt={title} className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-900/90" />
          </div>
        )}

        <div className="p-5">
          <div className="flex flex-row items-start justify-between gap-3">
            <div className="flex-1">
              {icon && (
                <div
                  className={cn(
                    'mb-3 self-start rounded-xl p-2.5 transition-colors',
                    selected
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  )}
                >
                  {icon}
                </div>
              )}

              <div className="flex flex-row items-center gap-2">
                <span
                  className={cn(
                    'text-lg font-bold',
                    selected
                      ? 'text-blue-700 dark:text-blue-200'
                      : 'text-neutral-900 dark:text-white'
                  )}
                >
                  {title}
                </span>
                {badge && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase dark:bg-blue-900/40 dark:text-blue-200">
                    {badge}
                  </span>
                )}
              </div>

              {description && (
                <p
                  className={cn(
                    'mt-1.5 text-sm leading-relaxed',
                    selected
                      ? 'text-blue-600/90 dark:text-blue-200/90'
                      : 'text-neutral-500 dark:text-neutral-300'
                  )}
                >
                  {description}
                </p>
              )}
            </div>

            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border transition-all',
                selected
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-neutral-300 bg-transparent dark:border-neutral-600'
              )}
            >
              {selected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>
      </GlassCard>
    </button>
  );
}
