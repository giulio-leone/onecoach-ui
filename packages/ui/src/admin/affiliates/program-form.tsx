'use client';

import { useTranslations } from 'next-intl';
/**
 * Affiliate Program Form Component
 *
 * Form per configurazione programma affiliazioni
 * Massive rewamp: design moderno, componenti condivisi, struttura ottimizzata
 * Principi: KISS, SOLID, DRY, YAGNI
 */
import { useEffect, useMemo, useRef } from 'react';
import { AdminCard } from '..';
import { Button } from '../../button';
import { Input } from '../../input';
import { Checkbox } from '../../checkbox';
import { useForm } from '@giulio-leone/hooks';
import { handleApiError } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';
import { Layers, Coins, Calendar, Percent } from 'lucide-react';
const darkModeClasses = {
  text: {
    primary: 'text-neutral-900 dark:text-neutral-50',
    secondary: 'text-neutral-600 dark:text-neutral-300',
    tertiary: 'text-neutral-500 dark:text-neutral-400',
  },
  border: {
    base: 'border-neutral-200 dark:border-neutral-700',
  },
  card: {
    elevated: 'shadow-lg dark:shadow-none',
  },
};
export interface AffiliateProgramFormState {
  id?: string;
  name: string;
  isActive: boolean;
  registrationCredit: number;
  baseCommissionRate: number;
  maxLevels: number;
  rewardPendingDays: number;
  subscriptionGraceDays: number;
  lifetimeCommissions: boolean;
  levels: Array<{
    level: number;
    commissionRate: number;
    creditReward: number;
  }>;
}
interface ProgramFormProps {
  program: AffiliateProgramFormState | null;
}
function buildLevels(levels: AffiliateProgramFormState['levels'], maxLevels: number) {
  const levelMap = new Map(levels.map((level) => [level.level, level]));
  const normalized: AffiliateProgramFormState['levels'] = [];
  for (let i = 1; i <= Math.max(1, maxLevels); i += 1) {
    const existing = levelMap.get(i);
    normalized.push({
      level: i,
      commissionRate: existing?.commissionRate ?? 0,
      creditReward: existing?.creditReward ?? 0,
    });
  }
  return normalized;
}
export function AffiliateProgramForm({ program }: ProgramFormProps) {
  const t = useTranslations('admin');
  const initialState: AffiliateProgramFormState = useMemo(
    () =>
      program ?? {
        name: 'Programma Affiliati',
        isActive: false,
        registrationCredit: 0,
        baseCommissionRate: 0.1,
        maxLevels: 1,
        rewardPendingDays: 14,
        subscriptionGraceDays: 3,
        lifetimeCommissions: true,
        levels: [{ level: 1, commissionRate: 0.1, creditReward: 0 }],
      },
    [program]
  );
  const form = useForm({
    initialValues: {
      ...initialState,
      levels: buildLevels(initialState.levels, initialState.maxLevels),
    },
    onSubmit: async (values: AffiliateProgramFormState) => {
      const response = await fetch('/api/admin/affiliates/program', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: program?.id,
          name: values.name,
          isActive: values.isActive,
          registrationCredit: values.registrationCredit,
          baseCommissionRate: values.baseCommissionRate,
          maxLevels: values.maxLevels,
          rewardPendingDays: values.rewardPendingDays,
          subscriptionGraceDays: values.subscriptionGraceDays,
          lifetimeCommissions: values.lifetimeCommissions,
          levels: values.levels.map((level: AffiliateProgramFormState['levels'][number]) => ({
            level: level.level,
            commissionRate: level.commissionRate,
            creditReward: level.creditReward,
          })),
        }),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      // Reload page after successful save
      window.location.reload();
    },
    validateOnBlur: false,
  });
  // Track previous maxLevels to avoid unnecessary updates
  const prevMaxLevelsRef = useRef(form.values.maxLevels);
  // Rebuild levels when maxLevels changes
  useEffect(() => {
    const currentMaxLevels = form.values.maxLevels;
    // Only rebuild if maxLevels actually changed
    if (prevMaxLevelsRef.current !== currentMaxLevels) {
      prevMaxLevelsRef.current = currentMaxLevels;
      form.setValue('levels', buildLevels(form.values.levels, currentMaxLevels));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.maxLevels, form.setValue]);
  const handleLevelChange = (
    index: number,
    field: 'commissionRate' | 'creditReward',
    value: string
  ) => {
    const parsed = field === 'creditReward' ? parseInt(value, 10) : parseFloat(value);
    const newLevels = [...form.values.levels];
    const current = newLevels[index];
    if (!current) return;
    newLevels[index] = {
      ...current,
      [field]: Number.isFinite(parsed) ? parsed : 0,
    };
    form.setValue('levels', newLevels);
  };
  const formError = (form.errors as Record<string, string> | undefined)?._form;
  const isSubmitting = form.isSubmitting;
  return (
    <form onSubmit={form.handleSubmit} className="space-y-6 overflow-x-hidden">
      {formError && (
        <div
          className={cn(
            'rounded-lg border p-4 text-sm',
            'border-red-200 bg-red-50 text-red-600',
            'dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
          )}
        >
          {formError}
        </div>
      )}
      {/* General Settings */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn('mb-1 block text-sm font-medium', darkModeClasses.text.secondary)}>
              {t('admin.program_form.nome_programma')}
            </label>
            <Input
              value={form.values.name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('name', event.target.value)
              }
              onBlur={form.handleBlur('name')}
              required
              aria-invalid={!!form.errors.name}
            />
            {form.errors.name && form.touched.name && (
              <p className={cn('mt-1 text-xs', 'text-red-600 dark:text-red-400')}>
                {form.errors.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="affiliate-active"
              label={t('admin.program_form.programma_attivo')}
              checked={form.values.isActive}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('isActive', event.target.checked)
              }
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn('mb-1 block text-sm font-medium', darkModeClasses.text.secondary)}>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                {t('admin.program_form.crediti_per_registrazione')}
              </div>
            </label>
            <Input
              type="number"
              min={0}
              value={form.values.registrationCredit}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('registrationCredit', parseInt(event.target.value, 10) || 0)
              }
            />
            <p className={cn('mt-1 text-xs', darkModeClasses.text.tertiary)}>
              {t('admin.program_form.crediti_riconosciuti_al_referrer_per_una')}
            </p>
          </div>
          <div>
            <label className={cn('mb-1 block text-sm font-medium', darkModeClasses.text.secondary)}>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                {t('admin.program_form.commissione_base_decimale')}
              </div>
            </label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.values.baseCommissionRate}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('baseCommissionRate', parseFloat(event.target.value) || 0)
              }
            />
            <p className={cn('mt-1 text-xs', darkModeClasses.text.tertiary)}>
              {t('admin.program_form.aliquota_predefinita_applicata_se_un_liv')}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn('mb-1 block text-sm font-medium', darkModeClasses.text.secondary)}>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {t('admin.program_form.livelli_supportati')}
              </div>
            </label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.values.maxLevels}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue(
                  'maxLevels',
                  Math.max(1, Math.min(5, parseInt(event.target.value, 10) || 1))
                )
              }
            />
            <p className={cn('mt-1 text-xs', darkModeClasses.text.tertiary)}>
              {t('admin.program_form.numero_massimo_di_livelli_multi_tier_att')}
            </p>
          </div>
          <div>
            <label className={cn('mb-1 block text-sm font-medium', darkModeClasses.text.secondary)}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('admin.program_form.pending_rewards_giorni')}
              </div>
            </label>
            <Input
              type="number"
              min={0}
              value={form.values.rewardPendingDays}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue(
                  'rewardPendingDays',
                  Math.max(0, parseInt(event.target.value, 10) || 0)
                )
              }
            />
            <p className={cn('mt-1 text-xs', darkModeClasses.text.tertiary)}>
              {t('admin.program_form.periodo_minimo_prima_che_una_reward_dive')}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn('mb-1 block text-sm font-medium', darkModeClasses.text.secondary)}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('admin.program_form.grace_period_abbonamento_giorni')}
              </div>
            </label>
            <Input
              type="number"
              min={0}
              value={form.values.subscriptionGraceDays}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue(
                  'subscriptionGraceDays',
                  Math.max(0, parseInt(event.target.value, 10) || 0)
                )
              }
            />
            <p className={cn('mt-1 text-xs', darkModeClasses.text.tertiary)}>
              {t('admin.program_form.giorni_di_tolleranza_dopo_la_cancellazio')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="lifetime-commissions"
              label={t('admin.program_form.commissioni_lifetime_fino_alla_cancellaz')}
              checked={form.values.lifetimeCommissions}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('lifetimeCommissions', event.target.checked)
              }
            />
          </div>
        </div>
      </div>
      {/* Level Configuration */}
      <AdminCard
        title={t('admin.program_form.configurazione_livelli')}
        variant="default"
        padding="md"
        className="overflow-hidden"
      >
        <div className="space-y-4">
          {form.values.levels.map(
            (level: AffiliateProgramFormState['levels'][number], index: number) => (
              <div
                key={level.level}
                className={cn(
                  'rounded-lg border p-4',
                  darkModeClasses.card.elevated,
                  darkModeClasses.border.base
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('rounded-lg p-2', 'bg-blue-100 dark:bg-blue-900/30')}>
                      <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className={cn('text-sm font-semibold', darkModeClasses.text.primary)}>
                      Livello {level.level}
                    </p>
                  </div>
                  <span className={cn('text-xs', darkModeClasses.text.tertiary)}>
                    {t('admin.program_form.override_parametri_specifici')}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      className={cn(
                        'mb-1 block text-xs font-medium',
                        darkModeClasses.text.secondary
                      )}
                    >
                      {t('admin.program_form.commissione_decimale')}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={level.commissionRate}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleLevelChange(index, 'commissionRate', event.target.value)
                      }
                    />
                    <p className={cn('mt-1 text-[11px]', darkModeClasses.text.tertiary)}>
                      {t('admin.program_form.immetti_valore_decimale_es_0_05_5')}
                    </p>
                  </div>
                  <div>
                    <label
                      className={cn(
                        'mb-1 block text-xs font-medium',
                        darkModeClasses.text.secondary
                      )}
                    >
                      {t('admin.program_form.crediti_bonus')}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={level.creditReward}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleLevelChange(index, 'creditReward', event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </AdminCard>
      {/* Submit Section */}
      <AdminCard
        variant="default"
        padding="md"
        className={cn('border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20')}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn('text-sm font-medium', 'text-blue-900 dark:text-blue-100')}>
              {t('admin.program_form.ricordati_di_salvare_le_modifiche')}
            </p>
            <p className={cn('mt-0.5 text-xs', 'text-blue-800 dark:text-blue-200')}>
              {t('admin.program_form.le_modifiche_verranno_applicate_immediat')}
            </p>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !form.isValid}
            className="min-w-[160px]"
            variant="primary"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Salvataggio...
              </span>
            ) : (
              'Salva configurazione'
            )}
          </Button>
        </div>
      </AdminCard>
    </form>
  );
}
