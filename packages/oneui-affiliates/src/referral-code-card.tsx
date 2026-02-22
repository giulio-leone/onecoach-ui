'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Check, Copy, Link as LinkIcon, Share2, QrCode } from 'lucide-react';
import { logger } from '@giulio-leone/lib-shared';

interface ReferralCodeCardProps {
  code: string;
}

export function ReferralCodeCard({ code }: ReferralCodeCardProps) {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  // Evita hydration mismatch: inizializza stringa vuota su SSR e aggiorna dopo mount
  useEffect(() => {
    setReferralLink(`${window.location.origin}/register?ref=${code}`);
  }, [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error: unknown) {
      logger.error(t('common.error'), error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error: unknown) {
      logger.error(t('common.error'), error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Unisciti a onecoach con il mio referral!',
          text: `Registrati su onecoach con il mio codice referral ${code} e ricevi crediti bonus!`,
          url: referralLink,
        });
      } catch (error: unknown) {
        // User cancelled share or error occurred
        if ((error as Error).name !== 'AbortError') {
          logger.error(tCommon('error'), error);
        }
      }
    } else {
      // Fallback: copia link
      handleCopyLink();
    }
  };

  const generateQRCodeURL = () => {
    // Usa un servizio QR code pubblico (es. QRCode.js o API esterna)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`;
  };

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      {/* Code Display */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t('affiliates.referral_code_card.il_tuo_referral_code')}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-widest text-neutral-900 sm:text-3xl dark:text-neutral-100">
            {code}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-300"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copiato!' : 'Copia Codice'}</span>
        </button>
      </div>

      {/* Link Display */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
        <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {t('affiliates.referral_code_card.link_di_registrazione')}
        </p>
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 flex-shrink-0 text-neutral-400 dark:text-neutral-600" />
          <p className="min-w-0 flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
            {referralLink}
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-shrink-0 rounded px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400"
          >
            {linkCopied ? 'Copiato!' : 'Copia'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Share2 className="h-4 w-4" />
          <span>Condividi</span>
        </button>
        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/50 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <QrCode className="h-4 w-4" />
          <span>
            {showQR ? 'Nascondi' : 'Mostra'} {t('affiliates.referral_code_card.qr_code')}
          </span>
        </button>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
          <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {t('affiliates.referral_code_card.scansiona_per_registrarti')}
          </p>
          <div className="mx-auto inline-block rounded-lg bg-white p-2 dark:bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generateQRCodeURL()}
              alt={t('affiliates.referral_code_card.qr_code_referral')}
              width={128}
              height={128}
            />
          </div>
        </div>
      )}
    </div>
  );
}
