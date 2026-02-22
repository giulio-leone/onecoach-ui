'use client';

import { useTranslations } from 'next-intl';
/**
 * Low Credit Alert Component
 *
 * Alert quando i crediti sono bassi
 */

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@giulio-leone/ui';
import { Link } from 'app/navigation';
import { useCredits } from '@giulio-leone/lib-api/hooks';


interface LowCreditAlertProps {
  threshold?: number; // Soglia sotto cui mostrare l'alert
}

export function LowCreditAlert({ threshold = 50 }: LowCreditAlertProps) {
  const t = useTranslations('common');

  const { data: creditsData } = useCredits();
  const [isDismissed, setIsDismissed] = useState(false);

  const balance = creditsData?.balance ?? null;
  const hasUnlimited = creditsData?.hasUnlimitedCredits ?? false;

  // Non mostrare se:
  // - È stato dismissato
  // - Ha crediti illimitati
  // - Balance è null (ancora caricamento)
  // - Balance è sopra la soglia
  if (isDismissed || hasUnlimited || balance === null || balance >= threshold) {
    return null;
  }

  return (
    <div className="animate-slide-up fixed right-2 bottom-4 z-50 max-w-[calc(100vw-1rem)] overflow-x-hidden sm:right-4 sm:bottom-6 sm:max-w-md">
      <div className="overflow-x-hidden rounded-lg border-2 border-yellow-400 bg-yellow-50 p-3 shadow-lg sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 rounded-full bg-yellow-100 p-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold break-words text-yellow-900 sm:text-base">
              {t('credits.low_credit_alert.crediti_in_esaurimento')}
            </h4>
            <p className="mt-1 text-xs break-words text-yellow-800 sm:text-sm">
              {t('credits.low_credit_alert.ti_rimangono_solo')}
              <strong>{balance} crediti</strong>
              {t('credits.low_credit_alert.acquista_altri_crediti_o_passa_a_un_pian')}
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="primary" size="sm" className="w-full sm:w-auto">
                  {t('credits.low_credit_alert.acquista_crediti')}
                </Button>
              </Link>
              <Button
                onClick={() => setIsDismissed(true)}
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                Chiudi
              </Button>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="ml-1 flex-shrink-0 rounded p-1 hover:bg-yellow-100"
          >
            <X className="h-4 w-4 text-yellow-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
