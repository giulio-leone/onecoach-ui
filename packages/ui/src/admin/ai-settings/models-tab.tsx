/**
 * AI Models Management Tab
 * Full CRUD for AI models with role access matrix
 * Supports sync from OpenRouter and other providers
 */

'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Bot,
  Plus,
  Edit3,
  Trash2,
  Star,
  Eye,
  Wrench,
  Zap,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Download,
  Loader2,
  Server,
} from 'lucide-react';
import type { AIModel, ModelAccess } from './types';
import {
  PROVIDERS,
  PROVIDER_LABELS,
  PROVIDER_COLORS,
  ROLES,
  ROLE_LABELS,
  EXTERNAL_PROVIDERS,
  EXTERNAL_PROVIDER_LABELS,
  OPENROUTER_PROVIDERS,
  EXTERNAL_TO_AI_PROVIDER,
} from './constants';
import type { UserRole, AIProvider } from '@prisma/client';
import { toast } from 'sonner';
import { Checkbox } from '@giulio-leone/ui';
import { createPortal } from 'react-dom';

import { logger } from '@giulio-leone/lib-shared';

// Model returned from the sync endpoint
interface SyncModelData {
  modelId: string;
  name: string;
  description?: string;
  contextLength?: number;
  promptPrice: number;
  completionPrice: number;
  supportsImages: boolean;
  supportsReasoning: boolean;
  supportsStructuredOutput: boolean;
}

// External model from OpenRouter/providers
interface ExternalModel {
  id: string;
  modelId: string;
  provider: string;
  name: string;
  description?: string;
  contextLength?: number;
  promptPrice: number;
  completionPrice: number;
  supportsImages: boolean;
  supportsReasoning: boolean;
  supportsStructuredOutput: boolean;
  isActive: boolean;
}

interface ModelsTabProps {
  models: AIModel[];
  modelAccess: ModelAccess[];
  onModelsChange: (models: AIModel[]) => void;
  onUpdateModel: (modelId: string, data: Partial<AIModel>) => Promise<void>;
  onUpdateModelAccess: (modelId: string, role: string, canSelect: boolean) => Promise<void>;
  // Deprecated/Unused but kept for interface compatibility if needed, or better remove:
  // onSave: () => Promise<void>;
  // isSaving: boolean;
}

export function ModelsTab({
  models,
  modelAccess,
  onModelsChange,
  onUpdateModel,
  onUpdateModelAccess,
}: ModelsTabProps) {
  const t = useTranslations('admin.aiSettings.models');
  const commonT = useTranslations('common');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [showAccessMatrix, setShowAccessMatrix] = useState(false);

  // Sync from OpenRouter/Providers state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [externalModels, setExternalModels] = useState<ExternalModel[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [selectedExternalModels, setSelectedExternalModels] = useState<Set<string>>(new Set());
  const [syncSearch, setSyncSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSyncProvider, setSelectedSyncProvider] = useState<string>('openrouter');

  // Fetch external models from Provider
  const fetchExternalModels = useCallback(async () => {
    setIsLoadingExternal(true);
    try {
      // Get models for the selected provider from our DB sync cache
      const res = await fetch(`/api/admin/config/provider-models/${selectedSyncProvider}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.success) {
        setExternalModels(data.models);
      }
    } catch (error) {
      logger.error('Failed to fetch external models', error);
      toast.error(t('import.loadingModels'));
    } finally {
      setIsLoadingExternal(false);
    }
  }, [selectedSyncProvider, t]);

  // Fetch when provider changes or modal opens
  useEffect(() => {
    if (showSyncModal) {
      // Clear previous models immediately to avoid flickering/glitches
      setExternalModels([]);
      setSelectedExternalModels(new Set());
      setSyncSearch('');
      fetchExternalModels();
    }
  }, [showSyncModal, selectedSyncProvider, fetchExternalModels]);

  // Import selected external models to ai_chat_models
  const importSelectedModels = useCallback(async () => {
    if (selectedExternalModels.size === 0) return;

    setIsSyncing(true);
    try {
      const modelsToImport = externalModels.filter((m: any) => selectedExternalModels.has(m.id));

      // Import each model
      for (const extModel of modelsToImport) {
        // Check if already exists in ai_chat_models
        const targetProvider = EXTERNAL_TO_AI_PROVIDER[extModel.provider] || 'OPENROUTER';
        const exists = models.some(
          (m) => m.modelId === extModel.modelId && m.provider === targetProvider
        );
        if (exists) continue;

        const res = await fetch('/api/admin/ai-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createModel',
            data: {
              provider: targetProvider as AIProvider,
              modelId: extModel.modelId,
              displayName: extModel.name,
              description: extModel.description || null,
              isActive: true,
              isDefault: false,
              maxTokens: extModel.contextLength || 8192,
              contextWindow: extModel.contextLength || 128000,
              inputPricePerMillion: extModel.promptPrice,
              outputPricePerMillion: extModel.completionPrice,
              supportsVision: extModel.supportsImages,
              supportsTools: extModel.supportsStructuredOutput,
              supportsStreaming: true,
              supportsReasoning: extModel.supportsReasoning,
              sortOrder: models.length,
            },
          }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.model) {
            onModelsChange([...models, result.model]);
          }
        }
      }

      toast.success(t('import.importSuccess', { count: selectedExternalModels.size }));
      setShowSyncModal(false);
      setSelectedExternalModels(new Set());
    } catch (error) {
      logger.error('Import failed', error);
      toast.error(t('import.importError'));
    } finally {
      setIsSyncing(false);
    }
  }, [externalModels, models, onModelsChange, selectedExternalModels, t]);

  // Sync new models from Provider API
  const syncFromProvider = useCallback(async () => {
    setIsLoadingExternal(true);
    try {
      const res = await fetch(`/api/admin/config/provider-models/${selectedSyncProvider}/sync`, {
        method: 'GET',
      });
      if (!res.ok) throw new Error('Failed to sync');
      const data = await res.json();

      if (data.success && data.models) {
        // We also want to save these automatically to our cache DB
        // (The new POST sync route does this, but here we just fetched them)
        // Let's call the batch save endpoint to persist them as "cached" external models
        await fetch(`/api/admin/config/provider-models/${selectedSyncProvider}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ models: data.models }),
        });

        // Show them for selection
        setExternalModels((prev) => {
          const existingIds = new Set(prev.map((m: any) => m.modelId));
          // Provide a fallback ID for filtering if modelId is somehow missing
          const newModels = data.models.filter(
            (m: { modelId: string }) => !existingIds.has(m.modelId)
          );

          return [
            ...prev,
            ...newModels.map((m: SyncModelData) => ({
              id: `sync-${m.modelId}`,
              modelId: m.modelId,
              provider: selectedSyncProvider,
              name: m.name,
              description: m.description,
              contextLength: m.contextLength,
              promptPrice: m.promptPrice,
              completionPrice: m.completionPrice,
              supportsImages: m.supportsImages,
              supportsReasoning: m.supportsReasoning,
              supportsStructuredOutput: m.supportsStructuredOutput,
              isActive: true,
            })),
          ];
        });
        toast.success(
          t('import.syncSuccess', {
            count: data.models.length,
            provider: EXTERNAL_PROVIDER_LABELS[selectedSyncProvider] || selectedSyncProvider,
          })
        );
      }
    } catch (error) {
      logger.error('Sync failed', error);
      toast.error(
        t('import.syncError', {
          provider: EXTERNAL_PROVIDER_LABELS[selectedSyncProvider] || selectedSyncProvider,
        })
      );
    } finally {
      setIsLoadingExternal(false);
    }
  }, [selectedSyncProvider, t]);

  // Filter external models not already in chat models
  const availableExternalModels = useMemo(
    () =>
      externalModels
        .filter((ext: any) => {
          // Exclude models already in ai_chat_models
          return !models.some((m) => m.modelId === ext.modelId);
        })
        .filter((m: any) =>
            syncSearch === '' ||
            m.name.toLowerCase().includes(syncSearch.toLowerCase()) ||
            m.modelId.toLowerCase().includes(syncSearch.toLowerCase())
        ),
    [externalModels, models, syncSearch]
  );

  // Toggle model active
  const toggleModel = useCallback(
    (modelId: string) => {
      const model = models.find((m: any) => m.id === modelId);
      if (model) {
        onUpdateModel(modelId, { isActive: !model.isActive });
      }
    },
    [models, onUpdateModel]
  );

  // Set default model
  const setDefaultModel = useCallback(
    (modelId: string) => {
      onUpdateModel(modelId, { isDefault: true });
    },
    [onUpdateModel]
  );

  // Toggle role access for model
  const toggleModelAccess = useCallback(
    (modelId: string, role: UserRole) => {
      const existing = modelAccess.find(
        (a: ModelAccess) => a.modelId === modelId && a.role === role
      );
      const canSelect = existing ? !existing.canSelect : true; // Default true if establishing new rule

      onUpdateModelAccess(modelId, role, canSelect);
    },
    [modelAccess, onUpdateModelAccess]
  );

  // Delete model
  const deleteModel = useCallback(
    async (modelId: string) => {
      if (!confirm(t('deleteConfirm'))) return;

      try {
        const res = await fetch(`/api/admin/ai-settings?modelId=${modelId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Errore eliminazione');

        onModelsChange(models.filter((m: any) => m.id !== modelId));
        toast.success(t('deleteSuccess') || 'Modello eliminato');
      } catch {
        toast.error(t('deleteError') || "Errore durante l'eliminazione");
      }
    },
    [models, onModelsChange, t]
  );

  // Get access for model/role
  const getAccess = (modelId: string, role: UserRole): boolean => {
    const access = modelAccess.find((a: ModelAccess) => a.modelId === modelId && a.role === role);
    return access?.canSelect ?? true; // Default true if no record
  };

  // Group models by provider
  const modelsByProvider = models.reduce<Record<string, AIModel[]>>((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('activeCount', {
              count: models.filter((m: any) => m.isActive).length,
              active: models.filter((m: any) => m.isActive).length,
              total: models.length,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAccessMatrix(!showAccessMatrix)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5',
              'text-sm font-medium',
              'border transition-all',
              showAccessMatrix
                ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                : 'border-neutral-200/60 text-neutral-600 hover:bg-neutral-50 dark:border-white/[0.08] dark:text-neutral-400 dark:hover:bg-white/[0.06]'
            )}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{t('accessMatrix')}</span>
          </button>
          <button
            onClick={() => {
              setShowSyncModal(true);
              fetchExternalModels();
            }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5',
              'text-sm font-medium',
              'border border-indigo-200 bg-indigo-50 text-indigo-600',
              'dark:border-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400',
              'hover:bg-indigo-100 dark:hover:bg-indigo-500/20',
              'transition-all'
            )}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('importModels')}</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5',
              'from-primary-500 bg-gradient-to-r to-violet-600',
              'text-sm font-medium text-white',
              'shadow-primary-500/25 shadow-lg',
              'hover:shadow-primary-500/30 hover:shadow-xl',
              'transition-all duration-200'
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('newModel')}</span>
          </button>
        </div>
      </div>

      {/* Access Matrix View */}
      <AnimatePresence>
        {showAccessMatrix && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'rounded-2xl p-4 sm:p-6',
                'bg-white/80 dark:bg-white/[0.06]',
                'backdrop-blur-xl',
                'border border-neutral-200/50 dark:border-white/[0.08]',
                'overflow-x-auto'
              )}
            >
              <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">
                {t('accessMatrixTitle')}
              </h3>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="pb-3 text-left text-sm font-medium text-neutral-500">
                      {t('modelName')}
                    </th>
                    {ROLES.map((role: any) => (
                      <th
                        key={role}
                        className="pb-3 text-center text-sm font-medium text-neutral-500"
                      >
                        {ROLE_LABELS[role]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.08]/50">
                  {models
                    .filter((m: any) => m.isActive)
                    .map((model: any) => (
                      <tr key={model.id}>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {model.displayName}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {PROVIDER_LABELS[model.provider]}
                            </span>
                          </div>
                        </td>
                        {ROLES.map((role: any) => {
                          const hasAccess = getAccess(model.id, role as UserRole);
                          return (
                            <td key={role} className="py-3 text-center">
                              <button
                                onClick={() => toggleModelAccess(model.id, role as UserRole)}
                                className="inline-flex items-center justify-center"
                              >
                                {hasAccess ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Models by Provider */}
      <div className="space-y-6">
        {(Object.entries(modelsByProvider) as Array<[string, AIModel[]]>).map(
          ([provider, modelsForProvider]) => {
            return (
              <div key={provider}>
                {/* Provider Header */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full bg-gradient-to-r',
                      PROVIDER_COLORS[provider] || 'from-neutral-400 to-neutral-500'
                    )}
                  />
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {PROVIDER_LABELS[provider] || provider}
                  </h3>
                  <span className="text-xs text-neutral-400">
                    (
                    {t('activeCount', {
                      count: modelsForProvider.filter((m: any) => m.isActive).length,
                      active: modelsForProvider.filter((m: any) => m.isActive).length,
                      total: modelsForProvider.length,
                    })}
                    )
                  </span>
                </div>

                {/* Models Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {modelsForProvider.map((model: AIModel) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isExpanded={expandedModel === model.id}
                      onToggleExpand={() =>
                        setExpandedModel(expandedModel === model.id ? null : model.id)
                      }
                      onToggleActive={() => toggleModel(model.id)}
                      onSetDefault={() => setDefaultModel(model.id)}
                      onEdit={() => setEditingModel(model)}
                      onDelete={() => deleteModel(model.id)}
                    />
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Empty State */}
      {models.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-white/[0.04]">
            <Bot className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t('noModels')}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t('noModelsDesc')}</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/[0.06]"
          >
            <Plus className="h-4 w-4" />
            {t('newModel')}
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(isCreating || editingModel) && (
          <ModelFormModal
            model={editingModel}
            onClose={() => {
              setIsCreating(false);
              setEditingModel(null);
            }}
            onSave={async (data) => {
              // Handle save
              if (editingModel) {
                // Granular update for existing model
                await onUpdateModel(editingModel.id, data);
                toast.success(t('models_tab.modello_aggiornato'));
              } else {
                // Create new - call API
                try {
                  const res = await fetch('/api/admin/ai-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'createModel', data }),
                  });
                  if (!res.ok) throw new Error();
                  const result = await res.json();
                  onModelsChange([...models, result.model]);
                  toast.success(t('models_tab.modello_creato'));
                } catch {
                  toast.error(t('models_tab.errore_nella_creazione'));
                }
              }
              setIsCreating(false);
              setEditingModel(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Import Models Modal - Portal to body to escape overflow clipping */}
      {showSyncModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSyncModal(false)}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className={cn(
                  'relative flex w-full max-w-2xl flex-col',
                  'h-full max-h-[90vh] sm:h-[600px]',
                  'rounded-t-3xl sm:rounded-3xl',
                  'bg-white dark:bg-zinc-950',
                  'overflow-hidden shadow-2xl'
                )}
              >
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/60 bg-white p-4 sm:px-6 sm:py-5 dark:border-white/[0.08] dark:bg-zinc-950">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {t('import.title')}
                      </h2>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('import.subtitle', {
                          provider:
                            EXTERNAL_PROVIDER_LABELS[selectedSyncProvider] || selectedSyncProvider,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSyncModal(false)}
                      className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
                    >
                      <X className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    </button>
                  </div>

                  {/* Filters & Actions */}
                  <div className="shrink-0 border-b border-neutral-200/60 bg-neutral-50/50 p-4 sm:px-6 dark:border-white/[0.08] dark:bg-white/[0.05]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <select
                          value={selectedSyncProvider}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSelectedSyncProvider(e.target.value)
                          }
                          className={cn(
                            'w-full rounded-xl border px-3 py-2',
                            'border-neutral-200/60 dark:border-white/[0.08]',
                            'bg-white dark:bg-white/[0.04]',
                            'text-sm text-neutral-900 dark:text-white',
                            'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                          )}
                        >
                          {EXTERNAL_PROVIDERS.map((p: any) => (
                            <option key={p} value={p}>
                              {EXTERNAL_PROVIDER_LABELS[p]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relative flex-[2]">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={syncSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSyncSearch(e.target.value)
                          }
                          placeholder={t('import.searchPlaceholder')}
                          className={cn(
                            'w-full rounded-xl border py-2 pr-4 pl-9',
                            'text-sm',
                            'border-neutral-200/60 dark:border-white/[0.08]',
                            'bg-white dark:bg-white/[0.04]',
                            'text-neutral-900 dark:text-white',
                            'placeholder:text-neutral-400',
                            'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                          )}
                        />
                      </div>
                      <button
                        onClick={syncFromProvider}
                        disabled={isLoadingExternal}
                        className={cn(
                          'flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2',
                          'text-sm font-medium',
                          'border border-neutral-200/60 bg-white text-neutral-600',
                          'dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-400',
                          'transition-colors hover:bg-neutral-50 dark:hover:bg-white/[0.08]',
                          'disabled:opacity-50'
                        )}
                      >
                        <RefreshCw className={cn('h-4 w-4', isLoadingExternal && 'animate-spin')} />
                        {t('import.refreshList')}
                      </button>
                    </div>

                    {availableExternalModels.length > 0 && (
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={() => {
                            const allIds = availableExternalModels.map((m: any) => m.id);
                            if (selectedExternalModels.size === allIds.length) {
                              setSelectedExternalModels(new Set());
                            } else {
                              setSelectedExternalModels(new Set(allIds));
                            }
                          }}
                          className="text-primary-600 dark:text-primary-400 text-xs font-medium hover:underline"
                        >
                          {selectedExternalModels.size === availableExternalModels.length
                            ? t('common.deselectAll') || 'Deseleziona tutti'
                            : t('import.selectAll', { count: availableExternalModels.length })}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Models List */}
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-6">
                    {isLoadingExternal && availableExternalModels.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        <p className="mt-4 text-sm text-neutral-500">{t('import.loadingModels')}</p>
                      </div>
                    ) : availableExternalModels.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Search className="h-8 w-8 text-neutral-300" />
                        <h4 className="mt-4 font-medium text-neutral-900 dark:text-white">
                          {t('import.noModelsFound')}
                        </h4>
                        <p className="mt-1 text-sm text-neutral-500">
                          {t('import.noModelsFoundDesc')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 py-3">
                        {availableExternalModels.map((model: any) => (
                          <div
                            key={model.id}
                            onClick={() => {
                              setSelectedExternalModels((prev) => {
                                const next = new Set(prev);
                                if (next.has(model.id)) next.delete(model.id);
                                else next.add(model.id);
                                return next;
                              });
                            }}
                            className={cn(
                              'group flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all',
                              selectedExternalModels.has(model.id)
                                ? 'border-primary-500 bg-primary-50/50 dark:border-primary-500/50 dark:bg-primary-900/10'
                                : 'border-neutral-200/60 hover:border-neutral-300 hover:bg-neutral-50 dark:border-white/[0.08] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06]/50'
                            )}
                          >
                            <div className="pointer-events-none pt-0.5">
                              <Checkbox checked={selectedExternalModels.has(model.id)} readOnly />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="truncate font-medium text-neutral-900 dark:text-white">
                                  {model.name}
                                </h4>
                                {(model.promptPrice > 0 || model.completionPrice > 0) && (
                                  <div className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400">
                                    ${model.promptPrice.toFixed(2)}
                                    {t('models_tab.m')}
                                  </div>
                                )}
                              </div>

                              <p className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                                {model.modelId}
                              </p>

                              <div className="flex flex-wrap gap-2 pt-1">
                                {model.contextLength && model.contextLength > 0 && (
                                  <span className="inline-flex items-center rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400">
                                    {Math.round(model.contextLength / 1000)}
                                    {t('models_tab.k_ctx')}
                                  </span>
                                )}
                                {model.supportsImages && (
                                  <span className="inline-flex items-center gap-1 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                                    <Eye className="h-3 w-3" /> Vision
                                  </span>
                                )}
                                {model.supportsReasoning && (
                                  <span className="inline-flex items-center gap-1 rounded bg-secondary-50 px-1.5 py-0.5 text-[10px] font-medium text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400">
                                    <Bot className="h-3 w-3" /> Reasoning
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer (Fixed) */}
                  <div className="shrink-0 border-t border-neutral-200/60 bg-white p-4 sm:px-6 sm:py-5 dark:border-white/[0.08] dark:bg-zinc-950">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {t('import.selectedCount', { count: selectedExternalModels.size }) ||
                          `${selectedExternalModels.size} selezionati`}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowSyncModal(false)}
                          className={cn(
                            'rounded-xl px-4 py-2.5',
                            'text-sm font-medium',
                            'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/[0.06]',
                            'transition-colors'
                          )}
                        >
                          {commonT('cancel')}
                        </button>
                        <button
                          onClick={importSelectedModels}
                          disabled={selectedExternalModels.size === 0 || isSyncing}
                          className={cn(
                            'flex items-center gap-2 rounded-xl px-5 py-2.5',
                            'text-sm font-semibold text-white',
                            'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/[0.06]',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'shadow-sm transition-all'
                          )}
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {t('import.importSelected', { count: selectedExternalModels.size })}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

// Model Card Component
interface ModelCardProps {
  model: AIModel;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onSetDefault: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ModelCard({
  model,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onSetDefault,
  onEdit,
  onDelete,
}: ModelCardProps) {
  const t = useTranslations('admin.aiSettings.models');

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl p-4 transition-all duration-200',
        'border',
        model.isActive
          ? 'border-primary-200 dark:border-primary-800 bg-white dark:bg-white/[0.04]'
          : 'border-neutral-200/50 bg-neutral-50/50 opacity-60 dark:border-white/[0.08] dark:bg-white/[0.05]',
        model.isDefault && 'ring-primary-500 ring-2 ring-offset-2 dark:ring-offset-[#09090b]'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium text-neutral-900 dark:text-white">
              {model.displayName}
            </h4>
            {model.isDefault && <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{model.modelId}</p>
        </div>
        <button onClick={onToggleActive} className="shrink-0">
          {model.isActive ? (
            <ToggleRight className="text-primary-500 h-6 w-6" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-neutral-400" />
          )}
        </button>
      </div>

      {/* Capabilities */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {model.supportsVision && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5',
              'text-xs font-medium',
              'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
            )}
          >
            <Eye className="h-3 w-3" />
            Vision
          </span>
        )}
        {model.supportsTools && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5',
              'text-xs font-medium',
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            )}
          >
            <Wrench className="h-3 w-3" />
            Tools
          </span>
        )}
        {model.supportsStreaming && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5',
              'text-xs font-medium',
              'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
            )}
          >
            <Zap className="h-3 w-3" />
            Stream
          </span>
        )}
        {model.supportsReasoning && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5',
              'text-xs font-medium',
              'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400'
            )}
          >
            <Bot className="h-3 w-3" />
            Reasoning
          </span>
        )}
        {model.preferredProvider && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5',
              'text-xs font-medium',
              'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
            )}
            title={`Provider: ${model.preferredProvider}`}
          >
            <Server className="h-3 w-3" />
            {model.preferredProvider}
          </span>
        )}
      </div>

      {/* Expand Toggle */}
      <button
        onClick={onToggleExpand}
        className={cn(
          'mt-3 flex w-full items-center justify-center gap-1',
          'rounded-lg py-1.5',
          'text-xs font-medium text-neutral-500',
          'hover:bg-neutral-100 dark:hover:bg-white/[0.08]/50',
          'transition-colors'
        )}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            {t('lessDetails')}
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            {t('moreDetails')}
          </>
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3 dark:border-white/[0.08]">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500">{t('models_tab.max_tokens')}</span>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {model.maxTokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-500">Context</span>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {model.contextWindow.toLocaleString()}
                  </p>
                </div>
                {model.inputPricePerMillion && (
                  <div>
                    <span className="text-neutral-500">{t('models_tab.input_m')}</span>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      ${model.inputPricePerMillion}
                    </p>
                  </div>
                )}
                {model.outputPricePerMillion && (
                  <div>
                    <span className="text-neutral-500">{t('models_tab.output_m')}</span>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      ${model.outputPricePerMillion}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!model.isDefault && model.isActive && (
                  <button
                    onClick={onSetDefault}
                    className={cn(
                      'flex-1 rounded-lg py-2',
                      'text-xs font-medium',
                      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                      'hover:bg-amber-100 dark:hover:bg-amber-500/20',
                      'transition-colors'
                    )}
                  >
                    {t('setDefault')}
                  </button>
                )}
                <button
                  onClick={onEdit}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1 rounded-lg py-2',
                    'text-xs font-medium',
                    'bg-neutral-100 text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300',
                    'hover:bg-neutral-200 dark:hover:bg-white/[0.1]',
                    'transition-colors'
                  )}
                >
                  <Edit3 className="h-3 w-3" />
                  {t('edit')}
                </button>
                <button
                  onClick={onDelete}
                  className={cn(
                    'flex items-center justify-center rounded-lg px-3 py-2',
                    'text-xs font-medium',
                    'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
                    'hover:bg-red-100 dark:hover:bg-red-500/20',
                    'transition-colors'
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Model Form Modal
interface ModelFormModalProps {
  model: AIModel | null;
  onClose: () => void;
  onSave: (data: Partial<AIModel>) => void;
}

function ModelFormModal({ model, onClose, onSave }: ModelFormModalProps) {
  const t = useTranslations('admin.aiSettings.models');
  const commonT = useTranslations('common');

  const [formData, setFormData] = useState<Partial<AIModel>>({
    provider: 'OPENAI' as AIProvider,
    modelId: '',
    displayName: '',
    description: '',
    endpoint: '',
    apiKeyRef: '',
    preferredProvider: null,
    isActive: true,
    isDefault: false,
    maxTokens: 8192,
    contextWindow: 128000,
    inputPricePerMillion: null,
    outputPricePerMillion: null,
    supportsVision: false,
    supportsTools: true,
    supportsStreaming: true,
    sortOrder: 0,
    ...model,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className={cn(
          'relative flex w-full max-w-lg flex-col',
          'h-full max-h-[90vh] sm:h-auto',
          'rounded-t-3xl sm:rounded-3xl',
          'bg-white dark:bg-zinc-950',
          'shadow-2xl',
          'overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {model ? t('editModel') : t('newModel')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {/* Provider */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Provider
            </label>
            <select
              value={formData.provider}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, provider: e.target.value as AIProvider })
              }
              className={cn(
                'w-full rounded-xl border px-4 py-3',
                'border-neutral-200/60 dark:border-white/[0.08]',
                'bg-white dark:bg-white/[0.04]',
                'text-neutral-900 dark:text-white',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            >
              {PROVIDERS.map((p: any) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {/* Model ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('modelId')}
            </label>
            <input
              type="text"
              value={formData.modelId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, modelId: e.target.value })
              }
              placeholder={t('modelIdPlaceholder')}
              className={cn(
                'w-full rounded-xl border px-4 py-3',
                'border-neutral-200/60 dark:border-white/[0.08]',
                'bg-white dark:bg-white/[0.04]',
                'text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('displayName')}
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              placeholder={t('displayNamePlaceholder')}
              className={cn(
                'w-full rounded-xl border px-4 py-3',
                'border-neutral-200/60 dark:border-white/[0.08]',
                'bg-white dark:bg-white/[0.04]',
                'text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
          </div>

          {/* Endpoint API (opzionale) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('endpoint')}
            </label>
            <input
              type="text"
              value={formData.endpoint || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, endpoint: e.target.value || null })
              }
              placeholder={t('endpointPlaceholder')}
              className={cn(
                'w-full rounded-xl border px-4 py-3',
                'border-neutral-200/60 dark:border-white/[0.08]',
                'bg-white dark:bg-white/[0.04]',
                'text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400',
                'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
              )}
            />
            <p className="mt-1 text-xs text-neutral-500">{t('endpointDesc')}</p>
          </div>

          {/* Preferred Provider (solo per OPENROUTER) */}
          {formData.provider === 'OPENROUTER' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('preferredProvider')}
              </label>
              <select
                value={formData.preferredProvider || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, preferredProvider: e.target.value || null })
                }
                className={cn(
                  'w-full rounded-xl border px-4 py-3',
                  'border-neutral-200/60 dark:border-white/[0.08]',
                  'bg-white dark:bg-white/[0.04]',
                  'text-neutral-900 dark:text-white',
                  'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                )}
              >
                {OPENROUTER_PROVIDERS.map((p: any) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">{t('preferredProviderDesc')}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('maxTokens')}
              </label>
              <input
                type="number"
                value={formData.maxTokens ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    maxTokens: value === '' ? undefined : parseInt(value, 10),
                  });
                }}
                className={cn(
                  'w-full rounded-xl border px-4 py-3',
                  'border-neutral-200/60 dark:border-white/[0.08]',
                  'bg-white dark:bg-white/[0.04]',
                  'text-neutral-900 dark:text-white',
                  'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                )}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('contextWindow')}
              </label>
              <input
                type="number"
                value={formData.contextWindow ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    contextWindow: value === '' ? undefined : parseInt(value, 10),
                  });
                }}
                className={cn(
                  'w-full rounded-xl border px-4 py-3',
                  'border-neutral-200/60 dark:border-white/[0.08]',
                  'bg-white dark:bg-white/[0.04]',
                  'text-neutral-900 dark:text-white',
                  'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('inputPrice')}
              </label>
              <div className="relative">
                <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.inputPricePerMillion ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      inputPricePerMillion:
                        e.target.value === '' ? null : parseFloat(e.target.value),
                    })
                  }
                  className={cn(
                    'w-full rounded-xl border py-3 pr-4 pl-9',
                    'border-neutral-200/60 dark:border-white/[0.08]',
                    'bg-white dark:bg-white/[0.04]',
                    'text-neutral-900 dark:text-white',
                    'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                  )}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('outputPrice')}
              </label>
              <div className="relative">
                <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.outputPricePerMillion ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      outputPricePerMillion:
                        e.target.value === '' ? null : parseFloat(e.target.value),
                    })
                  }
                  className={cn(
                    'w-full rounded-xl border py-3 pr-4 pl-9',
                    'border-neutral-200/60 dark:border-white/[0.08]',
                    'bg-white dark:bg-white/[0.04]',
                    'text-neutral-900 dark:text-white',
                    'focus:border-primary-500 focus:ring-primary-500/20 focus:ring-2'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Capabilities Toggles */}
          <div className="space-y-3 pb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('capabilities')}
            </label>
            {[
              { key: 'supportsVision', label: 'Vision', icon: Eye },
              { key: 'supportsTools', label: 'Tool Calling', icon: Wrench },
              { key: 'supportsStreaming', label: 'Streaming', icon: Zap },
              { key: 'supportsReasoning', label: 'Reasoning', icon: Bot },
            ].map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                </div>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      [key]: !formData[key as keyof typeof formData],
                    })
                  }
                  className="shrink-0"
                >
                  {formData[key as keyof typeof formData] ? (
                    <ToggleRight className="text-primary-500 h-6 w-6" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-neutral-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-3 border-t border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
          <button
            onClick={onClose}
            className={cn(
              'flex-1 rounded-xl py-3',
              'text-sm font-medium',
              'bg-neutral-100 text-neutral-700 dark:bg-white/[0.04] dark:text-neutral-300',
              'hover:bg-neutral-200 dark:hover:bg-white/[0.08]',
              'transition-colors'
            )}
          >
            {commonT('cancel')}
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.modelId || !formData.displayName}
            className={cn(
              'flex-1 rounded-xl py-3',
              'text-sm font-medium text-white',
              'from-primary-500 bg-gradient-to-r to-violet-600',
              'shadow-primary-500/25 shadow-lg',
              'hover:shadow-primary-500/30 hover:shadow-xl',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200'
            )}
          >
            {model ? t('saveChanges') : t('createModel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
