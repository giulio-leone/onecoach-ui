'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Button, Input, Checkbox } from '@giulio-leone/ui';
import { useReferralTracking } from 'hooks/use-referral-tracking';
import { useFeatureFlag } from '@giulio-leone/hooks/useFeatureFlag';
import { useForm } from '@giulio-leone/hooks';
import { isValidEmail, validatePassword, passwordsMatch } from '@giulio-leone/lib-shared';
import { handleApiError } from '@giulio-leone/lib-shared';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  invitationCode?: string;
  privacyConsent: boolean;
  termsConsent: boolean;
  [key: string]: unknown;
}

interface RegisterFormProps {
  from?: string;
}

function RegisterFormContent({ from = '/dashboard' }: RegisterFormProps) {
  const t = useTranslations('auth');

  const {
    referralCode,
    isValid: isReferralValid,
    isChecking: isCheckingReferral,
    error: referralError,
    setReferralCode,
  } = useReferralTracking();

  // Controlla se le registrazioni tramite invito sono abilitate
  const [isInvitationRegistrationEnabled, isLoadingInvitationFlag] = useFeatureFlag(
    'ENABLE_INVITATION_REGISTRATION',
    { defaultValue: false }
  );

  const [invitationCode, setInvitationCode] = useState('');
  const [isInvitationValid, setIsInvitationValid] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);

  // Reset invitation code quando il flag viene disabilitato
  useEffect(() => {
    if (!isInvitationRegistrationEnabled) {
      setInvitationCode('');
      setIsInvitationValid(false);
      setInvitationError(null);
    }
  }, [isInvitationRegistrationEnabled]);

  const validateInvitation = async (code: string) => {
    if (!code) {
      setIsInvitationValid(false);
      setInvitationError(null);
      return;
    }

    setIsCheckingInvitation(true);
    setInvitationError(null);

    try {
      const response = await fetch('/api/invitations/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.isValid) {
        setIsInvitationValid(true);
        setInvitationError(null);
      } else {
        setIsInvitationValid(false);
        setInvitationError(data.error || t('validation.invitationInvalid'));
      }
    } catch (_error: unknown) {
      setIsInvitationValid(false);
      setInvitationError(t('validation.invitationCheckError'));
    } finally {
      setIsCheckingInvitation(false);
    }
  };

  const form = useForm<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      invitationCode: '',
      privacyConsent: false,
      termsConsent: false,
    },
    onSubmit: async (values) => {
      // Chiama API di registrazione
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          referralCode: referralCode?.trim() || undefined,
          invitationCode:
            isInvitationRegistrationEnabled && invitationCode?.trim()
              ? invitationCode.trim()
              : undefined,
          privacyConsent: values.privacyConsent,
          termsConsent: values.termsConsent,
        }),
      });

      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }

      const data = await response.json();

      // Mostra notifica successo con info referral se applicato
      if (data.affiliateInfo?.referralApplied && data.affiliateInfo.creditReward) {
        sessionStorage.setItem(
          'affiliate_registration_success',
          JSON.stringify({
            creditReward: data.affiliateInfo.creditReward,
            pendingDays: 14,
          })
        );
      }

      // Auto-login dopo registrazione
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: from,
      });

      if (result?.error) {
        throw new Error(t('validation.registrationError'));
      }

      // Dopo login riuscito, fai redirect con refresh completo
      if (result?.ok) {
        // Usa window.location.href per un refresh completo della pagina
        // Questo è necessario perché:
        // 1. NextAuth crea la sessione JWT nel cookie
        // 2. Il layout protetto chiama getCurrentUser() che legge il cookie server-side
        // 3. router.push() non forza un refresh completo, quindi il cookie potrebbe non essere disponibile
        // 4. window.location.href forza un refresh completo che garantisce la sincronizzazione
        window.location.href = from;
      }
    },
    validate: {
      name: (value: string) => (!value ? t('validation.nameRequired') : null),
      email: (value: string) =>
        !value
          ? t('validation.emailRequired')
          : !isValidEmail(value)
            ? t('validation.emailInvalid')
            : null,
      password: (value: string) => {
        if (!value) return t('validation.passwordRequired');
        const validation = validatePassword(value, { minLength: 8 });
        return validation.valid ? null : validation.errors[0] || null;
      },
      confirmPassword: (value: string, allValues: RegisterFormValues | undefined) => {
        if (!value) return t('validation.confirmPasswordRequired');
        return !passwordsMatch(allValues?.password || '', value)
          ? t('validation.passwordsMismatch')
          : null;
      },
      privacyConsent: (value: boolean) => (!value ? t('validation.privacyRequired') : null),
      termsConsent: (value: boolean) => (!value ? t('validation.termsRequired') : null),
    } as any,
    validateOnBlur: true,
  });

  const formError = (form.errors as Record<string, string | undefined>)._form;

  return (
    <form onSubmit={form.handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
      {/* Error message */}
      {formError && (
        <div
          id="register-error"
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {formError}
        </div>
      )}

      {/* Name field */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('register_form.nome')}
        </label>
        <Input
          id="name"
          type="text"
          placeholder={t('register_form.il_tuo_nome')}
          value={form.values.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('name', e.target.value)
          }
          onBlur={form.handleBlur('name')}
          disabled={form.isSubmitting}
          autoComplete="name"
          className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          aria-invalid={!!form.errors.name}
          aria-describedby={form.errors.name ? 'name-error' : undefined}
        />
        {form.errors.name && form.touched.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.name}
          </p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('register_form.email')}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('register_form.il_tuo_email_com')}
          value={form.values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('email', e.target.value)
          }
          onBlur={form.handleBlur('email')}
          required
          disabled={form.isSubmitting}
          autoComplete="email"
          className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          aria-invalid={!!form.errors.email}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
        />
        {form.errors.email && form.touched.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.email}
          </p>
        )}
      </div>

      {/* Referral Code field */}
      <div>
        <label
          htmlFor="referralCode"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('register_form.codice_referral_opzionale')}
        </label>
        <div className="relative">
          <Input
            id="referralCode"
            type="text"
            placeholder={t('register_form.il_tuo_codice_referral')}
            value={referralCode || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferralCode(e.target.value)}
            disabled={form.isSubmitting}
            autoComplete="off"
            className={
              referralCode
                ? isReferralValid
                  ? 'border-green-300 focus:border-green-500'
                  : referralError
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-yellow-300 focus:border-yellow-500'
                : ''
            }
            aria-describedby={
              referralError
                ? 'referral-error'
                : referralCode && isReferralValid
                  ? 'referral-success'
                  : undefined
            }
          />
          {isCheckingReferral && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
          {referralCode && !isCheckingReferral && isReferralValid && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <span className="text-green-600">✓</span>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500" id="referral-help">
          {t('register_form.inserisci_un_codice_referral_per_ricever')}
        </p>
        {referralError && (
          <p className="mt-1 text-xs text-red-600" id="referral-error">
            {t('auth.referral_code_non_valido')}
          </p>
        )}
        {referralCode && !isCheckingReferral && isReferralValid && (
          <p className="mt-1 text-xs text-green-600" id="referral-success">
            {t('register_form.codice_referral_valido_riceverai_crediti')}
          </p>
        )}
      </div>

      {/* Invitation Code field - mostrato solo se abilitato */}
      {!isLoadingInvitationFlag && isInvitationRegistrationEnabled && (
        <div>
          <label
            htmlFor="invitationCode"
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {t('register_form.codice_invito_opzionale')}
          </label>
          <div className="relative">
            <Input
              id="invitationCode"
              type="text"
              placeholder={t('register_form.codice_invito')}
              value={invitationCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setInvitationCode(e.target.value.toUpperCase());
                if (e.target.value.length >= 3) {
                  validateInvitation(e.target.value.toUpperCase());
                } else {
                  setIsInvitationValid(false);
                  setInvitationError(null);
                }
              }}
              onBlur={() => validateInvitation(invitationCode)}
              disabled={form.isSubmitting}
              autoComplete="off"
              className={
                invitationCode
                  ? isInvitationValid
                    ? 'border-green-300 focus:border-green-500'
                    : invitationError
                      ? 'border-red-300 focus:border-red-500'
                      : ''
                  : ''
              }
            />
            {isCheckingInvitation && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
            {invitationCode && !isCheckingInvitation && isInvitationValid && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <span className="text-green-600">✓</span>
              </div>
            )}
          </div>
          {invitationError && <p className="mt-1 text-xs text-red-600">{invitationError}</p>}
          {invitationCode && !isCheckingInvitation && isInvitationValid && (
            <p className="mt-1 text-xs text-green-600">{t('register_form.codice_invito_valido')}</p>
          )}
        </div>
      )}

      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('register_form.password')}
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={form.values.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('password', e.target.value)
          }
          onBlur={form.handleBlur('password')}
          required
          disabled={form.isSubmitting}
          autoComplete="new-password"
          className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          aria-invalid={!!form.errors.password}
          aria-describedby={form.errors.password ? 'password-error' : undefined}
        />
        {form.errors.password && form.touched.password ? (
          <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.password}
          </p>
        ) : (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            {t('register_form.minimo_8_caratteri')}
          </p>
        )}
      </div>

      {/* Confirm Password field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('register_form.conferma_password')}
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={form.values.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('confirmPassword', e.target.value)
          }
          onBlur={form.handleBlur('confirmPassword')}
          required
          disabled={form.isSubmitting}
          autoComplete="new-password"
          className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          aria-invalid={!!form.errors.confirmPassword}
          aria-describedby={form.errors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        {form.errors.confirmPassword && form.touched.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Privacy Policy Consent */}
      <div>
        <Checkbox
          id="privacyConsent"
          checked={form.values.privacyConsent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('privacyConsent', e.target.checked)}
          onBlur={form.handleBlur('privacyConsent')}
          disabled={form.isSubmitting}
          error={!!form.errors.privacyConsent && form.touched.privacyConsent}
          errorMessage={form.errors.privacyConsent as string}
          label={
            <span>
              {t('register_form.accetto_la')}{' '}
              <a
                href="/policy/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline hover:text-blue-700"
                onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
              >
                {t('register_form.privacy_policy')}
              </a>{' '}
              *
            </span>
          }
        />
      </div>

      {/* Terms and Conditions Consent */}
      <div>
        <Checkbox
          id="termsConsent"
          checked={form.values.termsConsent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setValue('termsConsent', e.target.checked)}
          onBlur={form.handleBlur('termsConsent')}
          disabled={form.isSubmitting}
          error={!!form.errors.termsConsent && form.touched.termsConsent}
          errorMessage={form.errors.termsConsent as string}
          label={
            <span>
              {t('register_form.accetto_i')}{' '}
              <a
                href="/policy/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline hover:text-blue-700"
                onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
              >
                {t('register_form.termini_e_condizioni')}
              </a>{' '}
              *
            </span>
          }
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        disabled={form.isSubmitting}
        className="w-full focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
      >
        {form.isSubmitting
          ? t('register_form.registrazione_in_corso')
          : t('register_form.registrati')}
      </Button>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-300 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900">
            {t('register_form.oppure')}
          </span>
        </div>
      </div>

      {/* Social login placeholder */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full border-neutral-300 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
          disabled
          aria-disabled="true"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mr-2 h-5 w-5 flex-shrink-0"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('register_form.continua_con_google')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full border-neutral-300 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
          disabled
          aria-disabled="true"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mr-2 h-5 w-5 flex-shrink-0"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {t('register_form.continua_con_apple')}
        </Button>
      </div>

      <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-500">
        {t('register_form.social_login_disponibile_a_breve')}
      </p>

      {/* Info */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
        <p>{t('register_form.ricevi_100_crediti_di_benvenuto_alla_reg')}</p>
      </div>
    </form>
  );
}

export function RegisterForm({ from }: RegisterFormProps) {
  return <RegisterFormContent from={from} />;
}
