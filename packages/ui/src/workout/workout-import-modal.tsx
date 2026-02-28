/**
 * Workout Import Modal
 *
 * Modal per importare programmi di allenamento da file.
 * Supporta drag-drop, preview, modalità auto/review e progress streaming.
 *
 * @module components/workout/workout-import-modal
 */
'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button, Modal, ModalFooter } from '@giulio-leone/ui';
import {
  Upload,
  X,
  FileSpreadsheet,
  FileImage,
  FileText,
  FileType,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Zap,
  Eye,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { handleApiError } from '@giulio-leone/lib-shared';
import { cn } from '@giulio-leone/lib-design-system';
import type { WorkoutImportResult } from '@giulio-leone/one-workout';
import type { ImportProgress } from '@giulio-leone/lib-shared/import-core';
import { logger } from '@giulio-leone/lib-shared';
import { createId } from '@giulio-leone/lib-core';

/**
 * Configurazione formati supportati
 */
const SUPPORTED_FORMATS = {
  spreadsheets: {
    extensions: ['.csv', '.xlsx', '.xls', '.ods'],
    mimeTypes: [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.oasis.opendocument.spreadsheet',
    ],
    icon: FileSpreadsheet,
    label: 'Spreadsheet',
    color: 'emerald',
  },
  pdf: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    icon: FileType,
    label: 'PDF',
    color: 'rose',
  },
  documents: {
    extensions: ['.docx', '.doc', '.odt'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.oasis.opendocument.text',
    ],
    icon: FileText,
    label: 'Document',
    color: 'purple',
  },
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    icon: FileImage,
    label: 'Image',
    color: 'blue',
  },
};
const ALL_EXTENSIONS = [
  ...SUPPORTED_FORMATS.spreadsheets.extensions,
  ...SUPPORTED_FORMATS.pdf.extensions,
  ...SUPPORTED_FORMATS.documents.extensions,
  ...SUPPORTED_FORMATS.images.extensions,
];
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: 'spreadsheet' | 'pdf' | 'document' | 'image';
  preview?: string;
  error?: string;
}
interface WorkoutImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (programId: string, stats: WorkoutImportResult['stats']) => void | Promise<void>;
  /** Crediti disponibili dell'utente */
  userCredits?: number;
  /** Costo in crediti (default: 10) */
  creditCost?: number;
}
/**
 * Determina il tipo di file
 */
function getFileType(file: File): UploadedFile['type'] | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (SUPPORTED_FORMATS.spreadsheets.extensions.includes(ext)) return 'spreadsheet';
  if (SUPPORTED_FORMATS.pdf.extensions.includes(ext)) return 'pdf';
  if (SUPPORTED_FORMATS.documents.extensions.includes(ext)) return 'document';
  if (SUPPORTED_FORMATS.images.extensions.includes(ext)) return 'image';
  return null;
}
/**
 * Ottiene l'icona per il tipo di file
 */
function getFileIcon(type: UploadedFile['type']) {
  switch (type) {
    case 'spreadsheet':
      return SUPPORTED_FORMATS.spreadsheets.icon;
    case 'pdf':
      return SUPPORTED_FORMATS.pdf.icon;
    case 'document':
      return SUPPORTED_FORMATS.documents.icon;
    case 'image':
      return SUPPORTED_FORMATS.images.icon;
    default:
      return FileText;
  }
}
/**
 * Formatta la dimensione del file
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function WorkoutImportModal({
  isOpen,
  onClose,
  onSuccess,
  userCredits = Infinity,
  creditCost = 10,
}: WorkoutImportModalProps) {
  const t = useTranslations();
  // State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mode, setMode] = useState<'auto' | 'review'>('auto');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  // Controlla se l'utente ha abbastanza crediti
  const hasEnoughCredits = userCredits >= creditCost;
  const canSubmit = files.length > 0 && hasEnoughCredits && !isUploading;
  // Reset state quando il modal si chiude
  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setProgress(null);
      setError(null);
      setIsDragging(false);
    }
  }, [isOpen]);
  /**
   * Valida e aggiunge un file
   */
  const addFile = useCallback(
    async (file: File) => {
      // Controlla limite file
      if (files.length >= 10) {
        setError('Massimo 10 file per import');
        return;
      }
      // Controlla tipo file
      const type = getFileType(file);
      if (!type) {
        setError(`Formato non supportato: ${file.name}`);
        return;
      }
      // Controlla dimensione (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File troppo grande: ${file.name} (max 10MB)`);
        return;
      }
      // Controlla duplicati
      if (files.some((f) => f.name === file.name && f.size === file.size)) {
        return; // Silently skip duplicates
      }
      // Crea preview per immagini
      let preview: string | undefined;
      if (type === 'image') {
        preview = URL.createObjectURL(file);
      }
      const uploadedFile: UploadedFile = {
        id: createId(),
        file,
        name: file.name,
        size: file.size,
        type,
        preview,
      };
      setFiles((prev) => [...prev, uploadedFile]);
      setError(null);
    },
    [files]
  );
  /**
   * Rimuove un file
   */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f: any) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f: any) => f.id !== id);
    });
  }, []);
  /**
   * Gestisce il drop di file
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach((file: any) => addFile(file));
    },
    [addFile]
  );
  /**
   * Gestisce il drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  /**
   * Gestisce il drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);
  /**
   * Gestisce la selezione file tramite input
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      selectedFiles.forEach((file: any) => addFile(file));
      // Reset input per permettere ri-selezione dello stesso file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addFile]
  );
  /**
   * Converte file in base64
   */
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Rimuovi il prefisso data:...;base64,
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  /**
   * Esegue l'import
   */
  const handleSubmit = async () => {
    if (!canSubmit) return;
    const requestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : createId();
    setIsUploading(true);
    setError(null);
    setProgress({
      step: 'validating',
      stepNumber: 1,
      totalSteps: 6,
      progress: 0,
      message: 'Preparazione file...',
    });
    try {
      // Converti tutti i file in base64
      const filesData = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          mimeType: f.file.type || 'application/octet-stream',
          content: await fileToBase64(f.file),
          size: f.size,
        }))
      );
      // Chiama API di import
      const response = await fetch('/api/workouts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          files: filesData,
          options: {
            mode,
            createMissingExercises: mode === 'auto',
            locale: navigator.language.split('-')[0] || 'en',
          },
        }),
      });
      if (!response.ok) {
        const apiError = await handleApiError(response);
        throw apiError;
      }
      const result: WorkoutImportResult = await response.json();
      if (!result.success) {
        throw new Error(result.errors?.join('\n') || t('common.error'));
      }
      // Successo!
      setProgress({
        step: 'completed',
        stepNumber: 6,
        totalSteps: 6,
        progress: 100,
        message: 'Import completato!',
      });
      // Cleanup preview URLs
      files.forEach((f: any) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      // Callback di successo
      if (result.programId) {
        await onSuccess(result.programId, result.stats);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante import';
      // Log client-side for debugging without leaking file contents
      logger.error('[WorkoutImport] Import fallito', { requestId, message });
      setError(requestId ? `${message}\n(id: ${requestId})` : message);
      setProgress({
        step: 'error',
        stepNumber: 0,
        totalSteps: 6,
        progress: 0,
        message: t('common.error'),
      });
    } finally {
      setIsUploading(false);
    }
  };
  /**
   * Calcola statistiche file
   */
  const fileStats = useMemo(() => {
    const totalSize = files.reduce((sum: any, f: any) => sum + f.size, 0);
    const count = {
      spreadsheet: files.filter((f: any) => f.type === 'spreadsheet').length,
      pdf: files.filter((f: any) => f.type === 'pdf').length,
      document: files.filter((f: any) => f.type === 'document').length,
      image: files.filter((f: any) => f.type === 'image').length,
    };
    return { totalSize, byType: count };
  }, [files]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('workouts.workout_import_modal.importa_programma_allenamento')}
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Header con info crediti */}
        <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-neutral-600 dark:text-neutral-400">
              {t('workouts.workout_import_modal.costo')}
              <strong>{creditCost} crediti</strong>
            </span>
            {!hasEnoughCredits && (
              <span className="text-rose-500">
                {t('workouts.workout_import_modal.hai')}
                {userCredits} {t('workouts.workout_import_modal.crediti')}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
        {/* Help panel */}
        {showHelp && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-800 dark:bg-blue-900/30">
            <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
              {t('workouts.workout_import_modal.formati_supportati')}
            </h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>
                • <strong>{t('workouts.workout_import_modal.spreadsheet')}</strong>{' '}
                {t('workouts.workout_import_modal.csv_xlsx_xls_ods')}
              </li>
              <li>
                • <strong>{t('workouts.workout_import_modal.pdf')}</strong>{' '}
                {t('workouts.workout_import_modal.pdf_analizzato_con_ai')}
              </li>
              <li>
                • <strong>{t('workouts.workout_import_modal.documenti')}</strong>{' '}
                {t('workouts.workout_import_modal.docx_doc_odt')}
              </li>
              <li>
                • <strong>{t('workouts.workout_import_modal.immagini')}</strong>{' '}
                {t('workouts.workout_import_modal.jpeg_png_webp_heic')}
              </li>
            </ul>
            <p className="mt-2 text-blue-600 dark:text-blue-400">
              {t('workouts.workout_import_modal.max_10_file_10mb_per_file_le_immagini_e_')}
            </p>
          </div>
        )}
        {/* Mode selector */}
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setMode('auto')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
              mode === 'auto'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            )}
          >
            <Zap className="h-4 w-4" />
            Auto
          </button>
          <button
            type="button"
            onClick={() => setMode('review')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
              mode === 'review'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            )}
          >
            <Eye className="h-4 w-4" />
            Review
          </button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {mode === 'auto'
            ? 'Modalità automatica: crea esercizi mancanti e salva il programma direttamente'
            : 'Modalità review: rivedi e conferma gli esercizi non trovati prima del salvataggio'}
        </p>
        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative rounded-xl border-2 border-dashed p-6 transition-colors',
            isDragging
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/50',
            files.length > 0 && 'pb-4'
          )}
        >
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex gap-2">
                <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                <FileType className="h-8 w-8 text-rose-500" />
                <FileImage className="h-8 w-8 text-blue-500" />
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-neutral-700 dark:text-neutral-300">
                  {t('workouts.workout_import_modal.trascina_i_file_qui_oppure')}
                </p>
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                  <Upload className="h-4 w-4" />
                  {t('workouts.workout_import_modal.scegli_file')}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALL_EXTENSIONS.join(',')}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('workouts.workout_import_modal.csv_xlsx_pdf_docx_immagini_max_10_file')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* File list */}
              {files.map((file: any) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3',
                      file.error
                        ? 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
                    )}
                  >
                    {file.preview ? (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <Icon
                        className={cn(
                          'h-10 w-10 rounded p-2',
                          file.type === 'spreadsheet' &&
                            'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30',
                          file.type === 'pdf' && 'bg-rose-50 text-rose-500 dark:bg-rose-900/30',
                          file.type === 'document' &&
                            'bg-purple-50 text-purple-500 dark:bg-purple-900/30',
                          file.type === 'image' && 'bg-blue-50 text-blue-500 dark:bg-blue-900/30'
                        )}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                    </div>
                    {file.error ? (
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {/* Add more files */}
              {files.length < 10 && (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-500 hover:border-emerald-500 hover:text-emerald-600 dark:border-neutral-600 dark:hover:border-emerald-500">
                  <Upload className="h-4 w-4" />
                  {t('workouts.workout_import_modal.aggiungi_altri_file')}
                  <input
                    type="file"
                    multiple
                    accept={ALL_EXTENSIONS.join(',')}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>
          )}
        </div>
        {/* Stats */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{files.length} file</span>
            <span>•</span>
            <span>{formatFileSize(fileStats.totalSize)}</span>
            {fileStats.byType.spreadsheet > 0 && (
              <>
                <span>•</span>
                <span>{fileStats.byType.spreadsheet} spreadsheet</span>
              </>
            )}
            {fileStats.byType.pdf > 0 && (
              <>
                <span>•</span>
                <span>{fileStats.byType.pdf} PDF</span>
              </>
            )}
            {fileStats.byType.image > 0 && (
              <>
                <span>•</span>
                <span>{fileStats.byType.image} immagini</span>
              </>
            )}
            {fileStats.byType.document > 0 && (
              <>
                <span>•</span>
                <span>{fileStats.byType.document} documenti</span>
              </>
            )}
          </div>
        )}
        {/* Progress */}
        {progress && isUploading && (
          <div className="space-y-2 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {progress.message}
              </span>
              <span className="text-neutral-500">
                {progress.stepNumber}/{progress.totalSteps}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            {(() => {
              const unmatched = (progress.metadata as Record<string, unknown> | undefined)
                ?.unmatchedExercises as string[] | undefined;
              return unmatched && unmatched.length > 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {unmatched.length} {t('workouts.workout_import_modal.esercizi_non_trovati')}
                </p>
              ) : null;
            })()}
          </div>
        )}
        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}
        {/* Footer */}
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? 'Importazione...' : `Importa (${creditCost} crediti)`}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
