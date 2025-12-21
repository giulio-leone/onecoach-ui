/**
 * Subscription Form Component
 *
 * Form subscription con Setup Intent per salvare Payment Method
 */
interface SubscriptionFormProps {
    clientSecret: string;
    setupIntentId: string;
    plan: 'PLUS' | 'PRO';
    promoCode?: string;
    referralCode?: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}
export declare function SubscriptionForm({ clientSecret, setupIntentId, plan, promoCode, referralCode, onSuccess, onError, }: SubscriptionFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=subscription-form.d.ts.map