/**
 * Plans Configuration Form
 *
 * Form per configurare piani e pacchetti crediti
 * Principi: KISS, SOLID, DRY, YAGNI
 */
'use client';
import { useState } from 'react';
import { AdminCard, Button } from '@giulio-leone/ui';
import { Save, Info } from 'lucide-react';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';
import type { PlanPricing, CreditPackPricing } from '@giulio-leone/types/domain';

type PlanPricingWithMeta = PlanPricing & { description?: string | null };

type CreditPackWithMeta = CreditPackPricing & {
  description?: string | null;
  stripePriceId?: string;
};

interface PlansConfigFormProps {
  plans: {
    plus: PlanPricingWithMeta;
    pro: PlanPricingWithMeta;
  };
  creditPacks: CreditPackWithMeta[];
}

export function PlansConfigForm({ plans, creditPacks }: PlansConfigFormProps) {
  const t = useTranslations('admin.aiSettings.billing');
  const tAdmin = useTranslations('admin');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Note: Plans are configured via Stripe Dashboard
      // This is a read-only view for now
      setSuccess(tAdmin('actions.successStripe'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : tAdmin('errors.save'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <AdminCard
        variant="default"
        padding="md"
        className={cn('border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20')}
      >
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
          <div className="text-sm text-primary-800 dark:text-primary-200">
            <p className="mb-1 font-medium">{t('info.title')}</p>
            <p>{t('info.description')}</p>
          </div>
        </div>
      </AdminCard>

      {/* Subscription Plans */}
      <AdminCard
        title={t('plans.title')}
        description={t('plans.description')}
        variant="default"
        padding="md"
      >
        <div className="space-y-6">
          {/* PLUS Plan */}
          <div
            className={cn(
              'rounded-lg border p-4',
              darkModeClasses.border.base,
              darkModeClasses.card.base
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className={cn('text-lg font-semibold', darkModeClasses.text.primary)}>
                  {t('plans.plus.name')}
                </h3>
                <p className={cn('mt-1 text-sm', darkModeClasses.text.secondary)}>
                  {plans.plus.description || t('plans.plus.description')}
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-2xl font-bold', darkModeClasses.text.primary)}>
                  €{plans.plus.price}
                </p>
                <p className={cn('text-xs', darkModeClasses.text.tertiary)}>
                  /{t(`plans.interval.${plans.plus.interval}`)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', darkModeClasses.text.secondary)}>
                  {t('plans.credits.label')}
                </span>
                <span className={cn('font-medium', darkModeClasses.text.primary)}>
                  {plans.plus.credits === 'unlimited'
                    ? t('plans.credits.unlimited')
                    : t('plans.credits.monthly', { count: plans.plus.credits })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', darkModeClasses.text.secondary)}>
                  {t('plans.stripePriceId')}
                </span>
                <span className={cn('font-mono text-xs', darkModeClasses.text.tertiary)}>
                  {plans.plus.stripePriceId || t('plans.notConfigured')}
                </span>
              </div>
            </div>
          </div>

          {/* PRO Plan */}
          <div
            className={cn(
              'rounded-lg border p-4',
              darkModeClasses.border.base,
              darkModeClasses.card.base
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className={cn('text-lg font-semibold', darkModeClasses.text.primary)}>
                  {t('plans.pro.name')}
                </h3>
                <p className={cn('mt-1 text-sm', darkModeClasses.text.secondary)}>
                  {plans.pro.description || t('plans.pro.description')}
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-2xl font-bold', darkModeClasses.text.primary)}>
                  €{plans.pro.price}
                </p>
                <p className={cn('text-xs', darkModeClasses.text.tertiary)}>
                  /{t(`plans.interval.${plans.pro.interval}`)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', darkModeClasses.text.secondary)}>
                  {t('plans.credits.label')}
                </span>
                <span className={cn('font-medium', darkModeClasses.text.primary)}>
                  {plans.pro.credits === 'unlimited'
                    ? t('plans.credits.unlimited')
                    : t('plans.credits.monthly', { count: plans.pro.credits })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-sm', darkModeClasses.text.secondary)}>
                  {t('plans.stripePriceId')}
                </span>
                <span className={cn('font-mono text-xs', darkModeClasses.text.tertiary)}>
                  {plans.pro.stripePriceId || t('plans.notConfigured')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Credit Packs */}
      <AdminCard
        title={t('credits.title')}
        description={t('credits.description', { count: creditPacks.length })}
        variant="default"
        padding="md"
      >
        <div className="space-y-3">
          {creditPacks.map((pack: any) => (
            <div
              key={pack.id}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4',
                darkModeClasses.border.base,
                darkModeClasses.card.base
              )}
            >
              <div>
                <p className={cn('font-medium', darkModeClasses.text.primary)}>
                  {t('credits.label', { count: pack.credits })}
                </p>
                <p className={cn('text-sm', darkModeClasses.text.secondary)}>
                  {pack.description || t('credits.placeholder')}
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-lg font-bold', darkModeClasses.text.primary)}>
                  €{pack.price}
                </p>
                {pack.stripePriceId && (
                  <p className={cn('font-mono text-xs', darkModeClasses.text.tertiary)}>
                    {pack.stripePriceId.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {error && <p className={cn('text-sm', 'text-red-600 dark:text-red-400')}>{error}</p>}
        {success && (
          <p className={cn('text-sm', 'text-green-600 dark:text-green-400')}>{success}</p>
        )}
        <Button onClick={handleSave} disabled={isSaving} icon={Save}>
          {isSaving ? t('actions.saving') : t('actions.save')}
        </Button>
      </div>
    </div>
  );
}
