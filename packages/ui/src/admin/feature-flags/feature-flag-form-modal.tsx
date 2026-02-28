'use client';

import { useTranslations } from 'next-intl';
/**
 * Feature Flag Form Modal
 *
 * Modal for creating and editing feature flags
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { logger } from '@giulio-leone/lib-shared';
import { toast } from 'sonner';
import { Checkbox } from '@giulio-leone/ui';

interface FlagData {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  strategy: string;
  config: unknown;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface FeatureFlagFormModalProps {
  flag: FlagData | null;
  onClose: () => void;
  onSuccess: (flag: FlagData) => void;
}

export function FeatureFlagFormModal({ flag, onClose, onSuccess }: FeatureFlagFormModalProps) {
  const t = useTranslations('admin');

  const [formData, setFormData] = useState({
    key: flag?.key || '',
    name: flag?.name || '',
    description: flag?.description || '',
    enabled: flag?.enabled || false,
    strategy: flag?.strategy || 'ALL',
    config: flag?.config ? JSON.stringify(flag.config, null, 2) : '{}',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    const t = useTranslations('admin');
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let config;
      try {
        config = JSON.parse(formData.config);
      } catch (_error: unknown) {
        toast.error(t('feature_flag_form_modal.json_non_valido_nel_campo_configurazione'));
        setIsSubmitting(false);
        return;
      }

      const url = flag ? `/api/admin/feature-flags/${flag.key}` : '/api/admin/feature-flags';

      const method = flag ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description || null,
          enabled: formData.enabled,
          strategy: formData.strategy,
          config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save flag');
      }

      const data = await response.json();
      toast.success(flag ? 'Flag aggiornato con successo' : 'Flag creato con successo');
      onSuccess(data.flag);
    } catch (error: unknown) {
      logger.error('Error saving flag', error);
      toast.error(error instanceof Error ? error.message : 'Errore nel salvataggio del flag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-950">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {flag ? 'Edit Feature Flag' : 'Create Feature Flag'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, key: e.target.value })
              }
              disabled={!!flag}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-white/[0.04] dark:disabled:bg-neutral-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-white/[0.04]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-white/[0.04]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('feature_flag_form_modal.rollout_strategy')}
            </label>
            <select
              value={formData.strategy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, strategy: e.target.value })
              }
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-white/[0.04]"
            >
              <option value="ALL">{t('feature_flag_form_modal.all_users')}</option>
              <option value="ROLE_BASED">{t('feature_flag_form_modal.role_based')}</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="RANDOM">Random</option>
              <option value="BETA_USERS">{t('feature_flag_form_modal.beta_users_only')}</option>
              <option value="COMBINED">{t('feature_flag_form_modal.combined_strategy')}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('feature_flag_form_modal.configuration_json')}
              <span className="ml-2 text-xs text-neutral-500">
                {t('feature_flag_form_modal.example')}
                {`{"roles": ["ADMIN"], "percentage": 50}`}
              </span>
            </label>
            <textarea
              value={formData.config}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, config: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs dark:border-neutral-700 dark:bg-white/[0.04]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="enabled"
              label={t('feature_flag_form_modal.enable_flag_immediately')}
              checked={formData.enabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : flag ? 'Update Flag' : 'Create Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
