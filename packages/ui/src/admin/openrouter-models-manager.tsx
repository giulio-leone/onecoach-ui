'use client';

import { useTranslations } from 'next-intl';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Label, Spinner, Checkbox } from '@giulio-leone/ui';
import { Plus, RefreshCw, Edit, Trash, Play } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';

import { logger } from '@giulio-leone/lib-shared';

type OpenRouterModel = {
  id: string;
  modelId: string;
  provider: string;
  name: string;
  description?: string;
  contextLength?: number;
  maxOutputTokens?: number;
  promptPrice: number;
  completionPrice: number;
  supportsImages: boolean;
  supportsReasoning: boolean;
  reasoningEffort?: string;
  supportsStructuredOutput: boolean;
  isActive: boolean;
  updatedAt?: string;
};

type SyncModel = {
  modelId: string;
  name: string;
  description?: string;
  contextLength?: number;
  maxOutputTokens?: number;
  promptPrice: number;
  completionPrice: number;
  supportsImages: boolean;
  supportsReasoning: boolean;
  supportsStructuredOutput: boolean;
};

export function OpenRouterModelsManager() {
  const t = useTranslations('admin');

  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const [syncModels, setSyncModels] = useState<SyncModel[]>([]);
  const [isLoadingSync, setIsLoadingSync] = useState(false);
  const [selectedSyncModels, setSelectedSyncModels] = useState<Set<string>>(new Set());
  const [syncSearch, setSyncSearch] = useState('');

  const [currentModel, setCurrentModel] = useState<Partial<OpenRouterModel>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/config/openrouter-models');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`
        );
      }
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
      }
    } catch (error) {
      logger.error('Failed to fetch models', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSyncModels = async () => {
    try {
      setIsLoadingSync(true);
      const res = await fetch('/api/admin/config/openrouter-models/sync');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`
        );
      }
      const data = await res.json();
      if (data.success) {
        setSyncModels(data.models);
      }
    } catch (error) {
      logger.error('Failed to fetch sync models', error);
    } finally {
      setIsLoadingSync(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSaving(true);
      const modelsToSync = syncModels.filter((m: any) => selectedSyncModels.has(m.modelId));
      const res = await fetch('/api/admin/config/openrouter-models/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: modelsToSync }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`
        );
      }
      const data = await res.json();
      if (data.success) {
        setIsSyncDialogOpen(false);
        fetchModels();
        setSelectedSyncModels(new Set());
      }
    } catch (error) {
      logger.error('Failed to sync models', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const method = currentModel.id ? 'PUT' : 'POST';
      const url = currentModel.id
        ? `/api/admin/config/openrouter-models/${currentModel.id}`
        : '/api/admin/config/openrouter-models';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentModel),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`
        );
      }

      const data = await res.json();
      if (data.success) {
        setIsEditDialogOpen(false);
        fetchModels();
      }
    } catch (error) {
      logger.error('Failed to save model', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    try {
      const res = await fetch(`/api/admin/config/openrouter-models/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchModels();
      }
    } catch (error) {
      logger.error('Failed to delete model', error);
    }
  };

  const handleTest = async (modelId: string) => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await fetch('/api/admin/config/openrouter-models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(
          `Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`
        );
      }
      const data = await res.json();
      if (data.success) {
        setTestResult(data.output);
      } else {
        setTestResult('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setTestResult('Error: ' + String(error));
    } finally {
      setIsTesting(false);
    }
  };

  const filteredSyncModels = syncModels.filter((m: any) =>
      m.name.toLowerCase().includes(syncSearch.toLowerCase()) ||
      m.modelId.toLowerCase().includes(syncSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-medium">{t('openrouter_models_manager.openrouter_models')}</h3>
        <div className="flex w-full gap-2 md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none"
            onClick={() => {
              setIsSyncDialogOpen(true);
              fetchSyncModels();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Sync
          </Button>
          <Button
            className="flex-1 md:flex-none"
            onClick={() => {
              setCurrentModel({
                isActive: true,
                supportsImages: false,
                supportsReasoning: false,
                supportsStructuredOutput: false,
              });
              setIsEditDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> {t('openrouter_models_manager.add_model')}
          </Button>
        </div>
      </div>

      <Card variant="glass" className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase dark:bg-neutral-800/50 dark:text-neutral-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">{t('openrouter_models_manager.model_id')}</th>
                <th className="px-6 py-3">{t('openrouter_models_manager.pricing_in_out')}</th>
                <th className="px-6 py-3">Context</th>
                <th className="px-6 py-3">Caps</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    {t('openrouter_models_manager.no_models_found_sync_or_add_one')}
                  </td>
                </tr>
              ) : (
                models.map((model: any) => (
                  <tr key={model.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="px-6 py-4 font-medium">{model.name}</td>
                    <td className="px-6 py-4 text-neutral-500">{model.modelId}</td>
                    <td className="px-6 py-4">
                      ${model.promptPrice.toFixed(2)} / ${model.completionPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{model.contextLength?.toLocaleString() || '-'}</td>
                    <td className="flex gap-1 px-6 py-4">
                      {model.supportsImages && (
                        <span
                          title="Images"
                          className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                        >
                          IMG
                        </span>
                      )}
                      {model.supportsReasoning && (
                        <span
                          title="Reasoning"
                          className="rounded bg-secondary-100 px-1.5 py-0.5 text-xs text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
                        >
                          THK
                        </span>
                      )}
                      {model.supportsStructuredOutput && (
                        <span
                          title={t('openrouter_models_manager.structured_output')}
                          className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          JSON
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs',
                          model.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        )}
                      >
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCurrentModel(model);
                          setTestResult(null);
                          setIsTestDialogOpen(true);
                        }}
                        title="Test"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCurrentModel(model);
                          setIsEditDialogOpen(true);
                        }}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(model.id)}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Spinner />
            </div>
          ) : models.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              {t('openrouter_models_manager.no_models_found_sync_or_add_one')}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {models.map((model: any) => (
                <div key={model.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium">{model.name}</h4>
                      <p className="mt-0.5 truncate font-mono text-xs text-neutral-500">
                        {model.modelId}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        model.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      )}
                    >
                      {model.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] tracking-wider text-neutral-400 uppercase">
                        {t('openrouter_models_manager.pricing_in_out')}
                      </span>
                      <span className="font-mono text-neutral-600 dark:text-neutral-300">
                        ${model.promptPrice.toFixed(2)} / ${model.completionPrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] tracking-wider text-neutral-400 uppercase">
                        Context
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {model.contextLength?.toLocaleString() || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      {model.supportsImages && (
                        <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          IMG
                        </span>
                      )}
                      {model.supportsReasoning && (
                        <span className="rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200">
                          THK
                        </span>
                      )}
                      {model.supportsStructuredOutput && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-800 dark:bg-green-900 dark:text-green-200">
                          JSON
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => {
                          setCurrentModel(model);
                          setTestResult(null);
                          setIsTestDialogOpen(true);
                        }}
                        title="Test"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => {
                          setCurrentModel(model);
                          setIsEditDialogOpen(true);
                        }}
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(model.id)}
                        title="Delete"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Sync Dialog */}
      <Modal
        isOpen={isSyncDialogOpen}
        onClose={() => setIsSyncDialogOpen(false)}
        title={t('openrouter_models_manager.sync_models_from_openrouter')}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('openrouter_models_manager.select_models_to_import_or_update_from_o')}
          </p>

          <div className="flex gap-2">
            <Input
              placeholder={t('openrouter_models_manager.search_models')}
              value={syncSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSyncSearch(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="max-h-[50vh] flex-1 overflow-y-auto rounded-md border">
            {isLoadingSync ? (
              <div className="flex justify-center p-8">
                <Spinner />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="w-10 px-4 py-2">
                      <Checkbox
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.checked) {
                            setSelectedSyncModels(
                              new Set(filteredSyncModels.map((m: any) => m.modelId))
                            );
                          } else {
                            setSelectedSyncModels(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Pricing</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSyncModels.map((m: any) => (
                    <tr
                      key={m.modelId}
                      className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-white/[0.08] dark:hover:bg-neutral-800/30"
                    >
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedSyncModels.has(m.modelId)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const next = new Set(selectedSyncModels);
                            if (e.target.checked) next.add(m.modelId);
                            else next.delete(m.modelId);
                            setSelectedSyncModels(next);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">{m.name}</td>
                      <td className="px-4 py-2 text-xs text-neutral-500">{m.modelId}</td>
                      <td className="px-4 py-2 text-xs">
                        ${m.promptPrice.toFixed(2)} / ${m.completionPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <div className="text-sm text-neutral-500">
              {t('openrouter_models_manager.selected')}
              {selectedSyncModels.size}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSync} disabled={selectedSyncModels.size === 0 || isSaving}>
                {isSaving ? <Spinner className="mr-2" /> : null}
                {t('openrouter_models_manager.import_selected')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Dialog */}
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title={currentModel.id ? 'Edit Model' : 'Add Model'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>{t('openrouter_models_manager.model_id')}</Label>
            <Input
              value={currentModel.modelId || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentModel({ ...currentModel, modelId: e.target.value })
              }
              disabled={!!currentModel.id}
            />
          </div>
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={currentModel.name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentModel({ ...currentModel, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('openrouter_models_manager.prompt_price_1m')}</Label>
              <Input
                type="number"
                value={currentModel.promptPrice || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentModel({ ...currentModel, promptPrice: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('openrouter_models_manager.completion_price_1m')}</Label>
              <Input
                type="number"
                value={currentModel.completionPrice || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentModel({ ...currentModel, completionPrice: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Capabilities</Label>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Images"
                checked={currentModel.supportsImages}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentModel({ ...currentModel, supportsImages: e.target.checked })
                }
              />
              <Checkbox
                label="Reasoning"
                checked={currentModel.supportsReasoning}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentModel({ ...currentModel, supportsReasoning: e.target.checked })
                }
              />
              <Checkbox
                label="Structure"
                checked={currentModel.supportsStructuredOutput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentModel({ ...currentModel, supportsStructuredOutput: e.target.checked })
                }
              />
              <Checkbox
                label="Active"
                checked={currentModel.isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentModel({ ...currentModel, isActive: e.target.checked })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner className="mr-2" /> : null} Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Test Dialog */}
      <Modal
        isOpen={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
        title={`Test Model: ${currentModel.name}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('openrouter_models_manager.sends_a_simple_hello_prompt_to_verify_co')}
          </p>

          <div className="space-y-4">
            {testResult ? (
              <div className="rounded bg-neutral-100 p-4 font-mono text-sm whitespace-pre-wrap dark:bg-neutral-900">
                {testResult}
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-500">
                {t('openrouter_models_manager.ready_to_test')}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleTest(currentModel.modelId!)} disabled={isTesting}>
              {isTesting ? <Spinner className="mr-2" /> : <Play className="mr-2 h-4 w-4" />}{' '}
              {t('openrouter_models_manager.run_test')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
