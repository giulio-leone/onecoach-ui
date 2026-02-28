/**
 * TransactionItem Component
 *
 * Reusable transaction/activity list item with optimized dark mode.
 * Used for credit history, activity logs, etc.
 */

'use client';

import { cn } from '@giulio-leone/lib-design-system';
import { IconBadge } from './icon-badge';
import { AmountDisplay } from './amount-display';
import type { LucideIcon } from 'lucide-react';

export interface TransactionItemProps {
  icon: LucideIcon;
  iconVariant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple';
  title: string;
  subtitle?: string;
  amount?: number;
  balance?: number | string;
  showAmount?: boolean;
  showBalance?: boolean;
  className?: string;
  onClick?: () => void;
}

export function TransactionItem({
  icon,
  iconVariant,
  title,
  subtitle,
  amount,
  balance,
  showAmount = true,
  showBalance = true,
  className,
  onClick,
}: TransactionItemProps) {
  // Auto-detect variant from amount if not provided
  const variant =
    iconVariant || (amount !== undefined ? (amount > 0 ? 'success' : 'error') : 'neutral');

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 transition-colors sm:gap-4 sm:p-4',
        'hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Icon */}
      <IconBadge icon={icon} variant={variant} size="md" />

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium break-words text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs break-words text-neutral-500 sm:text-sm dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Amount and Balance */}
      {(showAmount || showBalance) && (
        <div className="min-w-0 flex-shrink-0 text-right">
          {showAmount && amount !== undefined && <AmountDisplay amount={amount} size="md" />}
          {showBalance && balance !== undefined && (
            <p className="mt-0.5 text-xs break-words text-neutral-500 dark:text-neutral-400">
              Saldo: {balance}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
