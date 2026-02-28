'use client';

import { useTranslations } from 'next-intl';
/**
 * Coach Vetting Form Component
 *
 * Form for submitting vetting request
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Label, Textarea, Heading, Text } from '@giulio-leone/ui';
import { Send, FileText } from 'lucide-react';
import { dialog } from '@giulio-leone/lib-stores';
export interface CoachVettingFormProps {
  hasPendingRequest: boolean;
  hasApprovedRequest: boolean;
}
export function CoachVettingForm({ hasPendingRequest, hasApprovedRequest }: CoachVettingFormProps) {
  const t = useTranslations('coach');

  const queryClient = useQueryClient();
  const [credentialDocuments, setCredentialDocuments] = useState<Record<string, unknown>>({});
  const [notes, setNotes] = useState('');
  const submitVettingMutation = useMutation({
    mutationFn: async (data: { credentialDocuments?: Record<string, unknown> }) => {
      const response = await fetch('/api/coach/vetting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Errore durante l'invio della richiesta");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach', 'vetting'] });
      dialog.success('Richiesta inviata con successo');
      setCredentialDocuments({});
      setNotes('');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Errore durante l'invio";
      dialog.error(message);
    },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasPendingRequest) {
      await dialog.error('Hai già una richiesta in attesa di revisione');
      return;
    }
    if (hasApprovedRequest) {
      await dialog.error('Il tuo account è già stato verificato');
      return;
    }
    await submitVettingMutation.mutateAsync({
      credentialDocuments:
        Object.keys(credentialDocuments).length > 0 ? credentialDocuments : undefined,
    });
  };
  // Note: In a real implementation, you would handle file uploads here
  // For now, we'll use a simple text area for credential information
  const handleDocumentInfo = (key: string, value: string) => {
    setCredentialDocuments({
      ...credentialDocuments,
      [key]: value,
    });
  };
  if (hasApprovedRequest) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
          <FileText className="h-5 w-5" />
          <div>
            <Heading level={3} size="sm" weight="semibold">{t('coach_vetting_form.account_verificato')}</Heading>
            <Text size="sm" className="text-neutral-600 dark:text-neutral-400">
              {t('coach_vetting_form.il_tuo_account_e_gia_stato_verificato')}
            </Text>
          </div>
        </div>
      </Card>
    );
  }
  if (hasPendingRequest) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
          <FileText className="h-5 w-5" />
          <div>
            <Heading level={3} size="sm" weight="semibold">{t('coach_vetting_form.richiesta_in_attesa')}</Heading>
            <Text size="sm" className="text-neutral-600 dark:text-neutral-400">
              {t('coach_vetting_form.hai_gia_una_richiesta_di_verifica_in_att')}
            </Text>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <Heading level={2} size="xl" weight="semibold" className="mb-6">
          {t('coach_vetting_form.richiesta_di_verifica')}
        </Heading>
        <div className="mb-4 space-y-4">
          <div>
            <Label htmlFor="certifications">Certificazioni</Label>
            <Textarea
              id="certifications"
              value={(credentialDocuments.certifications as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleDocumentInfo('certifications', e.target.value)
              }
              placeholder={t('coach_vetting_form.elenca_le_tue_certificazioni_es_personal')}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="education">Formazione</Label>
            <Textarea
              id="education"
              value={(credentialDocuments.education as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleDocumentInfo('education', e.target.value)
              }
              placeholder={t('coach_vetting_form.descrivi_la_tua_formazione_es_laurea_mas')}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="experience">Esperienza</Label>
            <Textarea
              id="experience"
              value={(credentialDocuments.experience as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleDocumentInfo('experience', e.target.value)
              }
              placeholder={t('coach_vetting_form.descrivi_la_tua_esperienza_nel_coaching')}
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="notes">{t('coach_vetting_form.note_aggiuntive')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder={t('coach_vetting_form.aggiungi_qualsiasi_informazione_aggiunti')}
              rows={3}
              className="mt-1"
            />
          </div>
        </div>
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
          <Text size="sm" className="text-primary-800 dark:text-primary-300">
            <strong>{t('coach_vetting_form.nota')}</strong>{' '}
            {t('coach_vetting_form.dopo_l_invio_la_tua_richiesta_verra_revi')}
          </Text>
        </div>
      </Card>
      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          icon={Send}
          disabled={submitVettingMutation.isPending}
          loading={submitVettingMutation.isPending}
        >
          {t('coach_vetting_form.invia_richiesta')}
        </Button>
      </div>
    </form>
  );
}
