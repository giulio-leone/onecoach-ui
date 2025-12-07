/**
 * Checkout Provider
 *
 * Provider Stripe Elements per il checkout
 */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Elements } from '@stripe/react-stripe-js';
import { getStripeClient } from '@onecoach/lib-core/stripe/client';
import { useMemo } from 'react';
export function CheckoutProvider({ clientSecret, children }) {
    const stripePromise = useMemo(() => getStripeClient(), []);
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        return (_jsx("div", { className: "rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200", children: "Pagamenti non disponibili: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY mancante." }));
    }
    if (!stripePromise || !clientSecret) {
        return _jsx("div", { children: "Caricamento checkout..." });
    }
    return (_jsx(Elements, { stripe: stripePromise, options: {
            clientSecret,
            appearance: { theme: 'stripe' },
            locale: 'it',
        }, children: children }));
}
