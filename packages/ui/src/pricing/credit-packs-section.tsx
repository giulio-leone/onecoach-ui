'use client';

import { useTranslations } from 'next-intl';
/**
 * Credit Packs Section Component
 *
 * Sezione acquisto pacchetti crediti con gestione autenticazione
 */

import { useMemo, useState } from 'react';
import { useAuth } from '@giulio-leone/lib-api/hooks';
import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';
import { Button } from '@giulio-leone/ui';
import { CreditCheckoutModal } from './credit-checkout-modal';
import { PromoCodeInput } from './promo-code-input';
import { CREDIT_PACK_OPTIONS } from '@giulio-leone/lib-shared';
import type { CreditPackOption } from "@giulio-leone/types/domain";

export function CreditPacksSection() {
  const t = useTranslations('common');

  const { isAuthenticated, userId } = useAuth();
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<CreditPackOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [validPromotion, setValidPromotion] = useState<unknown>(null);

  const formatPricePerCredit = useMemo(() => {
    const formatter = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });

    return (price: number, credits: number) => `${formatter.format(price / credits)} / credito`;
  }, []);

  const startCheckout = (pack: CreditPackOption) => {
    const params = new URLSearchParams({
      type: 'credits',
      packId: pack.credits.toString(),
    });

    if (promoCode && validPromotion) {
      params.set('promoCode', promoCode.trim().toUpperCase());
    }

    router.push(`/checkout?${params.toString()}`);
  };

  const handleBuyClick = (pack: CreditPackOption) => {
    if (!isAuthenticated) {
      setSelectedPack(pack);
      setIsModalOpen(true);
      return;
    }

    startCheckout(pack);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPack(null);
  };

  return (
    <div className="relative">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          {t('credit_packs_section.oppure_acquista_crediti')}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
          {t('credit_packs_section.paga_solo_quando_ne_hai_bisogno_i_credit')}
        </p>
      </div>

      {/* Promo code input */}
      <div className="mx-auto mt-8 max-w-md">
        <PromoCodeInput
          value={promoCode}
          onChange={setPromoCode}
          onValidationChange={(valid, promotion) => {
            setValidPromotion(valid ? promotion : null);
          }}
          userId={userId ?? undefined}
        />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CREDIT_PACK_OPTIONS.map((pack: any) => (
          <div
            key={pack.id}
            className={`relative rounded-xl border-2 p-6 shadow-sm transition-shadow hover:shadow-lg sm:p-6 ${
              pack.popular
                ? 'border-primary-500 bg-primary-50 shadow-lg dark:border-primary-400 dark:bg-primary-900/20'
                : 'border-neutral-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.04]'
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white dark:bg-primary-500">
                  {t('credit_packs_section.piu_conveniente')}
                </span>
              </div>
            )}

            {pack.savings && (
              <div className="mb-3 text-center">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {pack.savings}
                </span>
              </div>
            )}

            <div className="text-center">
              <div className="inline-flex rounded-full bg-neutral-100 p-3 dark:bg-white/[0.08] dark:bg-white/[0.04]">
                <Coins className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
              </div>
              <p className="mt-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {pack.credits}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">crediti</p>
              <p className="mt-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                €{pack.price.toFixed(2)}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatPricePerCredit(pack.price, pack.credits)}
              </p>
            </div>

            <Button
              onClick={() => handleBuyClick(pack)}
              className="mt-6 w-full"
              variant={pack.popular ? 'primary' : 'secondary'}
            >
              {isAuthenticated ? 'Acquista' : 'Accedi per acquistare'}
            </Button>
          </div>
        ))}
      </div>

      <CreditCheckoutModal
        open={isModalOpen}
        pack={selectedPack}
        onClose={handleModalClose}
        onCheckout={async () => {
          if (!selectedPack) return;
          startCheckout(selectedPack);
        }}
      />
    </div>
  );
}
