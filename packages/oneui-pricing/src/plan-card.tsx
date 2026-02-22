'use client';

import { useTranslations } from 'next-intl';
/**
 * Plan Card Component
 *
 * Card per piano abbonamento
 */

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@giulio-leone/ui';
import { PromoCodeInput } from './promo-code-input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@giulio-leone/lib-api/hooks';
// TODO: Move useReferralTracking to a shared package
// import { useReferralTracking } from 'hooks/use-referral-tracking';

interface PlanCardProps {
  plan: {
    name: string;
    price: number;
    credits: number | 'illimitati';
    interval: 'mese' | 'anno';
    features: string[];
    popular?: boolean;
    stripePlan: 'PLUS' | 'PRO';
  };
  /** Optional referral code to apply */
  referralCode?: string;
}

export function PlanCard({ plan, referralCode }: PlanCardProps) {
  const t = useTranslations('common');

  const router = useRouter();
  const { userId } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [validPromotion, setValidPromotion] = useState<unknown>(null);

  const handleSubscribe = () => {
    const params = new URLSearchParams({
      type: 'subscription',
      plan: plan.stripePlan,
    });

    if (promoCode && validPromotion) {
      params.set('promoCode', promoCode.trim().toUpperCase());
    }

    if (referralCode) {
      params.set('referralCode', referralCode);
    }

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 ${
        plan.popular
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl'
          : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
      }`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
            <Sparkles className="h-4 w-4" />
            {t('common.plan_card.piu_popolare')}
          </div>
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{plan.name}</h3>

      {/* Referral indicator and breakdown */}
      {referralCode && (
        <div className="mt-3 space-y-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <Check className="h-3 w-3" />
            {t('common.plan_card.codice_referral_attivo')}
            {referralCode}
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
            <p className="font-medium text-green-900">{t('common.plan_card.benefici_referral')}</p>
            <ul className="mt-2 space-y-1 text-xs text-green-800">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                <span>{t('common.plan_card.riceverai_crediti_bonus_alla_registrazio')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                <span>{t('common.plan_card.sarai_collegato_al_referrer_nel_programm')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                <span>{t('common.plan_card.crediti_disponibili_dopo_periodo_di_pend')}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="mt-4 flex items-baseline">
        <span className="text-5xl font-bold text-neutral-900 dark:text-neutral-100">
          €{plan.price}
        </span>
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">/{plan.interval}</span>
      </div>

      {/* Credits */}
      <p className="mt-2 text-lg font-medium text-neutral-600 dark:text-neutral-400">
        {typeof plan.credits === 'number' ? `${plan.credits} crediti/mese` : 'Crediti illimitati'}
      </p>

      {/* Promo code input */}
      <div className="mt-6">
        <PromoCodeInput
          value={promoCode}
          onChange={setPromoCode}
          onValidationChange={(valid, promotion) => {
            setValidPromotion(valid ? promotion : null);
          }}
          userId={userId ?? undefined}
        />
      </div>

      {/* Subscribe button */}
      <Button
        onClick={handleSubscribe}
        className="mt-6 w-full"
        variant={plan.popular ? 'primary' : 'secondary'}
      >
        {t('common.plan_card.sottoscrivi_ora')}
      </Button>

      {/* Features */}
      <ul className="mt-8 space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full p-1 ${plan.popular ? 'bg-blue-100' : 'bg-neutral-100 dark:bg-neutral-800'}`}
            >
              <Check
                className={`h-4 w-4 ${plan.popular ? 'text-blue-600' : 'text-neutral-600 dark:text-neutral-400'}`}
              />
            </div>
            <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
