'use client';

import { useTranslations } from 'next-intl';
/**
 * Admin Credentials Form Component
 *
 * Form per aggiornare le credenziali admin o super admin
 */
import { useState } from 'react';
import { Button, Input, Label, Text } from '@giulio-leone/ui';
import { validatePassword } from '@giulio-leone/lib-shared';

const ADMIN_PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

function getPasswordRequirementsMessage(req: typeof ADMIN_PASSWORD_REQUIREMENTS) {
  return `Password must be at least ${req.minLength} characters long and include uppercase, lowercase, number, and special character.`;
}
interface AdminCredentialsFormProps {
  type: 'admin' | 'super_admin';
  initialData: {
    id?: string;
    email?: string;
    name?: string;
    credits?: number;
    role?: string;
  } | null;
  canEdit: boolean;
}
export function AdminCredentialsForm({ type, initialData, canEdit }: AdminCredentialsFormProps) {
  const t = useTranslations();
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(initialData?.name || '');
  const [credits, setCredits] = useState(initialData?.credits?.toString() || '10000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // Validazione
    if (!email) {
      setError('Email è richiesta');
      return;
    }
    if (!password) {
      setError('Password è richiesta');
      return;
    }
    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }
    // Validazione password con policy di sicurezza
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors?.join(', ') || 'Password non valida');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/credentials', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          email,
          password,
          name: name || undefined,
          credits: credits ? Number(credits) : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Errore nell'aggiornamento delle credenziali");
      }
      setSuccess(data.message || 'Credenziali aggiornate con successo');
      setPassword('');
      setConfirmPassword('');
      // Aggiorna i dati iniziali se disponibili
      if (data.user) {
        setEmail(data.user.email);
        setName(data.user.name || '');
        setCredits(data.user.credits?.toString() || '10000');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };
  if (!canEdit && type === 'super_admin') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <Text size="sm" className="text-yellow-800 dark:text-yellow-200">
          {t('admin.admin_credentials_form.solo_i_super_admin_possono_modificare_le')}
        </Text>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <Label htmlFor={`${type}-email`}>Email</Label>
        <Input
          id={`${type}-email`}
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder={t('admin.admin_credentials_form.admin_example_com')}
        />
      </div>
      {/* Password */}
      <div>
        <Label htmlFor={`${type}-password`}>
          {t('admin.admin_credentials_form.nuova_password')}
        </Label>
        <Input
          id={`${type}-password`}
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          disabled={loading}
          placeholder={getPasswordRequirementsMessage(ADMIN_PASSWORD_REQUIREMENTS)}
          minLength={ADMIN_PASSWORD_REQUIREMENTS.minLength}
        />
        <Text size="xs" className="mt-1 text-neutral-500 dark:text-neutral-400">
          {getPasswordRequirementsMessage(ADMIN_PASSWORD_REQUIREMENTS)}
        </Text>
      </div>
      {/* Confirm Password */}
      <div>
        <Label htmlFor={`${type}-confirm-password`}>
          {t('admin.admin_credentials_form.conferma_password')}
        </Label>
        <Input
          id={`${type}-confirm-password`}
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          placeholder={t('admin.admin_credentials_form.ripeti_la_password')}
          minLength={ADMIN_PASSWORD_REQUIREMENTS.minLength}
        />
      </div>
      {/* Name */}
      <div>
        <Label htmlFor={`${type}-name`}>{t('admin.admin_credentials_form.nome_opzionale')}</Label>
        <Input
          id={`${type}-name`}
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          disabled={loading}
          placeholder={type === 'admin' ? 'Admin onecoach' : 'Super Admin onecoach'}
        />
      </div>
      {/* Credits */}
      <div>
        <Label htmlFor={`${type}-credits`}>
          {t('admin.admin_credentials_form.crediti_iniziali')}
        </Label>
        <Input
          id={`${type}-credits`}
          type="number"
          value={credits}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredits(e.target.value)}
          disabled={loading}
          min="0"
          step="1000"
        />
      </div>
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <Text size="sm" className="text-red-800 dark:text-red-200">
            {error}
          </Text>
        </div>
      )}
      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
          <Text size="sm" className="text-green-800 dark:text-green-200">
            {success}
          </Text>
        </div>
      )}
      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Aggiornamento...' : 'Aggiorna Credenziali'}
      </Button>
    </form>
  );
}
