'use client';

import { useState } from 'react';
import { Button, Input, Modal, ModalFooter } from '@giulio-leone/ui';
import { toast } from 'sonner';
import { Loader2, Coins, Plus, Minus } from 'lucide-react';
import type { UserWithCounts } from '@giulio-leone/types/prisma-helpers';
import { useTranslations } from 'next-intl';

interface ManageCreditsModalProps {
  user: UserWithCounts | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManageCreditsModal({ user, isOpen, onClose, onSuccess }: ManageCreditsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'add' | 'remove'>('add');
  const [reason, setReason] = useState('');
  const t = useTranslations('admin.users');
  const tAdmin = useTranslations('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error(tAdmin('manageCredits.invalidAmount'));
      return;
    }

    if (!reason.trim()) {
      toast.error(tAdmin('manageCredits.invalidReason'));
      return;
    }

    setIsLoading(true);
    try {
      const finalAmount = operation === 'add' ? numAmount : -numAmount;

      const response = await fetch(`/api/admin/users/${user.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || tAdmin('manageCredits.errorUpdate'));
      }

      toast.success(
        operation === 'add'
          ? tAdmin('manageCredits.successAdd', { amount: numAmount })
          : tAdmin('manageCredits.successRemove', { amount: numAmount })
      );

      handleClose();
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : tAdmin('manageCredits.errorOperation'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setReason('');
    setOperation('add');
    onClose();
  };

  if (!user) return null;

  const newBalance =
    operation === 'add'
      ? user.credits + (parseInt(amount) || 0)
      : user.credits - (parseInt(amount) || 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('manageCredits.title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="rounded-lg bg-neutral-50 p-4 dark:bg-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">
                {user.name || t('list.userFallback')}
              </p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">{t('manageCredits.currentBalance')}</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{user.credits}</p>
            </div>
          </div>
        </div>

        {/* Operation Type */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={operation === 'add' ? 'default' : 'outline'}
            onClick={() => setOperation('add')}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('manageCredits.add')}
          </Button>
          <Button
            type="button"
            variant={operation === 'remove' ? 'danger' : 'outline'}
            onClick={() => setOperation('remove')}
            className="flex-1"
          >
            <Minus className="mr-2 h-4 w-4" />
            {t('manageCredits.remove')}
          </Button>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t('manageCredits.amountLabel')}
          </label>
          <div className="relative">
            <Coins className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder={t('manageCredits.amountPlaceholder')}
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {t('manageCredits.reasonLabel')}
          </label>
          <Input
            id="reason"
            type="text"
            placeholder={t('manageCredits.reasonPlaceholder')}
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-neutral-500">{t('manageCredits.reasonHelp')}</p>
        </div>

        {/* Preview */}
        {amount && parseInt(amount) > 0 && (
          <div className="rounded-lg border border-neutral-200/60 p-4 dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('manageCredits.newBalance')}
              </span>
              <span
                className={`text-xl font-bold ${
                  newBalance < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {newBalance}
              </span>
            </div>
            {newBalance < 0 && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {t('manageCredits.negativeWarning')}
              </p>
            )}
          </div>
        )}

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('manageCredits.cancel')}
          </Button>
          <Button
            type="submit"
            variant={operation === 'remove' ? 'danger' : 'default'}
            disabled={isLoading || !amount || !reason.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {operation === 'add' ? t('manageCredits.submitAdd') : t('manageCredits.submitRemove')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
