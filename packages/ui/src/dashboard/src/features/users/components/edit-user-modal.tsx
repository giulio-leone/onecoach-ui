'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../../../button';
import { Input } from '../../../../../input';
import { Modal, ModalFooter } from '../../../../../dialog';
import { Select } from '../../../../../select';
import { toast } from 'sonner';
import { Loader2, User, Mail, Shield, Coins } from 'lucide-react';
import type { UserWithCounts } from '@giulio-leone/types/prisma-helpers';
import { useTranslations } from 'next-intl';

interface EditUserModalProps {
  user: UserWithCounts | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole: string;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
  currentUserRole,
}: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [credits, setCredits] = useState('0');
  const t = useTranslations('admin.users');
  const tAdmin = useTranslations('admin');

  const canEditRole = currentUserRole === 'SUPER_ADMIN';
  const isEditingSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name || '');
      setRole(user.role);
      setCredits(user.credits.toString());
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          role: canEditRole ? role : undefined,
          credits: parseInt(credits),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || tAdmin('edit.error'));
      }

      toast.success(tAdmin('edit.success'));
      onClose();
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : tAdmin('edit.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('edit.title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {isEditingSuperAdmin && currentUserRole !== 'SUPER_ADMIN' && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            {t('edit.superAdminWarning')}
          </div>
        )}

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t('edit.emailLabel')}
            </label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                disabled={isEditingSuperAdmin && currentUserRole !== 'SUPER_ADMIN'}
                className="pl-10"
              />
            </div>
          </div>

          {/* Nome */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t('edit.nameLabel')}
            </label>
            <div className="relative">
              <User className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
              <Input
                id="name"
                type="text"
                placeholder={t('edit.namePlaceholder')}
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                disabled={isEditingSuperAdmin && currentUserRole !== 'SUPER_ADMIN'}
                className="pl-10"
              />
            </div>
          </div>

          {/* Ruolo - Solo per Super Admin */}
          {canEditRole && (
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {t('edit.roleLabel')}
              </label>
              <div className="relative">
                <Shield className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
                <Select
                  id="role"
                  value={role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                  disabled={isEditingSuperAdmin}
                  className="pl-10"
                >
                  <option value="USER">{t('filters.roles.USER')}</option>
                  <option value="COACH">{t('filters.roles.COACH')}</option>
                  <option value="ADMIN">{t('filters.roles.ADMIN')}</option>
                  <option value="SUPER_ADMIN">{t('filters.roles.SUPER_ADMIN')}</option>
                </Select>
              </div>
              {isEditingSuperAdmin && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {t('edit.superAdminRoleWarning')}
                </p>
              )}
            </div>
          )}

          {/* Crediti */}
          <div>
            <label
              htmlFor="credits"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {t('edit.creditsLabel')}
            </label>
            <div className="relative">
              <Coins className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
              <Input
                id="credits"
                type="number"
                min="0"
                value={credits}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredits(e.target.value)}
                disabled={isEditingSuperAdmin && currentUserRole !== 'SUPER_ADMIN'}
                className="pl-10"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">{t('edit.creditsHelp')}</p>
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('edit.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (isEditingSuperAdmin && currentUserRole !== 'SUPER_ADMIN')}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('edit.submit')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
