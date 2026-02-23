'use client';
import { useState } from 'react';
import { Button, CatalogGrid, ResourceCard, Slider } from '@giulio-leone/ui';
import { Power, PowerOff, Save } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@giulio-leone/lib-shared';
import { useTranslations } from 'next-intl';

export type AgentConfig = {
  id: string;
  feature: string;
  isEnabled: boolean;
  config: unknown;
  description: string | null;
  updatedAt: Date;
  updatedBy: string | null;
};

interface AIAgentsConfigProps {
  configs: AgentConfig[];
  onToggleAgent: (agentId: string, isEnabled: boolean) => Promise<{ success: boolean; error?: string }>;
  onUpdateRetry: (count: number) => Promise<{ success: boolean; error?: string }>;
}

export function AIAgentsConfig({ configs, onToggleAgent, onUpdateRetry }: AIAgentsConfigProps) {
  const t = useTranslations('admin.aiSettings.framework.agents');
  const tAdmin = useTranslations('admin');
  const [optimisticConfigs, setOptimisticConfigs] = useState(configs);
  const [retryCount, setRetryCount] = useState<number>(() => {
    const retryConfig = configs.find((c) => c.feature === 'workout_generation_retry');
    if (retryConfig && typeof retryConfig.config === 'object' && retryConfig.config !== null) {
      return (retryConfig.config as { count?: number }).count ?? 3;
    }
    return 3;
  });

  const handleToggle = async (agentId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setOptimisticConfigs((prev) =>
      prev.map((c) => (c.feature === agentId ? { ...c, isEnabled: newStatus } : c))
    );

    try {
      const result = await onToggleAgent(agentId, newStatus);
      if (!result.success) {
        throw new Error(result.error);
      }

      const statusStr = newStatus ? tAdmin('status.enabled') : tAdmin('status.disabled');
      toast.success(tAdmin('toggle', { label: agentId, status: statusStr }));
    } catch (error) {
      logger.error('Failed to toggle agent:', error);
      toast.error(tAdmin('updateError'));
      // Revert optimistic update
      setOptimisticConfigs((prev) =>
        prev.map((c) => (c.feature === agentId ? { ...c, isEnabled: currentStatus } : c))
      );
    }
  };

  const handleRetryUpdate = async () => {
    try {
      const result = await onUpdateRetry(retryCount);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success(tAdmin('retryUpdateSuccess'));
    } catch (error) {
      logger.error('Failed to update retry count:', error);
      toast.error(tAdmin('retryUpdateError'));
    }
  };

  return (
    <div className="space-y-6">
      <CatalogGrid emptyState={<p className="text-center text-neutral-500">{t('empty')}</p>}>
        {optimisticConfigs.map((config) => {
          if (config.feature === 'workout_generation_retry') {
            return (
              <ResourceCard
                key={config.id}
                title={tAdmin('admin.ai_agents_config.workout_generation_retry')}
                subtitle="Configure retry attempts for failed generation steps"
                imageSrc={null}
                status={config.isEnabled ? 'active' : 'disabled'}
                stats={[{ label: tAdmin('retryLabel'), value: retryCount }]}
                actions={[
                  {
                    label: config.isEnabled ? tAdmin('status.disabled') : tAdmin('status.enabled'),
                    icon: config.isEnabled ? <PowerOff size={16} /> : <Power size={16} />,
                    onClick: () => handleToggle(config.feature, config.isEnabled),
                    variant: config.isEnabled ? 'destructive' : 'default',
                  },
                ]}
              >
                <div className="mt-4 space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {tAdmin('retryAttempts', { count: retryCount })}
                    </span>
                    <Button size="sm" onClick={handleRetryUpdate} disabled={!config.isEnabled}>
                      <Save size={14} className="mr-2" />
                      {tAdmin('save')}
                    </Button>
                  </div>
                  <Slider
                    value={[retryCount]}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={(vals) => setRetryCount(vals[0] ?? 3)}
                    disabled={!config.isEnabled}
                  />
                </div>
              </ResourceCard>
            );
          }
          return (
            <ResourceCard
              key={config.id}
              title={config.feature}
              subtitle={config.description || 'No description'}
              imageSrc={null}
              status={config.isEnabled ? 'active' : 'disabled'}
              stats={[
                {
                  label: tAdmin('lastUpdated'),
                  value: new Date(config.updatedAt).toLocaleDateString(),
                },
              ]}
              actions={[
                {
                  label: config.isEnabled ? tAdmin('status.disabled') : tAdmin('status.enabled'),
                  icon: config.isEnabled ? <PowerOff size={16} /> : <Power size={16} />,
                  onClick: () => handleToggle(config.feature, config.isEnabled),
                  variant: config.isEnabled ? 'destructive' : 'default',
                },
              ]}
            />
          );
        })}
      </CatalogGrid>
    </div>
  );
}
