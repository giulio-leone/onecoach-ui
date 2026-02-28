/**
 * Checkout Summary Component
 *
 * Riepilogo ordine con prezzo, promozioni e referral
 */

'use client';

import { Check, Tag } from 'lucide-react';

interface CheckoutSummaryProps {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  items?: Array<{ title: string; quantity: number; amount: number; currency?: string }>;
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

export function CheckoutSummary({
  title,
  description,
  amount,
  currency = 'EUR',
  items,
  discountTotal,
  promoCode,
  promotion,
  referralCode,
}: CheckoutSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  let finalAmount = amount;
  let discountAmount = 0;

  if (promotion && promotion.type === 'STRIPE_COUPON') {
    if (promotion.discountType === 'PERCENTAGE' && promotion.discountValue) {
      discountAmount = (amount * promotion.discountValue) / 100;
      finalAmount = amount - discountAmount;
    } else if (promotion.discountType === 'FIXED_AMOUNT' && promotion.discountValue) {
      discountAmount = promotion.discountValue;
      finalAmount = amount - discountAmount;
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200/60 bg-white p-6 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Riepilogo Ordine
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</p>
          {description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
          )}
        </div>

        {items && items.length > 0 && (
          <div className="space-y-2 rounded-md border border-neutral-200/60 bg-neutral-50 p-3 dark:border-white/[0.08] dark:bg-white/[0.05]">
            {items.map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="flex items-center justify-between">
                <div className="text-xs text-neutral-600 dark:text-neutral-300">
                  {item.title}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </div>
                <div className="text-xs font-medium text-neutral-800 dark:text-neutral-100">
                  {formatPrice(item.amount)}
                </div>
              </div>
            ))}
          </div>
        )}

        {promoCode && promotion && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20">
            <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="text-xs font-medium text-green-800 dark:text-green-300">
                Promozione: {promoCode}
              </p>
              {promotion.description && (
                <p className="text-xs text-green-700 dark:text-green-400">
                  {promotion.description}
                </p>
              )}
              {promotion.type === 'BONUS_CREDITS' && promotion.bonusCredits && (
                <p className="text-xs text-green-700 dark:text-green-400">
                  +{promotion.bonusCredits} crediti bonus
                </p>
              )}
            </div>
          </div>
        )}

        {referralCode && (
          <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 dark:border-primary-800 dark:bg-primary-900/20">
            <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <p className="text-xs font-medium text-primary-800 dark:text-primary-300">
              Codice referral attivo: {referralCode}
            </p>
          </div>
        )}

        <div className="border-t border-neutral-200/60 pt-3 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Subtotale</span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {formatPrice(amount)}
            </span>
          </div>

          {discountTotal !== undefined && discountTotal > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-green-600 dark:text-green-400">Sconto</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                -{formatPrice(discountTotal)}
              </span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-green-600 dark:text-green-400">Sconto</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                -{formatPrice(discountAmount)}
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-neutral-200/60 pt-3 dark:border-white/[0.08]">
            <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Totale
            </span>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatPrice(finalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
