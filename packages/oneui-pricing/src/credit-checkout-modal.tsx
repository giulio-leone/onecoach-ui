'use client';

import { useTranslations } from 'next-intl';
/**
 * Credit Checkout Modal
 *
 * Gestisce autenticazione rapida per l'acquisto crediti
 */
import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { X, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Input } from '@onecoach/ui';
import { useForm } from '@onecoach/hooks';
import { isValidEmail, validatePassword, passwordsMatch } from '@onecoach/lib-shared';
import { handleApiError } from '@onecoach/lib-shared';
import type { CreditPackOption } from '@onecoach/types-domain';

export type CheckoutMode = 'login' | 'register' | 'express';
interface CreditCheckoutModalProps {
  open: boolean;
  pack: CreditPackOption | null;
  onClose: () => void;
  onCheckout: () => Promise<void>;
}
interface LoginFormValues {
  email: string;
  password: string;
}
interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface ExpressFormValues {
  email: string;
  password: string;
}
export function CreditCheckoutModal({ open, pack, onClose, onCheckout }: CreditCheckoutModalProps) {
  const t = useTranslations('common');

  const [mode, setMode] = useState<CheckoutMode>('login');
  const [successMessage, setSuccessMessage] = useState('');
  const loginForm = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        throw new Error('Credenziali non valide. Riprova oppure registrati.');
      }
      setSuccessMessage('Accesso effettuato! Reindirizzamento in corso...');
      await onCheckout();
    },
    validate: {
      email: (value) =>
        !value ? 'Email obbligatoria' : !isValidEmail(value) ? "Inserisci un'email valida" : null,
      password: (value) => (!value ? 'Password obbligatoria' : null),
    },
    validateOnBlur: true,
  });
  const registerForm = useForm<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      const loginResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (loginResult?.error) {
        throw new Error('Registrazione completata ma accesso non riuscito.');
      }
      setSuccessMessage('Account creato! Stiamo avviando il checkout...');
      await onCheckout();
    },
    validate: {
      email: (value) =>
        !value ? 'Email obbligatoria' : !isValidEmail(value) ? "Inserisci un'email valida" : null,
      password: (value) => {
        if (!value) return 'Password obbligatoria';
        const validation = validatePassword(value, { minLength: 8 });
        return validation.valid ? null : validation.errors[0];
      },
      confirmPassword: (value, allValues) => {
        if (!value) return 'Conferma password obbligatoria';
        if (!allValues) return null;
        return !passwordsMatch((allValues as RegisterFormValues).password, value)
          ? 'Le password non corrispondono'
          : null;
      },
    },
    validateOnBlur: true,
  });
  const expressForm = useForm<ExpressFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      const loginResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (loginResult?.error) {
        throw new Error('Account creato ma accesso non riuscito. Prova ad accedere manualmente.');
      }
      setSuccessMessage('Fantastico! Avvio il checkout...');
      await onCheckout();
    },
    validate: {
      email: (value) =>
        !value ? 'Email obbligatoria' : !isValidEmail(value) ? "Inserisci un'email valida" : null,
      password: (value) => {
        if (!value) return 'Password obbligatoria';
        if (value.length < 8) return 'La password deve essere di almeno 8 caratteri';
        return null;
      },
    },
    validateOnBlur: true,
  });
  // Reset form when modal opens (clean state for each open)
  // This is a valid use case for setState in effect (resetting form on modal open)
  const previousOpenRef = useRef(open);
  useEffect(() => {
    if (open && !previousOpenRef.current) {
      // Modal just opened, reset state

      // eslint-disable-next-line react-hooks/exhaustive-deps
      setMode('login');
      loginForm.reset();
      registerForm.reset();
      expressForm.reset();
      setSuccessMessage('');
    }
    previousOpenRef.current = open;
  }, [open, loginForm, registerForm, expressForm]);
  if (!open || !pack) {
    return null;
  }
  const getCurrentFormError = () => {
    if (mode === 'login') return (loginForm.errors as any)._form as string | undefined;
    if (mode === 'register') return (registerForm.errors as any)._form as string | undefined;
    if (mode === 'express') return (expressForm.errors as any)._form as string | undefined;
    return undefined;
  };
  const renderSummary = () => (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        <div>
          <p className="text-sm font-medium text-emerald-800">
            {t('common.credit_checkout_modal.pacchetto_selezionato')}
          </p>
          <p className="text-lg font-semibold text-emerald-900">
            {pack.credits} {t('common.credit_checkout_modal.crediti')}
            {pack.price.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-700">
            €{(pack.price / pack.credits).toFixed(3)} {t('common.credit_checkout_modal.credito')}
          </p>
        </div>
      </div>
    </div>
  );
  const renderModeSelector = () => (
    <div className="grid gap-2 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => setMode('login')}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
          mode === 'login'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
            : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        }`}
      >
        {t('common.credit_checkout_modal.ho_gia_un_account')}
      </button>
      <button
        type="button"
        onClick={() => setMode('register')}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
          mode === 'register'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
            : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        }`}
      >
        {t('common.credit_checkout_modal.registrami_ora')}
      </button>
      <button
        type="button"
        onClick={() => setMode('express')}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
          mode === 'express'
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
            : 'border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
        }`}
      >
        {t('common.credit_checkout_modal.checkout_rapido')}
      </button>
    </div>
  );
  const renderLoginForm = () => {
    const formError = (loginForm.errors as any)._form as string | undefined;
    return (
      <form onSubmit={loginForm.handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
            <Input
              type="email"
              placeholder={t('common.credit_checkout_modal.tuo_email_com')}
              value={loginForm.values.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                loginForm.setValue('email', e.target.value.trim())
              }
              onBlur={loginForm.handleBlur('email')}
              className="pl-9"
              disabled={loginForm.isSubmitting}
              autoComplete="email"
              required
              aria-invalid={!!loginForm.errors.email}
            />
          </div>
          {loginForm.errors.email && loginForm.touched.email && (
            <p className="mt-1 text-xs text-red-600">{loginForm.errors.email}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
            <Input
              type="password"
              placeholder="••••••••"
              value={loginForm.values.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                loginForm.setValue('password', e.target.value)
              }
              onBlur={loginForm.handleBlur('password')}
              className="pl-9"
              disabled={loginForm.isSubmitting}
              autoComplete="current-password"
              required
              aria-invalid={!!loginForm.errors.password}
            />
          </div>
          {loginForm.errors.password && loginForm.touched.password && (
            <p className="mt-1 text-xs text-red-600">{loginForm.errors.password}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loginForm.isSubmitting || !loginForm.isValid}
        >
          {loginForm.isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t('common.credit_checkout_modal.verifico_le_credenziali')}</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <span>{t('common.credit_checkout_modal.accedi_e_acquista')}</span>
            </>
          )}
        </Button>
      </form>
    );
  };
  const renderRegisterForm = () => {
    const formError = (registerForm.errors as any)._form as string | undefined;
    return (
      <form onSubmit={registerForm.handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('common.credit_checkout_modal.nome_opzionale')}
          </label>
          <div className="relative">
            <User className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
            <Input
              type="text"
              placeholder={t('common.credit_checkout_modal.il_tuo_nome')}
              value={registerForm.values.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                registerForm.setValue('name', e.target.value)
              }
              className="pl-9"
              disabled={registerForm.isSubmitting}
              autoComplete="name"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
            <Input
              type="email"
              placeholder={t('common.credit_checkout_modal.tuo_email_com')}
              value={registerForm.values.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                registerForm.setValue('email', e.target.value.trim())
              }
              onBlur={registerForm.handleBlur('email')}
              className="pl-9"
              disabled={registerForm.isSubmitting}
              autoComplete="email"
              required
              aria-invalid={!!registerForm.errors.email}
            />
          </div>
          {registerForm.errors.email && registerForm.touched.email && (
            <p className="mt-1 text-xs text-red-600">{registerForm.errors.email}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
              <Input
                type="password"
                placeholder="••••••••"
                value={registerForm.values.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  registerForm.setValue('password', e.target.value)
                }
                onBlur={registerForm.handleBlur('password')}
                className="pl-9"
                disabled={registerForm.isSubmitting}
                autoComplete="new-password"
                required
                aria-invalid={!!registerForm.errors.password}
              />
            </div>
            {registerForm.errors.password && registerForm.touched.password ? (
              <p className="mt-1 text-xs text-red-600">{registerForm.errors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                {t('common.credit_checkout_modal.minimo_8_caratteri')}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('common.credit_checkout_modal.conferma_password')}
            </label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
              <Input
                type="password"
                placeholder="••••••••"
                value={registerForm.values.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  registerForm.setValue('confirmPassword', e.target.value)
                }
                onBlur={registerForm.handleBlur('confirmPassword')}
                className="pl-9"
                disabled={registerForm.isSubmitting}
                autoComplete="new-password"
                required
                aria-invalid={!!registerForm.errors.confirmPassword}
              />
            </div>
            {registerForm.errors.confirmPassword && registerForm.touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{registerForm.errors.confirmPassword}</p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={registerForm.isSubmitting || !registerForm.isValid}
        >
          {registerForm.isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t('common.credit_checkout_modal.creo_il_tuo_account')}</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <span>{t('common.credit_checkout_modal.crea_account_e_acquista')}</span>
            </>
          )}
        </Button>
      </form>
    );
  };
  const renderExpressForm = () => {
    const formError = (expressForm.errors as any)._form as string | undefined;
    return (
      <form onSubmit={expressForm.handleSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t('common.credit_checkout_modal.inserisci_solo_email_e_password_creeremo')}
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
            <Input
              type="email"
              placeholder={t('common.credit_checkout_modal.ospite_email_com')}
              value={expressForm.values.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                expressForm.setValue('email', e.target.value.trim())
              }
              onBlur={expressForm.handleBlur('email')}
              className="pl-9"
              disabled={expressForm.isSubmitting}
              autoComplete="email"
              required
              aria-invalid={!!expressForm.errors.email}
            />
          </div>
          {expressForm.errors.email && expressForm.touched.email && (
            <p className="mt-1 text-xs text-red-600">{expressForm.errors.email}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
            <Input
              type="password"
              placeholder="••••••••"
              value={expressForm.values.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                expressForm.setValue('password', e.target.value)
              }
              onBlur={expressForm.handleBlur('password')}
              className="pl-9"
              disabled={expressForm.isSubmitting}
              autoComplete="new-password"
              required
              aria-invalid={!!expressForm.errors.password}
            />
          </div>
          {expressForm.errors.password && expressForm.touched.password ? (
            <p className="mt-1 text-xs text-red-600">{expressForm.errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {t('common.credit_checkout_modal.potrai_cambiare_la_password_dalla_dashbo')}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={expressForm.isSubmitting || !expressForm.isValid}
        >
          {expressForm.isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t('common.credit_checkout_modal.preparo_il_checkout')}</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <span>{t('common.credit_checkout_modal.continua_al_checkout')}</span>
            </>
          )}
        </Button>
      </form>
    );
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-neutral-100 p-2 text-neutral-500 transition hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-500"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="grid gap-6 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white sm:grid-cols-[1.2fr,1.4fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm tracking-wide text-emerald-100 uppercase">
                {t('common.credit_checkout_modal.acquisto_crediti')}
              </p>
              <h2 className="text-2xl font-bold">
                {t('common.credit_checkout_modal.completa_l_operazione_in_pochi_secondi')}
              </h2>
              <p className="mt-2 text-sm text-emerald-50">
                {t('common.credit_checkout_modal.scegli_come_procedere_puoi_accedere_regi')}
              </p>
            </div>
            {renderSummary()}
            <div className="space-y-2 text-sm text-emerald-100">
              <p>{t('common.credit_checkout_modal.pagamento_sicuro_con_stripe')}</p>
              <p>{t('common.credit_checkout_modal.crediti_disponibili_immediatamente_dopo_')}</p>
              <p>{t('common.credit_checkout_modal.nessuna_scadenza_sui_crediti_acquistati')}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 text-neutral-900 shadow-lg dark:bg-neutral-900 dark:text-neutral-100">
            <div className="mb-4 space-y-3">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {t('common.credit_checkout_modal.scegli_come_accedere')}
              </h3>
              {renderModeSelector()}
            </div>
            {getCurrentFormError() && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {getCurrentFormError()}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}
            <div className="space-y-4">
              {mode === 'login' && renderLoginForm()}
              {mode === 'register' && renderRegisterForm()}
              {mode === 'express' && renderExpressForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
