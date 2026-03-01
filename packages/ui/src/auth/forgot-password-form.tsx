/**
 * Forgot Password Form Component
 *
 * Form for requesting password reset
 */
'use client';
import { useState } from 'react';
import { Button, Input } from '@giulio-leone/ui';
import { useForm } from '@giulio-leone/hooks';
import { isValidEmail } from '@giulio-leone/lib-shared';
import { handleApiError } from '@giulio-leone/lib-shared';
import { logger } from '@giulio-leone/lib-shared';
import { useTranslations } from 'next-intl';

interface ForgotPasswordFormValues {
  email: string;
}
export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const tForgot = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('auth.validation');

  const [success, setSuccess] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      const data = await response.json();
      setSuccess(true);
      // In development, log the reset link
      if (data.resetLink) {
        logger.warn('🔑 Reset link:', data.resetLink);
      }
    },
    validate: {
      email: (value) =>
        !value
          ? tValidation('emailRequired')
          : !isValidEmail(value)
            ? tValidation('emailInvalid')
            : null,
    },
    validateOnBlur: true,
  });
  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800" role="alert">
        <p className="font-semibold">✓ {tForgot('success.title')}</p>
        <p className="mt-1">{tForgot('success.description')}</p>
      </div>
    );
  }
  const formError = (
    form.errors as Partial<Record<keyof ForgotPasswordFormValues | '_form', string>>
  )._form;
  return (
    <form onSubmit={form.handleSubmit} className="space-y-6" noValidate>
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
      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('email')}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          value={form.values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('email', e.target.value)
          }
          onBlur={form.handleBlur('email')}
          required
          disabled={form.isSubmitting}
          autoComplete="email"
          autoFocus
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
      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        disabled={form.isSubmitting || !form.isValid}
        className="w-full focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {form.isSubmitting ? t('sending') : tForgot('submit')}
      </Button>
    </form>
  );
}
