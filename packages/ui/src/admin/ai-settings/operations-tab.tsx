/**
 * Operations Config Tab
 * Configure specific settings for each AI Operation Type (e.g. Models per operation)
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@giulio-leone/lib-design-system';
import { Save, Loader2, Bot, Zap, Coins, BrainCircuit, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import type { OperationConfig, AIModel } from './types';
import { OPERATION_TYPES, type OperationType } from './types';

interface OperationsTabProps {
  models: AIModel[];
}

export function OperationsTab({ models }: OperationsTabProps) {
  const t = useTranslations('admin.aiSettings.operations');
  const tAdmin = useTranslations('admin');
  const [configs, setConfigs] = useState<OperationConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingOp, setSavingOp] = useState<string | null>(null);

  // Group operations by category purely for visual organization if needed,
  // or just list them all. Sorted by name usually.

  // Format operation type to readable string
  const formatOpType = (op: string) => {
    return t(`types.${op}` as Parameters<typeof t>[0]);
  };

  const getIconForOp = (op: string) => {
    if (op.includes('CHAT')) return Bot;
    if (op.includes('WORKOUT')) return Zap;
    if (op.includes('NUTRITION')) return Zap; // Or food icon if available
    if (op.includes('FLIGHT')) return Zap; // Plane icon not imported, generic Zap works or add Plane
    if (op.includes('ANALYSIS')) return BrainCircuit;
    return Cpu;
  };

  // Load configs
  useEffect(() => {
    async function loadConfigs() {
      try {
        const res = await fetch('/api/admin/operation-config');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setConfigs(data.configs);
      } catch {
        toast.error(tAdmin('loadError'));
      } finally {
        setIsLoading(false);
      }
    }
    loadConfigs();
  }, [tAdmin]);

  const handleSave = async (config: OperationConfig) => {
    setSavingOp(config.operationType);
    try {
      const res = await fetch('/api/admin/operation-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // Update local state with returned config (in case of ID creation etc)
      setConfigs((prev) =>
        prev.map((c: any) => (c.operationType === config.operationType ? { ...c, ...data.config } : c))
      );

      toast.success(t('saveSuccess'));
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSavingOp(null);
    }
  };

  // Helper to update local state field
  const updateField = (opType: OperationType, field: keyof OperationConfig, value: unknown) => {
    setConfigs((prev) => {
      // Check if config exists
      const exists = prev.find((c: any) => c.operationType === opType);
      if (!exists) {
        // Create skeleton if not strictly existing in fetched list (should not happen if we list all enums, but robust)
        // Actually we might need to populate from ALL Enum values even if not in DB.
        // For now assume DB or API returns all or we just map what we have.
        // Ideally we should merge with all OperationType enum values.
        return prev;
      }
      return prev.map((c: any) => (c.operationType === opType ? { ...c, [field]: value } : c));
    });
  };

  // Generate complete list merging fetched configs with missing Enum definitions if any
  const allOperationTypes = [...OPERATION_TYPES];
  const mergedConfigs = allOperationTypes.map((opType: any) => {
    const existing = configs.find((c: any) => c.operationType === opType);
    return (
      existing ||
      ({
        id: `temp-${opType}`,
        operationType: opType,
        model: models.find((m: any) => m.isDefault)?.modelId || models[0]?.modelId || '',
        creditCost: 1,
        maxTokens: 1000,
        thinkingBudget: 0,
        isActive: true,
      } as OperationConfig)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('description')}</p>
        </div>
      </div>

      {mergedConfigs.map((config: any) => {
        const Icon = getIconForOp(config.operationType);
        const isSaving = savingOp === config.operationType;

        // Find if we have unsaved changes locally compared to 'configs' state source of truth?
        // Actually 'configs' is the source of truth for UI, 'mergedConfigs' computes missing ones.
        // To detect changes we'd need 'originalConfigs'. For simplicity we just enable Save always or check diff.
        // Let's just enable Save always for now.

        return (
          <motion.div
            key={config.operationType}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300',
              'bg-white dark:bg-neutral-900',
              config.isActive
                ? 'hover:border-primary-500/50 dark:hover:border-primary-500/50 border-neutral-200 dark:border-neutral-800'
                : 'border-neutral-100 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 dark:border-neutral-800'
            )}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  )}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {formatOpType(config.operationType)}
                  </h3>
                  <p className="text-xs text-neutral-500">{config.operationType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Optimistic update for isActive
                    const newActive = !config.isActive;
                    if (configs.find((c: any) => c.operationType === config.operationType)) {
                      updateField(config.operationType, 'isActive', newActive);
                    } else {
                      // Handle temp config
                      const newConfig = { ...config, isActive: newActive };
                      // We need to actually add it to 'configs' state if it was a merged skeleton
                      setConfigs((prev) => [...prev, newConfig]);
                    }
                  }}
                  className={cn(
                    'relative h-6 w-10 rounded-full transition-colors',
                    config.isActive ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform',
                      config.isActive ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                  {t('modelLabel')}
                </label>
                <select
                  value={config.model}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
                    const val = e.target.value;
                    if (configs.find((c: any) => c.operationType === config.operationType)) {
                      updateField(config.operationType, 'model', val);
                    } else {
                      setConfigs((prev) => [...prev, { ...config, model: val }]);
                    }
                  }}
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {models.map((m: any) => (
                    <option key={m.id} value={m.modelId}>
                      {m.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Credit Cost */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-neutral-500">
                    <Coins size={12} /> {t('costLabel')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.creditCost}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
                      const val = parseInt(e.target.value) || 0;
                      if (configs.find((c: any) => c.operationType === config.operationType)) {
                        updateField(config.operationType, 'creditCost', val);
                      } else {
                        setConfigs((prev) => [...prev, { ...config, creditCost: val }]);
                      }
                    }}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-neutral-500">
                    <Cpu size={12} /> {t('tokensLabel')}
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={config.maxTokens}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
                      const val = parseInt(e.target.value) || 1000;
                      if (configs.find((c: any) => c.operationType === config.operationType)) {
                        updateField(config.operationType, 'maxTokens', val);
                      } else {
                        setConfigs((prev) => [...prev, { ...config, maxTokens: val }]);
                      }
                    }}
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Save Action */}
              <button
                onClick={() => handleSave(config)}
                disabled={isSaving}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all duration-200',
                  'bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
                  isSaving && 'cursor-not-allowed opacity-70'
                )}
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? t('saving') : t('save')}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
