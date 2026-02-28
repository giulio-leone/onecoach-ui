/**
 * Payment Form Component
 *
 * Form di pagamento con Stripe Elements per pagamenti one-time
 */

'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../button';
import { CreditCard } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PaymentForm({ clientSecret, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientSecret) {
      setError('Client secret non disponibile. Riprova più tardi.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError('Pagamento non disponibile: chiave pubblicabile Stripe mancante.');
      return;
    }

    if (!stripe || !elements) {
      setError('Checkout non inizializzato. Ricarica la pagina.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Errore nella conferma del pagamento');
        onError(confirmError.message || 'Errore nella conferma del pagamento');
        setIsProcessing(false);
        return;
      }

      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-white/[0.04]">
        <div className="mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Dati Carta
          </label>
        </div>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        variant="primary"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Elaborazione pagamento...
          </>
        ) : (
          'Conferma Pagamento'
        )}
      </Button>
    </form>
  );
}
