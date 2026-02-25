/**
 * Reset Password Form Component
 *
 * Form for confirming password reset with token
 */
'use client';
import { useState } from 'react';
import { useRouter } from '../layout/navigation';
import { Button } from '../button';
import { Input } from '../input';
import { useForm } from '@giulio-leone/hooks';
import { validatePassword, passwordsMatch } from '@giulio-leone/lib-shared';
import { handleApiError } from '@giulio-leone/lib-shared';
import { useTranslations } from 'next-intl';


type ResetPasswordFormProps = {
  token: string;
};
interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const t = useTranslations('auth');
  const tValidation = useTranslations('auth.validation');
  const tReset = useTranslations('auth.resetPassword');

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const form = useForm<ResetPasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: values.password }),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=password-reset-success');
      }, 2000);
    },
    validate: {
      password: (value) => {
        if (!value) return tValidation('passwordRequired');
        if (value.length < 8) return tValidation('passwordLength');
        const validation = validatePassword(value, {
          minLength: 8,
          requireUppercase: true,
          requireNumber: true,
        });
        return validation.valid ? null : validation.errors[0] || null;
      },
      confirmPassword: (value: string, allValues?: ResetPasswordFormValues) => {
        if (!value) return tValidation('confirmPasswordRequired');
        return allValues && !passwordsMatch(allValues.password, value)
          ? tValidation('passwordsMismatch')
          : null;
      },
    },
    validateOnBlur: true,
  });
  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800" role="alert">
        <p className="font-semibold">✓ {tReset('success.title')}</p>
        <p className="mt-1">{tReset('success.description')}</p>
      </div>
    );
  }
  const formError = (form.errors as Record<string, string | undefined>)._form;
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
      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('newPassword')}
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
            autoComplete="new-password"
            autoFocus
            className="pr-12 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-invalid={!!form.errors.password}
            aria-describedby={form.errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 mr-2 flex items-center rounded-md px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? t('hide') : t('show')}
          </button>
        </div>
        {form.errors.password && form.touched.password ? (
          <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.password}
          </p>
        ) : (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            {t('passwordRequirements')}
          </p>
        )}
      </div>
      {/* Confirm Password field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {t('confirmPassword')}
        </label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.values.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            form.setValue('confirmPassword', e.target.value)
          }
          onBlur={form.handleBlur('confirmPassword')}
          required
          disabled={form.isSubmitting}
          autoComplete="new-password"
          className="focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          aria-invalid={!!form.errors.confirmPassword}
          aria-describedby={form.errors.confirmPassword ? 'confirmPassword-error' : undefined}
        />
        {form.errors.confirmPassword && form.touched.confirmPassword && (
          <p id="confirmPassword-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {form.errors.confirmPassword}
          </p>
        )}
      </div>
      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        disabled={form.isSubmitting || !form.isValid}
        className="w-full focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {form.isSubmitting ? t('updating') : tReset('submit')}
      </Button>
    </form>
  );
}
