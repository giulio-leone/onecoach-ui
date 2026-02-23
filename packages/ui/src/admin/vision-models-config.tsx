'use client';
import { useState, useEffect, useCallback } from 'react';
import { Camera, Scan, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button, Input } from '@giulio-leone/ui';
import { useAuth } from '@giulio-leone/lib-api/hooks';
import { useTranslations } from 'next-intl';

// DRY: Costanti centralizzate
const DEFAULT_MODELS = {
  label: 'google/gemini-2.5-flash-lite',
  segmentation: 'google/gemini-2.5-flash',
} as const;
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
} as const;
/**
 * DRY: Gestione centralizzata errori HTTP
 * SOLID: Single Responsibility - solo parsing errori
 */
function parseHttpError(
  response: Response,
  baseMessage: string,
  t: (key: string) => string
): string {
  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    return t('authError');
  }
  if (response.status === HTTP_STATUS.FORBIDDEN) {
    return t('forbiddenError');
  }
  return `${baseMessage} (status ${response.status})`;
}
/**
 * DRY: Gestione errore response con parsing JSON opzionale
 */
async function fetchErrorMessage(
  response: Response,
  baseMessage: string,
  t: (key: string) => string
): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData?.error || errorData?.message || parseHttpError(response, baseMessage, t);
  } catch (_error: unknown) {
    return parseHttpError(response, baseMessage, t);
  }
}
export function VisionModelsConfig() {
  const t = useTranslations('admin.aiSettings.framework.vision');
  const tRoot = useTranslations();
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labelModel, setLabelModel] = useState<string>(DEFAULT_MODELS.label);
  const [segmentationModel, setSegmentationModel] = useState<string>(DEFAULT_MODELS.segmentation);

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/vision-models', { credentials: 'same-origin' });
      // KISS: 404 è un caso valido (configurazione non ancora creata)
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        setLabelModel(DEFAULT_MODELS.label);
        setSegmentationModel(DEFAULT_MODELS.segmentation);
        return;
      }
      if (!response.ok) {
        const message = await fetchErrorMessage(response, t('unknownError'), t);
        throw new Error(message);
      }
      const data = await response.json();
      if (data.labelExtraction) setLabelModel(data.labelExtraction);
      if (data.dishSegmentation) setSegmentationModel(data.dishSegmentation);
    } catch (err: unknown) {
      // KISS: Errore mostrato all'utente via setError, no logging necessario
      const errorMessage = err instanceof Error ? err.message : t('unknownError');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      setError(t('forbiddenError'));
      setIsLoading(false);
      return;
    }
    if (!isAuthLoading && isAdmin) {
      loadConfig();
    }
  }, [isAuthLoading, isAdmin, loadConfig, t]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaved(false);
      const response = await fetch('/api/admin/vision-models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labelExtraction: labelModel,
          dishSegmentation: segmentationModel,
        }),
      });
      if (!response.ok) {
        const message = await fetchErrorMessage(response, t('unknownError'), t);
        throw new Error(message);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      // KISS: Errore mostrato all'utente via setError, no logging necessario
      const errorMessage = err instanceof Error ? err.message : t('unknownError');
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400 dark:text-neutral-600" />
      </div>
    );
  }
  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('title')}
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">{t('description')}</p>
      </div>
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{t('errorTitle')}</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            aria-label={t('closeError')}
          >
            ×
          </button>
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">{t('saved')}</p>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Label Extraction Model */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Scan className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {t('labelExtraction.title')}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {t('labelExtraction.description')}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {t('openrouterModel')}
              </label>
              <Input
                type="text"
                value={labelModel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabelModel(e.target.value)}
                placeholder={tRoot('admin.vision_models_config.google_gemini_2_5_flash_lite')}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                {t('defaultLabel')}
              </p>
            </div>
          </div>
        </div>
        {/* Dish Segmentation Model */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Camera className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {t('dishSegmentation.title')}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {t('dishSegmentation.description')}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {t('openrouterModel')}
              </label>
              <Input
                type="text"
                value={segmentationModel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSegmentationModel(e.target.value)
                }
                placeholder={tRoot('admin.vision_models_config.google_gemini_2_5_flash')}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                {t('defaultSegmentation')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} variant="primary">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t('saved')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
