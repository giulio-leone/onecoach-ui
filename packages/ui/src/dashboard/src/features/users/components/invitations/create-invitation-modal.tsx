'use client';

import { useState } from 'react';
import { Button } from '../../../../../../button';
import { Input } from '../../../../../../input';
import { Modal, ModalFooter } from '../../../../../../dialog';
import { Select } from '../../../../../../select';
import { toast } from 'sonner';
import { Loader2, Plus, Calendar, Hash, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CreateInvitationModalProps {
  onSuccess: () => void;
}

export function CreateInvitationModal({ onSuccess }: CreateInvitationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<'ONE_TIME' | 'MULTI_USE'>('ONE_TIME');
  const [maxUses, setMaxUses] = useState('1');
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const t = useTranslations('admin.users.invitations');
  const tAdmin = useTranslations('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          maxUses: type === 'MULTI_USE' ? parseInt(maxUses) : 1,
          code: code || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || tAdmin('create.createError'));
      }

      toast.success(tAdmin('create.success'));
      setIsOpen(false);
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : tAdmin('create.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setType('ONE_TIME');
    setMaxUses('1');
    setCode('');
    setExpiresAt('');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="shadow-primary/20 shadow-lg">
        <Plus className="mr-2 h-4 w-4" />
        {t('create.submit')}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('create.title')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('create.description')}
          </p>

          <div className="space-y-4">
            <Select
              label={t('create.typeLabel')}
              value={type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setType(e.target.value as 'ONE_TIME' | 'MULTI_USE')
              }
            >
              <option value="ONE_TIME">{t('filters.types.oneTime')}</option>
              <option value="MULTI_USE">{t('filters.types.multiUse')}</option>
            </Select>

            {type === 'MULTI_USE' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label
                  htmlFor="maxUses"
                  className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  {t('create.maxUses')}
                </label>
                <div className="relative">
                  <Users className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMaxUses(e.target.value)
                    }
                    required
                    className="pl-10"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">{t('create.maxUsesHelp')}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {t('create.codeLabel')}
              </label>
              <div className="relative">
                <Hash className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
                <Input
                  id="code"
                  placeholder={t('create.codePlaceholder')}
                  value={code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCode(e.target.value.toUpperCase())
                  }
                  pattern="[A-Z0-9]+"
                  className="pl-10 font-mono uppercase placeholder:normal-case"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">{t('create.codeHelp')}</p>
            </div>

            <div>
              <label
                htmlFor="expiresAt"
                className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                {t('create.expiresLabel')}
              </label>
              <div className="relative">
                <Calendar className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setExpiresAt(e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              {t('create.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('create.submit')}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
