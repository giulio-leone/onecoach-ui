/**
 * Payment Form Component
 *
 * Form di pagamento con Stripe Elements per pagamenti one-time
 */
interface PaymentFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}
export declare function PaymentForm({ clientSecret, onSuccess, onError }: PaymentFormProps): import("react/jsx-runtime").JSX.Element;
export {};
