/**
 * AmountDisplay Component
 *
 * Reusable component for displaying monetary amounts with optimized dark mode.
 * Handles positive/negative values with appropriate colors.
 */

'use client';

import { cn } from '@onecoach/lib-design-system';

export interface AmountDisplayProps {
  amount: number;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
};

export function AmountDisplay({
  amount,
  showSign = true,
  size = 'md',
  className,
}: AmountDisplayProps) {
  const isPositive = amount > 0;
  const colorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <p className={cn('font-bold', sizeClasses[size], colorClass, className)}>
      {showSign && isPositive ? '+' : ''}
      {amount}
    </p>
  );
}
