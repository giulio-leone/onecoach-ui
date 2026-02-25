'use client';

import { useTranslations } from 'next-intl';
/**
 * ExerciseImportModal
 *
 * Consente di importare esercizi incollando JSON o caricando un file.
 * Si affida alle API admin per la validazione ed il merge.
 */
import { useState } from 'react';
import { Button } from '../../button';
import { Modal, ModalFooter } from '../../dialog';
import { Checkbox } from '../../checkbox';
import { Upload, X, FileJson, AlertTriangle } from 'lucide-react';
import { handleApiError } from '@giulio-leone/lib-shared';
interface ExerciseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summaryMessage: string) => void | Promise<void>;
}
export function ExerciseImportModal({ isOpen, onClose, onSuccess }: ExerciseImportModalProps) {
  const t = useTranslations('admin');

  const [jsonInput, setJsonInput] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [mergeExisting, setMergeExisting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      setJsonInput(text);
      setPreview(`Caricato file: ${file.name} (${file.size.toLocaleString()} bytes)`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossibile leggere il file');
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const payload = Array.isArray(parsed) ? parsed : [parsed];
      const response = await fetch('/api/admin/exercises/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload,
          autoApprove,
          mergeExisting,
        }),
      });
      if (!response.ok) {
        const error = await handleApiError(response);
        throw error;
      }
      const data = await response.json();
      const summary = data.summary ?? {};
      const created = summary.created ?? 0;
      const updated = summary.updated ?? 0;
      const errors = Array.isArray(summary.errors) ? summary.errors.length : 0;
      const message = `Import completata: ${created} creati, ${updated} aggiornati, ${errors} errori`;
      await onSuccess(message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante import');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.exercise_import_modal.importa_esercizi')}
      size="xl"
    >
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-500">
        {t('admin.exercise_import_modal.incolla_il_json_esportato_oppure_carica_')}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <FileJson className="h-8 w-8 text-emerald-500" />
            <p className="font-medium">
              {t('admin.exercise_import_modal.trascina_un_file_json_oppure_selezionalo')}
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50">
              <Upload className="h-4 w-4" />
              {t('admin.exercise_import_modal.scegli_file')}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {preview && <p className="text-xs text-neutral-500 dark:text-neutral-500">{preview}</p>}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {t('admin.exercise_import_modal.json_da_importare')}
          </label>
          <textarea
            className="h-60 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            placeholder={t('admin.exercise_import_modal.n_n_slug_n_translations_n_n')}
            value={jsonInput}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setJsonInput(event.target.value)
            }
            required
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
          <Checkbox
            label={t('admin.exercise_import_modal.approva_automaticamente_i_nuovi_esercizi')}
            checked={autoApprove}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setAutoApprove(event.target.checked)
            }
          />
          <Checkbox
            label={t('admin.exercise_import_modal.unisci_con_esistenti_aggiorna_se_slug_gi')}
            checked={mergeExisting}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setMergeExisting(event.target.checked)
            }
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting || !jsonInput.trim()}>
            {isSubmitting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FileJson className="mr-2 h-4 w-4" />
            )}
            {t('admin.exercise_import_modal.importa_esercizi')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
