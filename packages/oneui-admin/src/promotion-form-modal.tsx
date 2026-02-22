/**
 * Promotion Form Modal Component
 *
 * Modal per creare/modificare promozioni
 */
'use client';
import { useMemo } from 'react';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, Modal, ModalFooter, Radio, RadioGroup, DatePicker, Input } from '@giulio-leone/ui';
import { useForm } from '@giulio-leone/hooks';
import { handleApiError } from '@giulio-leone/lib-shared';
interface PromotionData {
  id: string;
  code: string;
  type: string;
  stripeCouponId: string | null;
  discountType: string | null;
  discountValue: number | null;
  bonusCredits: number | null;
  maxUses: number | null;
  maxUsesPerUser: number;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
  description: string | null;
}
interface PromotionFormModalProps {
  isOpen: boolean;
  promotion: PromotionData | null;
  onClose: () => void;
}
interface PromotionFormValues {
  code: string;
  type: 'STRIPE_COUPON' | 'BONUS_CREDITS';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  bonusCredits: string;
  maxUses: string;
  maxUsesPerUser: string;
  validFrom: string;
  validUntil: string;
  description: string;
}
type PromotionRequest = {
  code: string;
  type: PromotionFormValues['type'];
  maxUsesPerUser: number;
  validFrom: string;
  description?: string;
  discountType?: PromotionFormValues['discountType'];
  discountValue?: number;
  bonusCredits?: number;
  maxUses?: number;
  validUntil?: string;
};
export function PromotionFormModal({ isOpen, promotion, onClose }: PromotionFormModalProps) {
  const t = useTranslations('admin');

  const tUi = useTranslations('ui.datePicker');
  const tCommon = useTranslations('common');
  const defaultValidFrom = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0] as string;
  }, []);
  const form = useForm({
    initialValues: {
      code: promotion?.code || '',
      type: (promotion?.type as 'STRIPE_COUPON' | 'BONUS_CREDITS') || 'STRIPE_COUPON',
      discountType: (promotion?.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT') || 'PERCENTAGE',
      discountValue: promotion?.discountValue?.toString() || '',
      bonusCredits: String(promotion?.bonusCredits ?? ''),
      maxUses: String(promotion?.maxUses ?? ''),
      maxUsesPerUser: promotion?.maxUsesPerUser.toString() || '1',
      validFrom: promotion?.validFrom
        ? (new Date(promotion.validFrom).toISOString().split('T')[0] as string)
        : defaultValidFrom,
      validUntil: promotion?.validUntil
        ? (new Date(promotion.validUntil).toISOString().split('T')[0] as string)
        : '',
      description: String(promotion?.description ?? ''),
    },
    onSubmit: async (values: any) => {
      const body: PromotionRequest = {
        code: values.code.trim().toUpperCase(),
        type: values.type,
        maxUsesPerUser: parseInt(values.maxUsesPerUser) || 1,
        validFrom: new Date(values.validFrom).toISOString(),
        description: values.description.trim() || undefined,
      };
      if (values.type === 'STRIPE_COUPON') {
        body.discountType = values.discountType;
        body.discountValue = parseFloat(values.discountValue);
      } else {
        body.bonusCredits = parseInt(values.bonusCredits);
      }
      if (values.maxUses) {
        body.maxUses = parseInt(values.maxUses);
      }
      if (values.validUntil) {
        body.validUntil = new Date(values.validUntil).toISOString();
      }
      const url = promotion ? `/api/admin/promotions/${promotion.id}` : '/api/admin/promotions';
      const method = promotion ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      onClose();
    },
    validate: {
      code: (value: PromotionFormValues['code'], _allValues?: PromotionFormValues) =>
        !value.trim() ? 'Codice promozionale richiesto' : null,
      discountValue: (
        value: PromotionFormValues['discountValue'],
        allValues?: PromotionFormValues
      ) => {
        if (allValues?.type === 'STRIPE_COUPON') {
          const parsed = parseFloat(value);
          if (!value || Number.isNaN(parsed) || parsed <= 0) {
            return 'Valore sconto richiesto e deve essere maggiore di 0';
          }
        }
        return null;
      },
      bonusCredits: (
        value: PromotionFormValues['bonusCredits'],
        allValues?: PromotionFormValues
      ) => {
        if (allValues?.type === 'BONUS_CREDITS') {
          const parsed = parseInt(value, 10);
          if (!value || Number.isNaN(parsed) || parsed <= 0) {
            return 'Crediti bonus richiesti e devono essere maggiori di 0';
          }
        }
        return null;
      },
      validFrom: (value: PromotionFormValues['validFrom'], _allValues?: PromotionFormValues) =>
        !value ? 'Data inizio validità richiesta' : null,
    },
    validateOnBlur: false,
  });
  const formError = (form.errors as Record<string, string | undefined>)._form;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Modifica Promozione' : 'Nuova Promozione'}
      size="lg"
    >
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        {promotion ? promotion.code : 'Crea un nuovo codice promozionale'}
      </p>
      <form onSubmit={form.handleSubmit}>
        <div className="space-y-6">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {formError}
            </div>
          )}
          {/* Code */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.promotion_form_modal.codice_promozionale')}
            </label>
            <Input
              type="text"
              value={form.values.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('code', e.target.value.toUpperCase())
              }
              onBlur={form.handleBlur('code')}
              placeholder="ESEMPIO123"
              disabled={!!promotion || form.isSubmitting}
              className="font-mono"
              aria-invalid={!!form.errors.code}
            />
            {form.errors.code && form.touched.code && (
              <p className="mt-1 text-xs text-red-600">{form.errors.code}</p>
            )}
            {promotion && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {t('admin.promotion_form_modal.il_codice_non_puo_essere_modificato_dopo')}
              </p>
            )}
          </div>
          {/* Type */}
          <div>
            <RadioGroup
              label={t('admin.promotion_form_modal.tipo_promozione')}
              value={form.values.type}
              onChange={(value) =>
                form.setValue('type', value as 'STRIPE_COUPON' | 'BONUS_CREDITS')
              }
              orientation="horizontal"
              disabled={!!promotion || form.isSubmitting}
            >
              <Radio
                value="STRIPE_COUPON"
                label={t('admin.promotion_form_modal.stripe_coupon_sconto')}
              />
              <Radio value="BONUS_CREDITS" label={t('admin.promotion_form_modal.bonus_crediti')} />
            </RadioGroup>
          </div>
          {/* Discount fields (STRIPE_COUPON) */}
          {form.values.type === 'STRIPE_COUPON' && (
            <>
              <div>
                <RadioGroup
                  label={t('admin.promotion_form_modal.tipo_sconto')}
                  value={form.values.discountType}
                  onChange={(value) =>
                    form.setValue('discountType', value as 'PERCENTAGE' | 'FIXED_AMOUNT')
                  }
                  orientation="horizontal"
                  disabled={form.isSubmitting}
                >
                  <Radio value="PERCENTAGE" label={t('admin.promotion_form_modal.percentuale')} />
                  <Radio
                    value="FIXED_AMOUNT"
                    label={t('admin.promotion_form_modal.importo_fisso')}
                  />
                </RadioGroup>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t('admin.promotion_form_modal.valore_sconto')}{' '}
                  {form.values.discountType === 'PERCENTAGE'
                    ? '(1-100)'
                    : '(in centesimi, es. 1000 = €10.00)'}
                </label>
                <Input
                  type="number"
                  value={form.values.discountValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    form.setValue('discountValue', e.target.value)
                  }
                  onBlur={form.handleBlur('discountValue')}
                  placeholder={form.values.discountType === 'PERCENTAGE' ? '10' : '1000'}
                  disabled={form.isSubmitting}
                  min={form.values.discountType === 'PERCENTAGE' ? 1 : 1}
                  max={form.values.discountType === 'PERCENTAGE' ? 100 : undefined}
                  aria-invalid={!!form.errors.discountValue}
                />
                {form.errors.discountValue && form.touched.discountValue && (
                  <p className="mt-1 text-xs text-red-600">{form.errors.discountValue}</p>
                )}
              </div>
            </>
          )}
          {/* Bonus credits (BONUS_CREDITS) */}
          {form.values.type === 'BONUS_CREDITS' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.promotion_form_modal.crediti_bonus')}
              </label>
              <Input
                type="number"
                value={form.values.bonusCredits}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('bonusCredits', e.target.value)
                }
                onBlur={form.handleBlur('bonusCredits')}
                placeholder="100"
                disabled={form.isSubmitting}
                min={1}
                aria-invalid={!!form.errors.bonusCredits}
              />
              {form.errors.bonusCredits && form.touched.bonusCredits && (
                <p className="mt-1 text-xs text-red-600">{form.errors.bonusCredits}</p>
              )}
            </div>
          )}
          {/* Limits */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.promotion_form_modal.usi_massimi_totali_opzionale')}
              </label>
              <Input
                type="number"
                value={form.values.maxUses}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('maxUses', e.target.value)
                }
                placeholder="Illimitato"
                disabled={form.isSubmitting}
                min={1}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.promotion_form_modal.usi_massimi_per_utente')}
              </label>
              <Input
                type="number"
                value={form.values.maxUsesPerUser}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('maxUsesPerUser', e.target.value)
                }
                disabled={form.isSubmitting}
                min={1}
              />
            </div>
          </div>
          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.promotion_form_modal.data_inizio_validita')}
              </label>
              <DatePicker
                value={form.values.validFrom ? new Date(form.values.validFrom) : undefined}
                onChange={(date) =>
                  form.setValue('validFrom', date ? date.toISOString().substring(0, 10) : '')
                }
                translations={{
                  selectDate: tUi('selectDate'),
                  today: tUi('today'),
                  previousMonth: tUi('previousMonth'),
                  nextMonth: tUi('nextMonth'),
                  weekdays: { short: tUi.raw('weekdays.short') as string[] },
                  months: tUi.raw('months') as string[],
                }}
                disabled={form.isSubmitting}
                className="w-full"
              />
              {form.errors.validFrom && form.touched.validFrom && (
                <p className="mt-1 text-xs text-red-600">{form.errors.validFrom}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.promotion_form_modal.data_fine_validita_opzionale')}
              </label>
              <DatePicker
                value={form.values.validUntil ? new Date(form.values.validUntil) : undefined}
                onChange={(date) =>
                  form.setValue('validUntil', date ? date.toISOString().substring(0, 10) : '')
                }
                translations={{
                  selectDate: tUi('selectDate'),
                  today: tUi('today'),
                  previousMonth: tUi('previousMonth'),
                  nextMonth: tUi('nextMonth'),
                  weekdays: { short: tUi.raw('weekdays.short') as string[] },
                  months: tUi.raw('months') as string[],
                }}
                disabled={form.isSubmitting}
                minDate={form.values.validFrom ? new Date(form.values.validFrom) : undefined}
                className="w-full"
              />
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.promotion_form_modal.descrizione_opzionale')}
            </label>
            <Input
              type="text"
              value={form.values.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('description', e.target.value)
              }
              placeholder={t('admin.promotion_form_modal.es_promozione_black_friday_2025')}
              disabled={form.isSubmitting}
            />
          </div>
          {/* Preview */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h4 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">Anteprima</h4>
            <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                <strong>{t('admin.promotion_form_modal.codice')}</strong>{' '}
                {form.values.code || 'N/A'}
              </p>
              <p>
                <strong>{t('admin.promotion_form_modal.tipo')}</strong>{' '}
                {form.values.type === 'STRIPE_COUPON' ? 'Stripe Coupon' : 'Bonus Credits'}
              </p>
              {form.values.type === 'STRIPE_COUPON' && form.values.discountValue && (
                <p>
                  <strong>{t('admin.promotion_form_modal.sconto')}</strong>{' '}
                  {form.values.discountType === 'PERCENTAGE'
                    ? `${form.values.discountValue}%`
                    : `€${(parseFloat(form.values.discountValue) / 100).toFixed(2)}`}
                </p>
              )}
              {form.values.type === 'BONUS_CREDITS' && form.values.bonusCredits && (
                <p>
                  <strong>{t('admin.promotion_form_modal.bonus')}</strong> +
                  {form.values.bonusCredits} crediti
                </p>
              )}
              <p>
                <strong>{t('admin.promotion_form_modal.usi_per_utente')}</strong>{' '}
                {form.values.maxUsesPerUser || 1}
              </p>
              {form.values.maxUses && (
                <p>
                  <strong>{t('admin.promotion_form_modal.usi_totali')}</strong>{' '}
                  {form.values.maxUses}
                </p>
              )}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={form.isSubmitting}>
            Annulla
          </Button>
          <Button type="submit" disabled={form.isSubmitting || !form.isValid}>
            {form.isSubmitting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {promotion ? tCommon('actions.saveChanges') : 'Crea Promozione'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
