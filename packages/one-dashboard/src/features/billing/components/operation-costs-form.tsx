'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { AdminCard, Button } from '@onecoach/ui';
import { Save, Coins } from 'lucide-react';

import { OperationType } from '@prisma/client';
import { toast } from 'sonner';


interface CostConfig {
  operationType: OperationType;
  creditCost: number;
}

interface OperationCostsFormProps {
  configs: CostConfig[];
  onUpdateCost: (opType: OperationType, cost: number) => Promise<{ success: boolean; error?: string }>;
}

const OPERATION_LABELS: Record<string, string> = {
  WORKOUT_GENERATION: 'Generazione Workout',
  NUTRITION_GENERATION: 'Generazione Nutrizione',
  CHAT_MESSAGE: 'Messaggio Chat',
  SHOPPING_GENERATION: 'Generazione Lista Spesa',
  IMAGE_GENERATION: 'Generazione Immagini',
  VISION_ANALYSIS: 'Analisi Vision',
};

export function OperationCostsForm({ configs, onUpdateCost }: OperationCostsFormProps) {
  const t = useTranslations('admin');

  const [localConfigs, setLocalConfigs] = useState(configs);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const handleCostChange = (opType: OperationType, val: string) => {
    const num = parseInt(val) || 0;
    setLocalConfigs((prev) => {
      const exists = prev.find((c) => c.operationType === opType);
      if (exists) {
        return prev.map((c) => (c.operationType === opType ? { ...c, creditCost: num } : c));
      }
      return [...prev, { operationType: opType, creditCost: num }];
    });
  };

  const handleSave = async (opType: OperationType) => {
    const config = localConfigs.find((c) => c.operationType === opType);
    if (!config) return;

    setIsSaving((prev) => ({ ...prev, [opType]: true }));
    try {
      const res = await onUpdateCost(opType, config.creditCost);
      if (res.success) {
        toast.success(`Costo aggiornato per ${OPERATION_LABELS[opType] || opType}`);
      } else {
        toast.error(`Errore: ${res.error}`);
      }
    } catch (e) {
      toast.error(t('admin.operation_costs_form.errore_di_connessione'));
    } finally {
      setIsSaving((prev) => ({ ...prev, [opType]: false }));
    }
  };

  // Ensure all known operations are listed even if not in DB yet
  const allOps = Object.keys(OperationType) as OperationType[];
  const displayConfigs = allOps.map((op) => {
    const existing = localConfigs.find((c) => c.operationType === op);
    return existing || { operationType: op, creditCost: 5 }; // Default 5
  });

  return (
    <AdminCard
      title={t('admin.operation_costs_form.costi_operazioni_ai')}
      description={t('admin.operation_costs_form.definisci_il_costo_in_crediti_per_ogni_o')}
      variant="default"
      padding="md"
    >
      <div className="space-y-4">
        {displayConfigs.map((config) => (
          <div
            key={config.operationType}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {OPERATION_LABELS[config.operationType] || config.operationType}
                </p>
                <p className="font-mono text-xs text-neutral-500">{config.operationType}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  {t('admin.operation_costs_form.crediti')}
                </span>
                <input
                  type="number"
                  min="0"
                  value={config.creditCost}
                  onChange={(e) => handleCostChange(config.operationType, e.target.value)}
                  className="w-20 rounded border border-neutral-300 bg-white px-2 py-1 text-right text-sm outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-black/20"
                />
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isSaving[config.operationType]}
                onClick={() => handleSave(config.operationType)}
                className="text-neutral-400 hover:bg-indigo-500/10 hover:text-indigo-500"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
