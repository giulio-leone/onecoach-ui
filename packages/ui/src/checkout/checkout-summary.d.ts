/**
 * Checkout Summary Component
 *
 * Riepilogo ordine con prezzo, promozioni e referral
 */
interface CheckoutSummaryProps {
    title: string;
    description?: string;
    amount: number;
    currency?: string;
    items?: Array<{
        title: string;
        quantity: number;
        amount: number;
        currency?: string;
    }>;
    discountTotal?: number;
    promoCode?: string;
    promotion?: {
        type: 'STRIPE_COUPON' | 'BONUS_CREDITS';
        discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue?: number;
        bonusCredits?: number;
        description?: string;
    };
    referralCode?: string;
}
export declare function CheckoutSummary({ title, description, amount, currency, items, discountTotal, promoCode, promotion, referralCode, }: CheckoutSummaryProps): import("react/jsx-runtime").JSX.Element;
export {};
