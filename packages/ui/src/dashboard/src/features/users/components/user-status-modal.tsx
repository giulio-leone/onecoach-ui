'use client';

import { useState } from 'react';
import { Button, Modal, ModalFooter, type ButtonVariant } from '@giulio-leone/ui';
import { toast } from 'sonner';
import { Loader2, UserCheck, UserX, AlertTriangle, Trash2 } from 'lucide-react';
import type { UserWithCounts } from '@giulio-leone/types/prisma-helpers';
import { useTranslations } from 'next-intl';

type ActionType = 'suspend' | 'activate' | 'delete';

interface UserStatusModalProps {
  user: UserWithCounts | null;
  action: ActionType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserRole: string;
}

export function UserStatusModal({
  user,
  action,
  isOpen,
  onClose,
  onSuccess,
  currentUserRole,
}: UserStatusModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('admin.users');
  const tAdmin = useTranslations('admin');

  const actionConfig: Record<
    ActionType,
    {
      title: string;
      description: (name: string) => string;
      confirmText: string;
      variant: ButtonVariant;
      icon: typeof UserCheck;
      status?: string;
      successMessage: string;
    }
  > = {
    suspend: {
      title: t('statusModal.suspend.title'),
      description: (name) => t('statusModal.suspend.description', { name }),
      confirmText: t('statusModal.suspend.confirm'),
      variant: 'danger',
      icon: UserX,
      status: 'SUSPENDED',
      successMessage: t('statusModal.suspend.success'),
    },
    activate: {
      title: t('statusModal.activate.title'),
      description: (name) => t('statusModal.activate.description', { name }),
      confirmText: t('statusModal.activate.confirm'),
      variant: 'primary',
      icon: UserCheck,
      status: 'ACTIVE',
      successMessage: t('statusModal.activate.success'),
    },
    delete: {
      title: t('statusModal.delete.title'),
      description: (name) => t('statusModal.delete.description', { name }),
      confirmText: t('statusModal.delete.confirm'),
      variant: 'danger',
      icon: Trash2,
      successMessage: t('statusModal.delete.success'),
    },
  };

  const config = actionConfig[action];
  const isTargetSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canDelete = currentUserRole === 'SUPER_ADMIN' && action === 'delete';

  const handleConfirm = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      if (action === 'delete') {
        // DELETE request
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || tAdmin('edit.error')); // Reusing generic error
        }
      } else {
        // Status update (suspend/activate)
        const response = await fetch(`/api/admin/users/${user.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: config.status }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || tAdmin('edit.error'));
        }
      }

      toast.success(config.successMessage);
      onClose();
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : tAdmin('manageCredits.errorOperation'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const Icon = config.icon;
  const userName = user.name || user.email;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="sm">
      <div className="space-y-6">
        {/* Warning for Super Admin */}
        {isTargetSuperAdmin && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">{t('statusModal.warning')}</p>
              <p>
                {action === 'delete'
                  ? t('statusModal.warningSuperAdminDelete')
                  : t('statusModal.warningSuperAdminStatus')}
              </p>
            </div>
          </div>
        )}

        {/* Cannot delete restriction */}
        {action === 'delete' && currentUserRole !== 'SUPER_ADMIN' && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium">{t('statusModal.denied')}</p>
              <p>{t('statusModal.deniedDelete')}</p>
            </div>
          </div>
        )}

        {/* Action Icon and Description */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 rounded-full p-4 ${
              action === 'activate'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <Icon
              className={`h-8 w-8 ${
                action === 'activate'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">{config.description(userName)}</p>
        </div>

        {/* User Summary */}
        <div className="rounded-lg border border-neutral-200/60 p-4 dark:border-white/[0.08]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">{t('edit.emailLabel')}:</span>
              <p className="truncate font-medium text-neutral-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <span className="text-neutral-500">{t('edit.roleLabel')}:</span>
              <p className="font-medium text-neutral-900 dark:text-white">{user.role}</p>
            </div>
            <div>
              <span className="text-neutral-500">{t('edit.creditsLabel')}:</span>
              <p className="font-medium text-neutral-900 dark:text-white">{user.credits}</p>
            </div>
            <div>
              <span className="text-neutral-500">{t('admin.user_status_modal.status')}</span>
              <p className="font-medium text-neutral-900 dark:text-white">{user.status}</p>
            </div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t('statusModal.cancel')}
        </Button>
        <Button
          variant={config.variant}
          onClick={handleConfirm}
          disabled={
            isLoading ||
            (isTargetSuperAdmin && action === 'delete') ||
            (action === 'delete' && !canDelete)
          }
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {config.confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
