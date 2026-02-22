'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CheckCircle, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@giulio-leone/lib-shared';

interface AffiliateRegistrationSuccess {
  creditReward: number;
  pendingDays: number;
}

export function AffiliateRegistrationNotification() {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [notification, setNotification] = useState<AffiliateRegistrationSuccess | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const stored = sessionStorage.getItem('affiliate_registration_success');
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as AffiliateRegistrationSuccess;
    } catch (error: unknown) {
      logger.error(tCommon('error'), error);
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    // Se presente, rimuovi la chiave dopo la prima lettura (lo stato è già inizializzato)
    if (sessionStorage.getItem('affiliate_registration_success')) {
      sessionStorage.removeItem('affiliate_registration_success');
    }
  }, []);

  if (!notification) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-green-100 p-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-green-900">
            {t(
              'affiliates.affiliate_registration_notification.codice_referral_applicato_con_successo'
            )}
          </h4>
          <p className="mt-1 text-xs text-green-800">
            Riceverai <strong className="font-bold">{notification.creditReward} crediti</strong>{' '}
            {t(
              'affiliates.affiliate_registration_notification.come_reward_per_la_registrazione_i_credi'
            )}{' '}
            <strong>{notification.pendingDays} giorni</strong>.
          </p>
          <Link
            href="/affiliations"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700 underline hover:text-green-800"
          >
            {t('affiliates.affiliate_registration_notification.vedi_dettagli_affiliazione')}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="flex-shrink-0 rounded p-1 text-green-600 transition-colors hover:bg-green-100"
          aria-label="Chiudi notifica"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
