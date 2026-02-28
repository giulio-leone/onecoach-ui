'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  FileImage,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  File,
  Coins,
  Timer,
} from 'lucide-react';
import { Input, Select } from '@giulio-leone/ui';
import { useAuth } from '@giulio-leone/lib-api/hooks';
import { useTranslations } from 'next-intl';

// Tipo compatibile per il dropdown (mappato da OpenRouterModelOption)
type ModelOption = {
  id: string;
  modelId: string;
  displayName: string;
  supportsVision: boolean;
  isActive: boolean;
};

interface ImportModelsConfigData {
  spreadsheetModel: string;
  imageModel: string;
  pdfModel: string;
  documentModel: string;
  fallbackModel: string;
  creditCosts: {
    image: number;
    pdf: number;
    document: number;
    spreadsheet: number;
  };
  maxRetries: number;
  retryDelayBaseMs: number;
}
// ============================================================================
// CONSTANTS - KISS: Single source of truth
// ============================================================================
const DEFAULT_CONFIG: ImportModelsConfigData = {
  spreadsheetModel: 'google/gemini-2.5-flash',
  imageModel: 'google/gemini-2.5-flash',
  pdfModel: 'google/gemini-2.5-flash',
  documentModel: 'google/gemini-2.5-flash',
  fallbackModel: 'openai/gpt-4o-mini',
  creditCosts: {
    image: 8,
    pdf: 10,
    document: 8,
    spreadsheet: 6,
  },
  maxRetries: 2,
  retryDelayBaseMs: 1000,
};
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
} as const;

// ============================================================================
// TYPES
// ============================================================================
type ModelKey = keyof Pick<
  ImportModelsConfigData,
  'spreadsheetModel' | 'imageModel' | 'pdfModel' | 'documentModel' | 'fallbackModel'
>;
type SelectOption = { value: string; label: string };
interface ModelFieldConfig {
  key: ModelKey;
  label: string;
  description: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

type CreditCostKey = keyof ImportModelsConfigData['creditCosts'];
interface CreditFieldConfig {
  key: CreditCostKey;
  label: string;
  description: string;
  placeholder: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ============================================================================
// UTILITIES
// ============================================================================
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

async function fetchErrorMessage(
  response: Response,
  baseMessage: string,
  t: (key: string) => string
): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData?.error || errorData?.message || parseHttpError(response, baseMessage, t);
  } catch {
    return parseHttpError(response, baseMessage, t);
  }
}

// ============================================================================
// COMPONENT
// ============================================================================
type ImportModelsConfigProps = {
  models: ModelOption[];
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ImportModelsConfig({ models }: ImportModelsConfigProps) {
  const t = useTranslations('admin.aiSettings.framework.import');
  const frameT = useTranslations('admin.aiSettings.framework');
  const visionT = useTranslations('admin.aiSettings.framework.vision'); // For errors

  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ImportModelsConfigData>(DEFAULT_CONFIG);
  const isInitialLoad = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic MODEL_FIELDS
  const modelFields = useMemo<ModelFieldConfig[]>(
    () => [
      {
        key: 'spreadsheetModel',
        label: 'Spreadsheet (CSV/XLSX)',
        description: frameT('metadata.workout_import.description'),
        placeholder: 'google/gemini-2.5-flash',
        icon: FileSpreadsheet,
        color: 'green',
      },
      {
        key: 'imageModel',
        label: 'Immagini',
        description: frameT('metadata.adaptive_recovery.description'),
        placeholder: 'google/gemini-2.5-flash',
        icon: FileImage,
        color: 'blue',
      },
      {
        key: 'pdfModel',
        label: 'PDF',
        description: frameT('metadata.import_models.description'),
        placeholder: 'google/gemini-2.5-flash',
        icon: File,
        color: 'red',
      },
      {
        key: 'documentModel',
        label: 'Documenti (Word/DOCX)',
        description: frameT('metadata.orchestration_tracing.description'),
        placeholder: 'google/gemini-2.5-flash',
        icon: FileText,
        color: 'purple',
      },
      {
        key: 'fallbackModel',
        label: 'Modello Fallback',
        description: frameT('metadata.intelligent_mode_selection.description'),
        placeholder: 'openai/gpt-4o-mini',
        icon: AlertCircle,
        color: 'orange',
      },
    ],
    [frameT]
  );

  const creditFields = useMemo<CreditFieldConfig[]>(
    () => [
      {
        key: 'image',
        label: 'Crediti Immagini',
        description: 'Parsing screenshot / foto',
        placeholder: DEFAULT_CONFIG.creditCosts.image,
        icon: FileImage,
        color: 'blue',
      },
      {
        key: 'pdf',
        label: 'Crediti PDF',
        description: 'Parsing PDF multi-pagina',
        placeholder: DEFAULT_CONFIG.creditCosts.pdf,
        icon: File,
        color: 'red',
      },
      {
        key: 'document',
        label: 'Crediti Documenti',
        description: 'Parsing DOC/DOCX/ODT',
        placeholder: DEFAULT_CONFIG.creditCosts.document,
        icon: FileText,
        color: 'purple',
      },
      {
        key: 'spreadsheet',
        label: 'Crediti Spreadsheet',
        description: 'Parsing CSV/XLSX',
        placeholder: DEFAULT_CONFIG.creditCosts.spreadsheet,
        icon: FileSpreadsheet,
        color: 'green',
      },
    ],
    []
  );

  const activeModels = useMemo(() => models.filter((m: any) => m.isActive), [models]);
  const toOption = useCallback(
    (model: ModelOption): SelectOption => ({
      value: model.modelId,
      label: `${model.displayName} (${model.modelId})`,
    }),
    []
  );

  const addCurrentValue = useCallback(
    (options: SelectOption[], currentValue: string): SelectOption[] => {
      if (!currentValue) return options;
      if (options.some((o) => o.value === currentValue)) return options;
      return [
        ...options,
        { value: currentValue, label: `${currentValue} (non attivo o senza accesso)` },
      ];
    },
    []
  );

  const visionOptions = useMemo(
    () => activeModels.filter((m: any) => m.supportsVision).map(toOption),
    [activeModels, toOption]
  );
  const allOptions = useMemo(() => activeModels.map(toOption), [activeModels, toOption]);

  const modelOptionsByKey = useMemo<Record<ModelKey, SelectOption[]>>(
    () => ({
      imageModel: addCurrentValue(visionOptions, config.imageModel),
      pdfModel: addCurrentValue(visionOptions, config.pdfModel),
      documentModel: addCurrentValue(visionOptions, config.documentModel),
      spreadsheetModel: addCurrentValue(allOptions, config.spreadsheetModel),
      fallbackModel: addCurrentValue(allOptions, config.fallbackModel),
    }),
    [
      visionOptions,
      allOptions,
      addCurrentValue,
      config.imageModel,
      config.pdfModel,
      config.documentModel,
      config.spreadsheetModel,
      config.fallbackModel,
    ]
  );

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/import-models', { credentials: 'same-origin' });
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        setConfig(DEFAULT_CONFIG);
        return;
      }
      if (!response.ok) {
        const message = await fetchErrorMessage(response, visionT('unknownError'), (key) =>
          visionT(key)
        );
        throw new Error(message);
      }
      const data = await response.json();
      if (data.config) {
        const incoming = data.config as Partial<ImportModelsConfigData>;
        setConfig({
          ...DEFAULT_CONFIG,
          ...incoming,
          creditCosts: {
            ...DEFAULT_CONFIG.creditCosts,
            ...(incoming.creditCosts ?? {}),
          },
          maxRetries: incoming.maxRetries ?? DEFAULT_CONFIG.maxRetries,
          retryDelayBaseMs: incoming.retryDelayBaseMs ?? DEFAULT_CONFIG.retryDelayBaseMs,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : visionT('unknownError');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [visionT]);

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      setError(visionT('forbiddenError'));
      setIsLoading(false);
      return;
    }
    if (!isAuthLoading && isAdmin) {
      loadConfig().then(() => {
        isInitialLoad.current = false;
      });
    }
  }, [isAuthLoading, isAdmin, loadConfig, visionT]);

  const performSave = useCallback(
    async (configToSave: ImportModelsConfigData) => {
      try {
        setSaveStatus('saving');
        setError(null);
        const response = await fetch('/api/admin/import-models', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configToSave),
        });
        if (!response.ok) {
          const message = await fetchErrorMessage(
            response,
            visionT('unknownError'),
            (key: string) => visionT(key)
          );
          throw new Error(message);
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : visionT('unknownError');
        setError(errorMessage);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [visionT]
  );

  useEffect(() => {
    if (isInitialLoad.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      performSave(config);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [config, performSave]);

  const handleFieldChange = (key: ModelKey) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig((prev) => ({ ...prev, [key]: e.target.value }));
  };
  const handleCreditCostChange =
    (key: CreditCostKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setConfig((prev) => ({
        ...prev,
        creditCosts: {
          ...prev.creditCosts,
          [key]: Number.isNaN(value) ? 0 : value,
        },
      }));
    };
  const handleNumberChange =
    (key: 'maxRetries' | 'retryDelayBaseMs') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      setConfig((prev) => ({
        ...prev,
        [key]: Number.isNaN(value) ? prev[key] : value,
      }));
    };
  const getColorClasses = (color: string): { bg: string; icon: string } => {
    const defaultColor = {
      bg: 'bg-primary-100 dark:bg-primary-900/30',
      icon: 'text-primary-600 dark:text-primary-400',
    };
    const colorMap: Record<string, { bg: string; icon: string }> = {
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
      },
      blue: defaultColor,
      red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
      purple: {
        bg: 'bg-secondary-100 dark:bg-secondary-900/30',
        icon: 'text-secondary-600 dark:text-secondary-400',
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        icon: 'text-orange-600 dark:text-orange-400',
      },
    };
    return colorMap[color] || defaultColor;
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
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {visionT('errorTitle')}
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {saveStatus === 'saved' && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            {t('autoSave.success')}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modelFields.map((field: ModelFieldConfig) => {
          const Icon = field.icon;
          const colors = getColorClasses(field.color);
          return (
            <div
              key={field.key}
              className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-950"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {field.label}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    {field.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {visionT('openrouterModel')}
                </label>
                <Select
                  value={config[field.key]}
                  onChange={handleFieldChange(field.key)}
                  className="font-mono text-sm"
                >
                  <option value="">{t('selectEnabled')}</option>
                  {modelOptionsByKey[field.key].map((option: SelectOption) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {t('defaultLabel', { model: field.placeholder })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
            <Coins className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {t('creditCosts.title')}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {t('creditCosts.description')}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creditFields.map((field: CreditFieldConfig) => {
            const Icon = field.icon;
            const colors = getColorClasses(field.color);
            return (
              <div
                key={field.key}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-white/[0.08] dark:bg-[#09090b]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    <Icon className={`h-4 w-4 ${colors.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {field.label}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {field.description}
                    </p>
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={config.creditCosts[field.key]}
                  onChange={handleCreditCostChange(field.key)}
                  className="font-mono text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
            <Timer className="h-5 w-5 text-primary-600 dark:text-primary-300" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {t('retry.title')}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {t('retry.description')}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {t('retry.maxAttempts')}
            </label>
            <Input
              type="number"
              min={0}
              max={5}
              value={config.maxRetries}
              onChange={handleNumberChange('maxRetries')}
              className="font-mono text-sm"
            />
            <p className="text-xs text-neutral-400 dark:text-neutral-500">{t('retry.range')}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {t('retry.delayBase')}
            </label>
            <Input
              type="number"
              min={0}
              step={100}
              value={config.retryDelayBaseMs}
              onChange={handleNumberChange('retryDelayBaseMs')}
              className="font-mono text-sm"
            />
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {t('retry.backoffDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('autoSave.saving')}</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>{t('autoSave.saved')}</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{t('autoSave.error')}</span>
          </div>
        )}
        {saveStatus === 'idle' && (
          <div className="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500">
            <Check className="h-4 w-4" />
            <span>{t('autoSave.active')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
