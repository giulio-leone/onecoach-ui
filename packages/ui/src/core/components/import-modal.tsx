'use client';

import { useState } from 'react';
import { Button } from './button';
import { Modal, ModalFooter } from './dialog';
import { AlertTriangle, Loader2, Upload } from 'lucide-react';

type FileInput = {
  name: string;
  mimeType?: string;
  content: string;
  size?: number;
};

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  title: string;
  description?: string;
  buildPayload?: (files: FileInput[]) => unknown;
  onSuccess?: (response: unknown) => void | Promise<void>;
  labels?: {
    files?: string;
    cancel?: string;
    import?: string;
    importing?: string;
    selectFileError?: string;
    baseError?: string;
  };
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      } else {
        reject(new Error('Impossibile leggere il file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImportModal({
  isOpen,
  onClose,
  endpoint,
  title,
  description,
  buildPayload,
  onSuccess,
  labels,
}: ImportModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergedLabels = {
    files: 'File',
    cancel: 'Annulla',
    import: 'Importa',
    importing: 'In corso...',
    selectFileError: 'Seleziona almeno un file',
    baseError: 'Errore durante il caricamento',
    ...labels,
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setFiles(Array.from(event.target.files));
    setError(null);
  };

  const reset = () => {
    setFiles([]);
    setIsUploading(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError(mergedLabels.selectFileError!);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const filesData = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          content: await fileToBase64(file),
          size: file.size,
        }))
      );

      const payload = buildPayload ? buildPayload(filesData) : { files: filesData };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Simple error handling for generic component
        const data = await response.json();
        throw new Error(data.message || data.error || mergedLabels.baseError);
      }

      const result = await response.json();

      if (onSuccess) {
        await onSuccess(result);
      }
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : mergedLabels.baseError;
      setError(message || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} description={description ?? ''}>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {mergedLabels.files}
          </span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </label>

        {files.length > 0 && (
          <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between py-1">
                <span>{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
          {mergedLabels.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={isUploading || files.length === 0}>
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {mergedLabels.importing}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {mergedLabels.import}
            </span>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
