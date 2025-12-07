/**
 * Subscription Form Component
 *
 * Form subscription con Setup Intent per salvare Payment Method
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../button';
import { CreditCard } from 'lucide-react';
import { handleApiError } from '@onecoach/lib-shared';
export function SubscriptionForm({ clientSecret, setupIntentId, plan, promoCode, referralCode, onSuccess, onError, }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setIsProcessing(true);
        setError(null);
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setError('Elemento carta non trovato');
            setIsProcessing(false);
            return;
        }
        try {
            // Conferma Setup Intent
            const { error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });
            if (confirmError) {
                setError(confirmError.message || 'Errore nella conferma del metodo di pagamento');
                setIsProcessing(false);
                return;
            }
            // Crea subscription
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    setupIntentId,
                    plan,
                    promoCode,
                    referralCode,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const apiError = await handleApiError(response);
                throw apiError;
            }
            // Gestione 3D Secure se necessario (per il primo pagamento)
            if (data.requiresAction) {
                const { error: actionError } = await stripe.confirmCardPayment(data.clientSecret);
                if (actionError) {
                    setError(actionError.message || 'Errore nella conferma 3D Secure');
                    setIsProcessing(false);
                    return;
                }
            }
            // Subscription creata
            onSuccess();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
            setError(errorMessage);
            onError(errorMessage);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx(CreditCard, { className: "h-5 w-5 text-neutral-600 dark:text-neutral-400" }), _jsx("label", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Dati Carta" })] }), _jsx(CardElement, { options: cardElementOptions })] }), error && (_jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300", children: error })), _jsx(Button, { type: "submit", disabled: !stripe || isProcessing, className: "w-full", variant: "primary", size: "lg", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" }), "Creazione subscription..."] })) : ('Sottoscrivi Ora') })] }));
}
