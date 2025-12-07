/**
 * TransactionItem Component
 *
 * Reusable transaction/activity list item with optimized dark mode.
 * Used for credit history, activity logs, etc.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@onecoach/lib-design-system';
import { IconBadge } from './icon-badge';
import { AmountDisplay } from './amount-display';
export function TransactionItem({ icon, iconVariant, title, subtitle, amount, balance, showAmount = true, showBalance = true, className, onClick, }) {
    // Auto-detect variant from amount if not provided
    const variant = iconVariant || (amount !== undefined ? (amount > 0 ? 'success' : 'error') : 'neutral');
    return (_jsxs("div", { className: cn('flex items-center gap-3 p-3 transition-colors sm:gap-4 sm:p-4', 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50', onClick && 'cursor-pointer', className), onClick: onClick, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onKeyDown: onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }
            : undefined, children: [_jsx(IconBadge, { icon: icon, variant: variant, size: "md" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate font-medium break-words text-neutral-900 dark:text-neutral-100", children: title }), subtitle && (_jsx("p", { className: "mt-0.5 text-xs break-words text-neutral-500 sm:text-sm dark:text-neutral-400", children: subtitle }))] }), (showAmount || showBalance) && (_jsxs("div", { className: "min-w-0 flex-shrink-0 text-right", children: [showAmount && amount !== undefined && _jsx(AmountDisplay, { amount: amount, size: "md" }), showBalance && balance !== undefined && (_jsxs("p", { className: "mt-0.5 text-xs break-words text-neutral-500 dark:text-neutral-400", children: ["Saldo: ", balance] }))] }))] }));
}
