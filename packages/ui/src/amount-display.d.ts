/**
 * AmountDisplay Component
 *
 * Reusable component for displaying monetary amounts with optimized dark mode.
 * Handles positive/negative values with appropriate colors.
 */
export interface AmountDisplayProps {
    amount: number;
    showSign?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare function AmountDisplay({ amount, showSign, size, className, }: AmountDisplayProps): import("react/jsx-runtime").JSX.Element;
