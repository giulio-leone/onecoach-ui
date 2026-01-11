'use client';

import { useTranslations } from 'next-intl';
/**
 * Modal di import AI per OneAgenda (progetti, task, habit)
 */

import { ImportModal } from '../import/import-modal';

type OneAgendaImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectIds?: string[]) => void | Promise<void>;
};

export function OneAgendaImportModal({ isOpen, onClose, onSuccess }: OneAgendaImportModalProps) {
  const t = useTranslations('common');

  return (
    <ImportModal
      isOpen={isOpen}
      onClose={onClose}
      endpoint="/api/oneagenda/import"
      title={t('oneagenda_import_modal.importa_oneagenda_ai')}
      description={t('oneagenda_import_modal.carica_file_con_progetti_task_o_abitudin')}
      buildPayload={(files) => ({ files })}
      onSuccess={async (res) => {
        if (onSuccess) {
          await onSuccess((res as { projectIds?: string[] })?.projectIds);
        }
      }}
    />
  );
}
