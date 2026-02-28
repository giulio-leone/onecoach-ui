'use client';

import { useTranslations } from 'next-intl';
/**
 * Framework Configuration Admin Panel
 * Manage AI framework features and configurations
 */

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

enum FrameworkFeature {
  CONSENSUS_SYSTEM = 'CONSENSUS_SYSTEM',
  SKILLS_SYSTEM = 'SKILLS_SYSTEM',
  LEARNING_FEEDBACK_LOOP = 'LEARNING_FEEDBACK_LOOP',
}

interface FeatureConfig {
  feature: FrameworkFeature;
  isEnabled: boolean;
  config: Record<string, unknown>;
  updatedAt?: string;
  updatedBy?: string;
}

const featureDescriptions: Record<FrameworkFeature, { title: string; description: string }> = {
  [FrameworkFeature.CONSENSUS_SYSTEM]: {
    title: 'Consensus System',
    description: 'Multi-model voting for critical decisions with configurable voting strategies',
  },
  [FrameworkFeature.SKILLS_SYSTEM]: {
    title: 'Skills System',
    description: 'Universal skills registry with MCP protocol support',
  },
  [FrameworkFeature.LEARNING_FEEDBACK_LOOP]: {
    title: 'Learning Feedback Loop',
    description: 'Adaptive threshold management based on execution metrics',
  },
};

const defaultConfigs: Record<FrameworkFeature, Record<string, unknown>> = {
  [FrameworkFeature.CONSENSUS_SYSTEM]: {
    modelTiers: ['fast', 'balanced', 'quality'],
    minModels: 2,
    maxModels: 3,
    votingStrategy: 'majority',
    confidenceThreshold: 0.7,
  },
  [FrameworkFeature.SKILLS_SYSTEM]: {
    enableAutoRegister: true,
    enableMCP: true,
  },
  [FrameworkFeature.LEARNING_FEEDBACK_LOOP]: {
    minSamplesForAdaptation: 10,
    adaptationRate: 0.1,
    confidenceWindowSize: 50,
  },
};

export function FrameworkConfigPanel() {
  const t = useTranslations('admin');

  const [configs, setConfigs] = useState<Record<FrameworkFeature, FeatureConfig>>(
    {} as Record<FrameworkFeature, FeatureConfig>
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/framework-config');
      if (!res.ok) throw new Error('Failed to fetch configurations');

      const data = await res.json();

      const configsMap: Record<FrameworkFeature, FeatureConfig> = {} as Record<
        FrameworkFeature,
        FeatureConfig
      >;

      for (const feature of Object.values(FrameworkFeature)) {
        const existing = data.configs.find((c: FeatureConfig) => c.feature === feature);
        configsMap[feature] = existing || {
          feature,
          isEnabled: false,
          config: defaultConfigs[feature],
        };
      }

      setConfigs(configsMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateFeature = async (feature: FrameworkFeature, updates: Partial<FeatureConfig>) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/framework-config/${feature}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: updates.isEnabled ?? configs[feature].isEnabled,
          config: updates.config ?? configs[feature].config,
          changeReason: 'Admin panel update',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update configuration');
      }

      const data = await res.json();

      setConfigs((prev) => ({
        ...prev,
        [feature]: data.config,
      }));

      setSuccessMessage(`${featureDescriptions[feature].title} updated successfully!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (feature: FrameworkFeature) => {
    const newState = !configs[feature]?.isEnabled;
    await updateFeature(feature, { isEnabled: newState });
  };

  const updateConfig = async (feature: FrameworkFeature, newConfig: Record<string, unknown>) => {
    await updateFeature(feature, { config: newConfig });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Settings size={32} />
            {t('admin.framework_config_panel.framework_configuration')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.framework_config_panel.manage_ai_framework_features_and_setting')}
          </p>
        </div>
        <button
          onClick={fetchConfigs}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <strong>{t('admin.framework_config_panel.error')}</strong> {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800">
          <strong>{t('admin.framework_config_panel.success')}</strong> {successMessage}
        </div>
      )}

      {/* Feature Cards */}
      <div className="space-y-4">
        {(Object.values(FrameworkFeature) as FrameworkFeature[]).map((feature: any) => {
          const config = (configs as any)[feature];
          if (!config) return null;

          const desc = (featureDescriptions as any)[feature];

          return (
            <div key={feature} className="rounded-lg border bg-white p-6 shadow-sm">
              {/* Feature Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{desc.title}</h2>
                    {config.isEnabled ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <XCircle className="text-gray-400" size={20} />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{desc.description}</p>
                </div>
                <button
                  onClick={() => toggleFeature(feature)}
                  disabled={loading}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    config.isEnabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  } disabled:opacity-50`}
                >
                  {config.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Config Details */}
              {config.isEnabled && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">Configuration</h3>
                  <pre className="overflow-auto rounded bg-white p-3 text-xs">
                    {JSON.stringify(config.config, null, 2)}
                  </pre>
                  <button
                    onClick={() => {
                      const newConfig = prompt(
                        'Enter new configuration (JSON):',
                        JSON.stringify(config.config, null, 2)
                      );
                      if (newConfig) {
                        try {
                          const parsed = JSON.parse(newConfig);
                          updateConfig(feature, parsed);
                        } catch (_error: unknown) {
                          alert(t('admin.framework_config_panel.invalid_json'));
                        }
                      }
                    }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                  >
                    <Save size={14} />
                    {t('admin.framework_config_panel.edit_configuration')}
                  </button>
                </div>
              )}

              {/* Metadata */}
              {config.updatedAt && (
                <div className="mt-3 border-t pt-3 text-xs text-gray-500">
                  {t('admin.framework_config_panel.last_updated')}
                  {new Date(config.updatedAt).toLocaleString()}
                  {config.updatedBy && ` by ${config.updatedBy}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">
          {t('admin.framework_config_panel.how_it_works')}
        </h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>{t('admin.framework_config_panel.toggle_features_on_off_to_enable_disable')}</li>
          <li>{t('admin.framework_config_panel.each_feature_has_its_own_configuration_t')}</li>
          <li>{t('admin.framework_config_panel.changes_are_tracked_with_timestamps_and_')}</li>
          <li>{t('admin.framework_config_panel.configuration_is_stored_in_the_database_')}</li>
        </ul>
      </div>
    </div>
  );
}
