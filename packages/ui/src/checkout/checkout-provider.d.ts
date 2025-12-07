/**
 * Checkout Provider
 *
 * Provider Stripe Elements per il checkout
 */
interface CheckoutProviderProps {
    clientSecret: string;
    children: React.ReactNode;
}
export declare function CheckoutProvider({ clientSecret, children }: CheckoutProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
