'use client';

import { useTranslations } from 'next-intl';
/**
 * User Detail Modal Component
 *
 * Modal per visualizzare e modificare dettagli utente
 */
import { Plus, Minus, Save } from 'lucide-react';
import { Button, Input, Modal, ModalFooter } from '@giulio-leone/ui';
import { UserApiKeys } from './user-api-keys';
import { useForm } from '@giulio-leone/hooks';
import { handleApiError } from '@giulio-leone/lib-shared';
// AdminSelect is a simple styled select component
const AdminSelect = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
  >
    {children}
  </select>
);
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { useSyncField } from '@giulio-leone/lib-stores';
import { useEffect, useState, useCallback, useRef } from 'react';
interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  credits: number;
  createdAt: Date;
  _count: {
    workout_programs: number;
    nutrition_plans: number;
    subscriptions: number;
  };
}
interface UserDetailModalProps {
  isOpen: boolean;
  user: UserData | null;
  onClose: () => void;
  onSuccess?: () => void;
}
/* interface UserFormValues {
  email: string;
  name: string;
  password: string;
  role: string;
  status: string;
  credits: number;
  creditAdjustment: number;
  reason: string;
} */
export function UserDetailModal({ isOpen, user, onClose, onSuccess }: UserDetailModalProps) {
  const t = useTranslations('admin');

  // Stato locale per i crediti che viene aggiornato da Realtime
  const [currentCredits, setCurrentCredits] = useState(user?.credits || 0);
  // Track previous user credits to sync state when prop changes
  const prevUserCreditsRef = useRef(user?.credits);
  // Sync credits when user prop changes (avoiding direct setState in useEffect)
  /* eslint-disable react-hooks/set-state-in-effect -- sync prop to state on external change */
  useEffect(() => {
    if (user?.credits !== undefined && user.credits !== prevUserCreditsRef.current) {
      prevUserCreditsRef.current = user.credits;
      setCurrentCredits(user.credits);
    }
  }, [user?.credits]);
  /* eslint-enable react-hooks/set-state-in-effect */
  // Callback per sync dei crediti via Realtime
  const handleCreditsSync = useCallback(
    (newCredits: number | null) => {
      if (typeof newCredits === 'number' && newCredits !== currentCredits) {
        setCurrentCredits(newCredits);
      }
    },
    [currentCredits]
  );
  // Usa lo store Zustand centralizzato per sync dei crediti
  useSyncField<{ credits: number | null }, 'credits'>({
    table: 'users',
    filter: user ? `id=eq.${user.id}` : undefined,
    enabled: !!user && isOpen,
    field: 'credits',
    currentValue: currentCredits,
    onSync: handleCreditsSync,
  });
  const form = useForm({
    initialValues: {
      email: user?.email || '',
      name: user?.name || '',
      password: '',
      role: user?.role || 'USER',
      status: user?.status || 'ACTIVE',
      credits: currentCredits,
      creditAdjustment: 0,
      reason: '',
    },
    onSubmit: async (values: any) => {
      if (!user) {
        throw new Error('User is required');
      }
      // Update credits if changed (use old API for credits)
      if (values.creditAdjustment !== 0) {
        const response = await fetch(`/api/admin/users/${user.id}/credits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: values.creditAdjustment,
            reason: values.reason,
          }),
        });
        if (!response.ok) {
          const error = await handleApiError(response);
          throw error;
        }
      }
      // Update user data using new PATCH API
      const updateData: {
        email?: string;
        name?: string;
        password?: string;
        role?: string;
        status?: string;
        credits?: number;
      } = {};
      if (values.email !== user.email) {
        updateData.email = values.email;
      }
      if (values.name !== (user.name || '')) {
        updateData.name = values.name;
      }
      if (values.password) {
        updateData.password = values.password;
      }
      if (values.role !== user.role) {
        updateData.role = values.role;
      }
      if (values.status !== user.status) {
        updateData.status = values.status;
      }
      if (values.credits !== user.credits) {
        updateData.credits = values.credits;
      }
      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) {
          const error = await handleApiError(response);
          throw error;
        }
      }
      // Call onSuccess callback (for data refresh) then close modal
      onSuccess?.();
      onClose();
    },
    validate: {
      reason: (value: any, allValues: any) => {
        if (
          allValues &&
          typeof allValues === 'object' &&
          'creditAdjustment' in allValues &&
          typeof allValues.creditAdjustment === 'number' &&
          allValues.creditAdjustment !== 0 &&
          !value
        ) {
          return 'Inserisci una motivazione per la modifica crediti';
        }
        return null;
      },
    },
    validateOnBlur: false,
  });
  if (!user) {
    return null;
  }
  const hasChanges =
    form.values.creditAdjustment !== 0 ||
    form.values.status !== user.status ||
    form.values.email !== user.email ||
    form.values.name !== (user.name || '') ||
    form.values.password !== '' ||
    form.values.role !== user.role ||
    form.values.credits !== user.credits;
  const formError =
    form.errors && typeof form.errors === 'object' && '_form' in form.errors
      ? (form.errors._form as string | undefined)
      : undefined;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.user_detail_modal.dettagli_utente')}
      size="lg"
    >
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
      <form onSubmit={form.handleSubmit}>
        <div className="space-y-6">
          {/* Error */}
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {formError}
            </div>
          )}
          {/* Admin/Super Admin Edge Config Notice */}
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <p className="font-medium">
                {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}{' '}
                {t('admin.user_detail_modal.sincronizzazione_edge_config')}
              </p>
              <p className="mt-1 text-xs">
                {t('admin.user_detail_modal.le_modifiche_a_email_password_nome_e_cre')}
              </p>
            </div>
          )}
          {/* User info - Editable */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <Input
                type="email"
                value={form.values.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('email', e.target.value)
                }
                disabled={form.isSubmitting}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nome
              </label>
              <Input
                type="text"
                value={form.values.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('name', e.target.value)
                }
                disabled={form.isSubmitting}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.user_detail_modal.password_lascia_vuoto_per_non_modificare')}
              </label>
              <Input
                type="password"
                value={form.values.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('password', e.target.value)
                }
                placeholder={t('admin.user_detail_modal.nuova_password')}
                disabled={form.isSubmitting}
              />
            </div>
            <div>
              <label
                className={cn('mb-2 block text-sm font-medium', darkModeClasses.text.secondary)}
              >
                Ruolo
              </label>
              <AdminSelect
                value={form.values.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  form.setValue('role', e.target.value)
                }
                disabled={form.isSubmitting}
                className="w-full"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">{t('admin.user_detail_modal.super_admin')}</option>
                <option value="COACH">Coach</option>
              </AdminSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.user_detail_modal.data_registrazione')}
              </label>
              <p className="mt-1 text-neutral-900 dark:text-neutral-100">
                {new Date(user.createdAt).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Abbonamenti
              </label>
              <p className="mt-1 text-neutral-900 dark:text-neutral-100">
                {user._count.subscriptions} {t('admin.user_detail_modal.attivo_i')}
              </p>
            </div>
          </div>
          {/* Status */}
          <div>
            <label className={cn('mb-2 block text-sm font-medium', darkModeClasses.text.secondary)}>
              {t('admin.user_detail_modal.status_utente')}
            </label>
            <AdminSelect
              value={form.values.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                form.setValue('status', e.target.value)
              }
              disabled={form.isSubmitting}
              className="w-full"
            >
              <option value="ACTIVE">Attivo</option>
              <option value="SUSPENDED">Sospeso</option>
              <option value="DELETED">Eliminato</option>
            </AdminSelect>
          </div>
          {/* Credits */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h4 className="mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
              {t('admin.user_detail_modal.gestione_crediti')}
            </h4>
            <div className="space-y-4">
              {/* Current credits */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t('admin.user_detail_modal.crediti_attuali')}
                </label>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {currentCredits}
                </p>
                {currentCredits !== user.credits && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    {t('admin.user_detail_modal.aggiornato_in_tempo_reale')}
                  </p>
                )}
              </div>
              {/* Adjustment */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {t('admin.user_detail_modal.modifica_crediti')}
                </label>
                {/* Responsive grid: 2 cols on mobile, 5 cols on desktop */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <Button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'creditAdjustment',
                        Math.max(form.values.creditAdjustment - 100, -1000)
                      )
                    }
                    variant="secondary"
                    disabled={form.isSubmitting}
                    className="sm:order-1"
                  >
                    <Minus className="h-4 w-4" />
                    100
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'creditAdjustment',
                        Math.max(form.values.creditAdjustment - 10, -1000)
                      )
                    }
                    variant="secondary"
                    disabled={form.isSubmitting}
                    className="sm:order-2"
                  >
                    <Minus className="h-4 w-4" />
                    10
                  </Button>
                  <Input
                    type="number"
                    value={form.values.creditAdjustment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      form.setValue('creditAdjustment', parseInt(e.target.value) || 0)
                    }
                    className="col-span-2 text-center sm:order-3 sm:col-span-1"
                    disabled={form.isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'creditAdjustment',
                        Math.min(form.values.creditAdjustment + 10, 10000)
                      )
                    }
                    variant="secondary"
                    disabled={form.isSubmitting}
                    className="sm:order-4"
                  >
                    <Plus className="h-4 w-4" />
                    10
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'creditAdjustment',
                        Math.min(form.values.creditAdjustment + 100, 10000)
                      )
                    }
                    variant="secondary"
                    disabled={form.isSubmitting}
                    className="sm:order-5"
                  >
                    <Plus className="h-4 w-4" />
                    100
                  </Button>
                </div>
                {form.values.creditAdjustment !== 0 && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {t('admin.user_detail_modal.nuovo_saldo')}{' '}
                    <span className="font-semibold">
                      {currentCredits + form.values.creditAdjustment}
                    </span>
                  </p>
                )}
              </div>
              {/* Reason */}
              {form.values.creditAdjustment !== 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {t('admin.user_detail_modal.motivazione')}
                  </label>
                  <Input
                    type="text"
                    placeholder={t('admin.user_detail_modal.es_rimborso_bonus_correzione_errore')}
                    value={form.values.reason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      form.setValue('reason', e.target.value)
                    }
                    onBlur={form.handleBlur('reason')}
                    disabled={form.isSubmitting}
                    aria-invalid={!!form.errors.reason}
                  />
                  {form.errors.reason && form.touched.reason && (
                    <p className="mt-1 text-xs text-red-600">{form.errors.reason}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Activity stats */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h4 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">
              {t('admin.user_detail_modal.statistiche_attivita')}
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t('admin.user_detail_modal.programmi_allenamento')}
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user._count.workout_programs}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t('admin.user_detail_modal.piani_nutrizionali')}
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user._count.nutrition_plans}
                </p>
              </div>
            </div>
          </div>
          {/* API Keys */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <UserApiKeys userId={user.id} />
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={form.isSubmitting}>
            Annulla
          </Button>
          <Button type="submit" disabled={!hasChanges || form.isSubmitting || !form.isValid}>
            {form.isSubmitting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('admin.user_detail_modal.salva_modifiche')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
