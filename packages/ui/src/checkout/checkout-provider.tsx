/**
 * Checkout Provider
 *
 * Provider Stripe Elements per il checkout
 */

'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useMemo } from 'react';

// Inlined from lib-core/stripe/client to avoid server-side dependencies
let stripePromise: Promise<Stripe | null> | null = null;

function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY non configurata');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface CheckoutProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export function CheckoutProvider({ clientSecret, children }: CheckoutProviderProps) {
  const stripePromise = useMemo(() => getStripeClient(), []);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
        Pagamenti non disponibili: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY mancante.
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return <div>Caricamento checkout...</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
        locale: 'it',
      }}
    >
      {children}
    </Elements>
  );
}
