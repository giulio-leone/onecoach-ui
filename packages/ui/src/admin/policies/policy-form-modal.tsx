/**
 * Policy Form Modal Component
 *
 * Form per creare o modificare una policy
 */
'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button, Modal, ModalFooter } from '@giulio-leone/ui';
import type { PolicyWithCreator } from '@giulio-leone/lib-core/policy.service';
import type { PolicyType, PolicyStatus } from '@giulio-leone/types/client';
import { useForm } from '@giulio-leone/hooks';
import { handleApiError } from '@giulio-leone/lib-shared';
interface PolicyFormModalProps {
  isOpen: boolean;
  policy?: PolicyWithCreator | null;
  onClose: (updatedPolicy?: PolicyWithCreator) => void;
}
interface PolicyFormValues {
  type: PolicyType;
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  status: PolicyStatus;
  changeReason: string;
}
export function PolicyFormModal({ isOpen, policy, onClose }: PolicyFormModalProps) {
  const t = useTranslations();
  const isEditing = !!policy;
  const form = useForm({
    initialValues: {
      type: policy?.type || 'PRIVACY',
      slug: policy?.slug || '',
      title: policy?.title || '',
      content: policy?.content || '',
      metaDescription: policy?.metaDescription || '',
      status: policy?.status || 'DRAFT',
      changeReason: '',
    },
    onSubmit: async (values: PolicyFormValues) => {
      const url = isEditing ? `/api/admin/policies/${policy.id}` : '/api/admin/policies';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? {
            slug: values.slug,
            title: values.title,
            content: values.content,
            metaDescription: values.metaDescription,
            status: values.status,
            changeReason: values.changeReason,
          }
        : {
            type: values.type,
            slug: values.slug,
            title: values.title,
            content: values.content,
            metaDescription: values.metaDescription,
            status: values.status,
          };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      const result = await response.json();
      onClose(result.policy);
    },
    validateOnBlur: false,
  });
  // Auto-genera slug dal titolo se non in editing
  useEffect(() => {
    if (!isEditing && form.values.title && !form.values.slug) {
      const generatedSlug = form.values.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', generatedSlug);
    }
  }, [form.values.title, form.values.slug, isEditing, form]);
  const formError = (form.errors as Record<string, string | undefined>)._form;
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={isEditing ? 'Modifica Policy' : 'Nuova Policy'}
      size="xl"
    >
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-500">
        {isEditing ? 'Aggiorna i dettagli della policy' : 'Crea una nuova policy page'}
      </p>
      <form onSubmit={form.handleSubmit}>
        <div className="space-y-6">
          {/* Error Message */}
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {formError}
            </div>
          )}
          {/* Type (solo in creazione) */}
          {!isEditing && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.policy_form_modal.tipo_policy')}
              </label>
              <select
                value={form.values.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  form.setValue('type', e.target.value as PolicyType)
                }
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
                required
              >
                <option value="PRIVACY">{t('admin.policy_form_modal.privacy_policy')}</option>
                <option value="TERMS">{t('admin.policy_form_modal.termini_e_condizioni')}</option>
                <option value="GDPR">GDPR</option>
                <option value="CONTENT">{t('admin.policy_form_modal.content_policy')}</option>
              </select>
            </div>
          )}
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.policy_form_modal.titolo')}
            </label>
            <input
              type="text"
              value={form.values.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue('title', e.target.value)
              }
              onBlur={form.handleBlur('title')}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
              placeholder={t('admin.policy_form_modal.es_privacy_policy')}
              required
            />
          </div>
          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.policy_form_modal.slug_url')}
            </label>
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-500">
                /
              </span>
              <input
                type="text"
                value={form.values.slug}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('slug', e.target.value)
                }
                onBlur={form.handleBlur('slug')}
                className="flex-1 rounded-r-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
                placeholder={t('admin.policy_form_modal.privacy_policy')}
                pattern="[a-z0-9-]+"
                title={t('admin.policy_form_modal.solo_lettere_minuscole_numeri_e_trattini')}
                required
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {t('admin.policy_form_modal.solo_lettere_minuscole_numeri_e_trattini')}
            </p>
          </div>
          {/* Meta Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.policy_form_modal.meta_description_seo')}
            </label>
            <textarea
              value={form.values.metaDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                form.setValue('metaDescription', e.target.value)
              }
              onBlur={form.handleBlur('metaDescription')}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
              rows={2}
              maxLength={500}
              placeholder={t('admin.policy_form_modal.breve_descrizione_per_i_motori_di_ricerc')}
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {form.values.metaDescription.length}
              {t('admin.policy_form_modal.500_caratteri')}
            </p>
          </div>
          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.policy_form_modal.contenuto')}
            </label>
            <textarea
              value={form.values.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                form.setValue('content', e.target.value)
              }
              onBlur={form.handleBlur('content')}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 font-mono text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
              rows={15}
              placeholder={t('admin.policy_form_modal.inserisci_il_contenuto_della_policy_in_h')}
              required
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {t('admin.policy_form_modal.supporta_html_per_formattazione_avanzata')}
            </p>
          </div>
          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.policy_form_modal.stato')}
            </label>
            <select
              value={form.values.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                form.setValue('status', e.target.value as PolicyStatus)
              }
              className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
              required
            >
              <option value="DRAFT">Bozza</option>
              <option value="PUBLISHED">Pubblicata</option>
              <option value="ARCHIVED">Archiviata</option>
            </select>
          </div>
          {/* Change Reason (solo in editing) */}
          {isEditing && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('admin.policy_form_modal.motivo_della_modifica')}
              </label>
              <input
                type="text"
                value={form.values.changeReason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.setValue('changeReason', e.target.value)
                }
                onBlur={form.handleBlur('changeReason')}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-neutral-600"
                placeholder={t('admin.policy_form_modal.es_aggiornamento_normativa_gdpr')}
              />
            </div>
          )}
        </div>
        <ModalFooter>
          <Button
            type="button"
            onClick={() => onClose()}
            variant="outline"
            disabled={form.isSubmitting}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={form.isSubmitting || !form.isValid}>
            <Save className="mr-2 h-4 w-4" />
            {form.isSubmitting
              ? t('common.saving')
              : isEditing
                ? t('common.actions.saveChanges')
                : 'Crea Policy'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
