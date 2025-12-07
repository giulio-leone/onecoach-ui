/**
 * TransactionItem Component
 *
 * Reusable transaction/activity list item with optimized dark mode.
 * Used for credit history, activity logs, etc.
 */
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
export declare function TransactionItem({ icon, iconVariant, title, subtitle, amount, balance, showAmount, showBalance, className, onClick, }: TransactionItemProps): import("react/jsx-runtime").JSX.Element;
