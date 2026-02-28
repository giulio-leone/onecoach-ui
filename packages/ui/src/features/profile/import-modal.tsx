'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../dialog';
import { Button } from '../../button';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { useImportMeasurements } from '@giulio-leone/hooks';
import { toast } from 'sonner';

import { logger } from '@giulio-leone/lib-shared';
export function MeasurementsImportModal() {
  const t = useTranslations('common');

  const [open, setOpen] = useState(false);
  const { mutate: importFiles, isPending } = useImportMeasurements();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file: any) => formData.append('files', file));

    importFiles(formData, {
      onSuccess: (data) => {
        const count = (data as any)?.imported?.length ?? 0;
        toast.success(`Importazione completata: ${count} misurazioni aggiunte`);
        setOpen(false);
        setSelectedFiles([]);
      },
      onError: (error) => {
        toast.error(t('profile.import_modal.errore_durante_il_caricamento'));
        logger.error('Upload error', error);
      },
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload size={16} />
          {t('profile.import_modal.importa_ai')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profile.import_modal.importa_misurazioni')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className="cursor-pointer rounded-xl border-2 border-dashed border-neutral-200/60 p-8 text-center transition-colors hover:bg-neutral-50 dark:border-white/[0.08] dark:hover:bg-white/[0.06]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Upload size={32} />
              <p className="font-medium">{t('profile.import_modal.clicca_o_trascina_file_qui')}</p>
              <p className="text-xs">{t('profile.import_modal.supporta_pdf_immagini_excel')}</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="max-h-[150px] space-y-2 overflow-y-auto">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-neutral-100 p-2 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="shrink-0 text-indigo-500" />
                    <span className="truncate text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Annulla
            </Button>
            <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Analisi in corso...' : 'Importa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
