'use client';

import { useTranslations } from 'next-intl';
/**
 * Login Form Component
 *
 * Form per il login utente
 */
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'app/navigation';
import { Button, Checkbox, Input } from '@giulio-leone/ui';
import { useForm } from '@giulio-leone/hooks';
import { isValidEmail } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}
interface LoginFormProps {
  from?: string;
  /** Feature flag per abilitare/disabilitare login con Google */
  googleLoginEnabled?: boolean;
}
function LoginFormContent({ from = '/dashboard', googleLoginEnabled = true }: LoginFormProps) {
  const t = useTranslations('auth');

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      remember: true,
    },
    onSubmit: async (values) => {
      // Persistenza "remember me"
      try {
        if (values.remember) {
          window.localStorage.setItem('last_login_email', values.email);
        } else {
          window.localStorage.removeItem('last_login_email');
        }
      } catch (_error: unknown) {}
      // Login con gestione errori
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: from,
      });
      if (result?.error) {
        throw new Error('Email o password non validi');
      }
      // Dopo login riuscito, fai redirect con router.push() + router.refresh()
      if (result?.ok) {
        // router.refresh() forza re-fetch dei Server Components per sincronizzare la sessione JWT
        router.push(from);
        router.refresh();
      }
    },
    validate: {
      email: (value) =>
        !value ? 'Email obbligatoria' : !isValidEmail(value) ? "Inserisci un'email valida" : null,
      password: (value) =>
        !value
          ? 'Password obbligatoria'
          : value.length < 6
            ? 'La password deve avere almeno 6 caratteri'
            : null,
    },
    validateOnBlur: true,
  });
  // Prefill email dal localStorage
  useEffect(() => {
    try {
      const last = window.localStorage.getItem('last_login_email');
      if (last) form.setValue('email', last);
    } catch (_error: unknown) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Eseguito solo al mount per precompilare l'email
  const formError = (form.errors as Record<string, string | undefined>)._form;
  return (
    <form onSubmit={form.handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
      {/* Error message */}
      {formError && (
        <div
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {formError}
        </div>
      )}
      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('login_form.il_tuo_email_com')}
          value={form.values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('email', e.target.value)
          }
          onBlur={form.handleBlur('email')}
          required
          disabled={form.isSubmitting}
          autoComplete="email"
          className="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          aria-invalid={!!form.errors.email}
          aria-describedby={form.errors.email ? 'email-error' : undefined}
        />
        {form.errors.email && form.touched.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.email}
          </p>
        )}
      </div>
      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.values.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('password', e.target.value)
            }
            onBlur={form.handleBlur('password')}
            required
            disabled={form.isSubmitting}
            autoComplete="current-password"
            className="pr-11 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
            aria-invalid={!!form.errors.password}
            aria-describedby={form.errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={form.isSubmitting}
            className={cn(
              'absolute inset-y-0 right-0 flex items-center justify-center',
              'w-10 rounded-r-md transition-all duration-200',
              'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700',
              'dark:text-neutral-400 dark:hover:bg-white/[0.06]/50 dark:hover:text-neutral-200',
              'focus-visible:ring-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
              'touch-manipulation'
            )}
            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {form.errors.password && form.touched.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.password}
          </p>
        )}
      </div>
      {/* Extra options */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Checkbox
          id="remember"
          label="Ricordami"
          checked={form.values.remember}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('remember', e.target.checked)
          }
          disabled={form.isSubmitting}
        />
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
          prefetch={false}
        >
          {t('login_form.hai_dimenticato_la_password')}
        </Link>
      </div>
      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        disabled={form.isSubmitting || !form.isValid}
        className="w-full focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
      >
        {form.isSubmitting ? 'Accesso in corso…' : 'Accedi'}
      </Button>
      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-300 dark:border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-500 dark:bg-zinc-950">oppure</span>
        </div>
      </div>
      {/* Social login */}
      <div className={cn('grid gap-3', googleLoginEnabled ? 'sm:grid-cols-2' : 'sm:grid-cols-1')}>
        {/* Google Login - controllato da feature flag */}
        {googleLoginEnabled && (
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.1] dark:hover:bg-white/[0.06]"
            disabled={form.isSubmitting}
            onClick={() => signIn('google', { callbackUrl: from })}
            aria-label="Continua con Google"
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
            {t('login_form.continua_con_google')}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.1] dark:hover:bg-white/[0.06]"
          disabled={form.isSubmitting}
          onClick={() => signIn('apple', { callbackUrl: from })}
          aria-label="Continua con Apple"
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
          {t('login_form.continua_con_apple')}
        </Button>
      </div>
    </form>
  );
}
export function LoginForm({ from, googleLoginEnabled = true }: LoginFormProps) {
  return <LoginFormContent from={from} googleLoginEnabled={googleLoginEnabled} />;
}
