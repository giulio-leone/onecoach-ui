'use client';

import { useTranslations } from 'next-intl';
/**
 * Promo Code Input Component
 *
 * Input riutilizzabile per codice promozionale con validazione in tempo reale
 */

import { Tag, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '../input';
import { usePromoCodeValidation } from '@giulio-leone/lib-api/hooks';

/** Local promotion type aligned with the usePromoCodeValidation hook */
interface PromotionInfo {
  id?: string;
  code?: string;
  type?: string;
  discountType?: string;
  discountValue?: number;
  bonusCredits?: number;
  description?: string;
  expiresAt?: string | null;
  [key: string]: unknown;
}

interface PromoCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onValidationChange?: (valid: boolean, promotion?: PromotionInfo) => void;
  userId?: string;
  disabled?: boolean;
}

export function PromoCodeInput({
  value,
  onChange,
  onValidationChange,
  userId,
  disabled = false,
}: PromoCodeInputProps) {
  const t = useTranslations('common');

  const { validationResult, isValidating } = usePromoCodeValidation({
    code: value,
    userId,
    enabled: !disabled && value.trim().length > 0,
    onValidationChange,
  });

  const getInputStyles = () => {
    if (validationResult?.valid) {
      return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    }
    if (validationResult && !validationResult.valid) {
      return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    }
    return '';
  };

  const formatPromoInfo = () => {
    if (!validationResult?.valid || !validationResult.promotion) return null;

    const promo = validationResult.promotion as PromotionInfo;

    if (promo.type === 'STRIPE_COUPON') {
      if (promo.discountType === 'PERCENTAGE') {
        return `Sconto ${promo.discountValue}%`;
      } else {
        return `Sconto €${((promo.discountValue || 0) / 100).toFixed(2)}`;
      }
    } else if (promo.type === 'BONUS_CREDITS') {
      return `+${promo.bonusCredits} crediti bonus`;
    }

    return null;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {t('promo_code_input.codice_promozionale_opzionale')}
      </label>
      <div className="relative">
        <div className="absolute top-1/2 left-3 -translate-y-1/2">
          <Tag className="h-4 w-4 text-neutral-400" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value.toUpperCase())
          }
          placeholder={t('promo_code_input.inserisci_codice_promozionale')}
          disabled={disabled}
          className={`pr-10 pl-10 font-mono ${getInputStyles()}`}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          {isValidating && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
          )}
          {!isValidating && validationResult?.valid && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {!isValidating && validationResult && !validationResult.valid && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation feedback */}
      {validationResult?.valid && validationResult.promotion && (
        <div className="rounded-lg bg-green-50 p-2 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <p className="font-medium">{t('promo_code_input.codice_valido')}</p>
          <p>{formatPromoInfo()}</p>
          {(validationResult.promotion as PromotionInfo).description && (
            <p className="text-xs opacity-80">{(validationResult.promotion as PromotionInfo).description}</p>
          )}
        </div>
      )}

      {validationResult && !validationResult.valid && (
        <div className="rounded-lg bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <p>{validationResult.error || 'Codice non valido'}</p>
        </div>
      )}
    </div>
  );
}
