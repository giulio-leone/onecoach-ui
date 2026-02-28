'use client';

import { useTranslations } from 'next-intl';
/**
 * Setup Form Component
 *
 * Form per la creazione iniziale dell'account admin
 */
import { useState } from 'react';
import { useRouter } from 'app/navigation';
import { Button, Input } from '@giulio-leone/ui';
import { useForm } from '@giulio-leone/hooks';
import { isValidEmail } from '@giulio-leone/lib-shared';

interface SetupFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}
interface SetupFormProps {
  disabled?: boolean;
}
export function SetupForm({ disabled = false }: SetupFormProps) {
  const t = useTranslations('auth');

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<SetupFormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore durante la creazione dell'admin");
      }
      // Reindirizza al login dopo il successo
      router.push('/login?setup=success');
      router.refresh();
    },
    validate: {
      email: (value) =>
        !value ? 'Email obbligatoria' : !isValidEmail(value) ? "Inserisci un'email valida" : null,
      password: (value) =>
        !value
          ? 'Password obbligatoria'
          : value.length < 8
            ? 'La password deve avere almeno 8 caratteri'
            : null,
      confirmPassword: (value: string, values?: SetupFormValues) =>
        !value
          ? 'Conferma password obbligatoria'
          : values && value !== values.password
            ? 'Le password non corrispondono'
            : null,
      name: (value) => (!value ? 'Nome obbligatorio' : null),
    },
    validateOnBlur: true,
  });
  const formError = (form.errors as Record<string, string | undefined>)._form;
  return (
    <form onSubmit={form.handleSubmit} className="mt-8 space-y-6" noValidate>
      {disabled && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600 dark:border-white/[0.08] dark:bg-neutral-800/50 dark:text-neutral-400">
          <p className="font-semibold">{t('setup_form.form_disabilitato')}</p>
          <p className="mt-1">{t('setup_form.il_form_e_disabilitato_perche_le_credenz')}</p>
        </div>
      )}
      {/* Error message */}
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
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
          {t('setup_form.nome_completo')}
        </label>
        <Input
          id="name"
          type="text"
          placeholder={t('setup_form.mario_rossi')}
          value={form.values.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('name', e.target.value)
          }
          onBlur={form.handleBlur('name')}
          required
          disabled={disabled || form.isSubmitting}
          autoComplete="name"
          autoFocus
          className="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
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
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('setup_form.admin_example_com')}
          value={form.values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('email', e.target.value)
          }
          onBlur={form.handleBlur('email')}
          required
          disabled={disabled || form.isSubmitting}
          autoComplete="email"
          className="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
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
            placeholder={t('setup_form.minimo_8_caratteri')}
            value={form.values.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('password', e.target.value)
            }
            onBlur={form.handleBlur('password')}
            required
            disabled={disabled || form.isSubmitting}
            autoComplete="new-password"
            className="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-invalid={!!form.errors.password}
            aria-describedby={form.errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled || form.isSubmitting}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
          >
            {showPassword ? 'Nascondi' : 'Mostra'}
          </button>
        </div>
        {form.errors.password && form.touched.password && (
          <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.password}
          </p>
        )}
      </div>
      {/* Confirm Password field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('setup_form.conferma_password')}
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('setup_form.ripeti_la_password')}
            value={form.values.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              form.setValue('confirmPassword', e.target.value)
            }
            onBlur={form.handleBlur('confirmPassword')}
            required
            disabled={disabled || form.isSubmitting}
            autoComplete="new-password"
            className="focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-invalid={!!form.errors.confirmPassword}
            aria-describedby={form.errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={disabled || form.isSubmitting}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
            aria-label={showConfirmPassword ? 'Nascondi password' : 'Mostra password'}
          >
            {showConfirmPassword ? 'Nascondi' : 'Mostra'}
          </button>
        </div>
        {form.errors.confirmPassword && form.touched.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.confirmPassword}
          </p>
        )}
      </div>
      {/* Info */}
      <div className="rounded-lg bg-primary-50 p-3 text-xs text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
        <p className="font-semibold">{t('setup_form.informazioni')}</p>
        <p className="mt-1">{t('setup_form.questo_account_avra_privilegi_amministra')}</p>
      </div>
      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        disabled={disabled || form.isSubmitting || !form.isValid}
        className="w-full focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
      >
        {form.isSubmitting ? 'Creazione in corso...' : 'Crea Account Admin'}
      </Button>
    </form>
  );
}
