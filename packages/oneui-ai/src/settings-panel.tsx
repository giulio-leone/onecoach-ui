'use client';

import { useTranslations } from 'next-intl';
/**
 * Agent Settings Panel Component
 *
 * Pannello condiviso per impostazioni agent (tier, provider, model)
 * I modelli vengono caricati dinamicamente dal database (ai_chat_models).
 */

import { useState, useEffect, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { ProviderName, ModelTier } from '@giulio-leone/lib-ai';
import { darkModeClasses, cn } from '@giulio-leone/lib-design-system';
import { AI_REASONING_CONFIG } from '@giulio-leone/constants';
import { Checkbox } from '@giulio-leone/ui';

import { logger } from '@giulio-leone/lib-shared';
type NonRouterProvider = Exclude<ProviderName, 'openrouter'>;

export const PROVIDER_OPTIONS: { value: ProviderName; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'xai', label: 'xAI (Grok)' },
  { value: 'openrouter', label: 'OpenRouter (Custom)' },
];

// DEPRECATED: Questi valori sono ora caricati dal database
// Mantenuti come fallback per retrocompatibilità
export const MODEL_OPTIONS: Record<NonRouterProvider, { value: string; label: string }[]> = {
  anthropic: [],
  openai: [],
  google: [],
  xai: [],
  minimax: [],
  'gemini-cli': [],
};

export const DEFAULT_MODELS: Record<NonRouterProvider, string> = {
  anthropic: '',
  openai: '',
  google: '',
  xai: '',
  minimax: '',
  'gemini-cli': '',
};

// Hook per caricare modelli dal database
export function useAIModels() {
  const [models, setModels] = useState<
    Record<NonRouterProvider, { value: string; label: string }[]>
  >({
    anthropic: [],
    openai: [],
    google: [],
    xai: [],
    minimax: [],
    'gemini-cli': [],
  });
  const [defaults, setDefaults] = useState<Record<NonRouterProvider, string>>({
    anthropic: '',
    openai: '',
    google: '',
    xai: '',
    minimax: '',
    'gemini-cli': '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadModels = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/models');
      const data = await res.json();
      if (data.success && data.options) {
        setModels(data.options as Record<NonRouterProvider, { value: string; label: string }[]>);
      }
      if (data.success && data.defaults) {
        setDefaults(data.defaults as Record<NonRouterProvider, string>);
      }
    } catch (err) {
      logger.error('[useAIModels] Failed to load models:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return { models, defaults, isLoading, refetch: loadModels };
}

interface AgentSettingsPanelProps {
  tier: ModelTier;
  onTierChange: (tier: ModelTier) => void;
  temperature?: number;
  onTemperatureChange?: (temp: number) => void;
  isAdmin?: boolean;
  selectedProvider?: ProviderName;
  selectedModel?: string;
  onProviderChange?: (provider: ProviderName) => void;
  onModelChange?: (model: string) => void;
  openRouterDefaultModel?: string;
  colorTheme?: 'nutrition' | 'workout' | 'chat';
  collapsible?: boolean;
  reasoning?: boolean;
  onReasoningChange?: (enabled: boolean) => void;
  reasoningEffort?: 'low' | 'medium' | 'high';
  onReasoningEffortChange?: (effort: 'low' | 'medium' | 'high') => void;
}

export function AgentSettingsPanel({
  tier,
  onTierChange,
  temperature,
  onTemperatureChange,
  isAdmin = false,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  openRouterDefaultModel,
  colorTheme = 'nutrition',
  collapsible = true,
  reasoning = true,
  onReasoningChange,
  reasoningEffort = AI_REASONING_CONFIG.DEFAULT_REASONING_EFFORT,
  onReasoningEffortChange,
}: AgentSettingsPanelProps) {
  const t = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [openRouterModels, setOpenRouterModels] = useState<
    { id: string; modelId: string; name: string }[]
  >([]);

  // Carica modelli dal database invece di usare hardcoded
  const { models: dbModels, defaults: dbDefaults } = useAIModels();

  const themeColors = {
    nutrition: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      text: 'text-green-800',
      icon: 'text-green-600',
    },
    workout: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      icon: 'text-blue-600',
    },
    chat: {
      border: 'border-purple-200 dark:border-purple-800/50',
      bg: 'bg-purple-50 dark:bg-purple-900/40',
      text: 'text-purple-800 dark:text-purple-200',
      icon: 'text-purple-600 dark:text-purple-400',
    },
  };

  const theme = themeColors[colorTheme];

  useEffect(() => {
    if (isAdmin && selectedProvider === 'openrouter') {
      fetch('/api/admin/config/openrouter-models')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOpenRouterModels(data.models);
          }
        })
        .catch((err: unknown) => logger.error('Failed to fetch OpenRouter models', err));
    }
  }, [isAdmin, selectedProvider]);

  const content = (
    <div className="space-y-4 overflow-x-hidden">
      <div className="grid gap-4 overflow-x-hidden sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {t('common.settings_panel.tier_modello')}
          </label>
          <select
            value={tier}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onTierChange(e.target.value as ModelTier)
            }
            className={cn(
              'min-h-[48px] w-full rounded-xl border-2 px-4 py-3 text-sm font-medium shadow-sm transition-all',
              'touch-manipulation focus:ring-2 focus:outline-none',
              darkModeClasses.input.base,
              colorTheme === 'nutrition'
                ? 'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
                : colorTheme === 'workout'
                  ? 'focus:border-blue-500 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900/50'
                  : 'focus:border-purple-500 focus:ring-purple-200 dark:focus:border-purple-400 dark:focus:ring-purple-900/50'
            )}
          >
            <option value="fast">{t('common.settings_panel.fast_gemini_2_5_flash')}</option>
            <option value="balanced">
              {t('common.settings_panel.balanced_claude_4_5_sonnet')}
            </option>
            <option value="quality">{t('common.settings_panel.quality_gpt_5_high')}</option>
          </select>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            {tier === 'fast' && 'Rapido ed economico'}
            {tier === 'balanced' && 'Bilanciato qualità/velocità'}
            {tier === 'quality' && 'Massima qualità'}
          </p>
        </div>

        {onTemperatureChange && temperature !== undefined && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Temperature
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onTemperatureChange(Number(e.target.value))
                }
                className="flex-1"
              />
              <span className="min-w-[3rem] text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {temperature.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {t('common.settings_panel.0_determinista_2_creativo')}
            </p>
          </div>
        )}
      </div>

      {isAdmin && selectedProvider && selectedModel && onProviderChange && onModelChange && (
        <div className={`rounded-xl border-2 ${theme.border} ${theme.bg} p-4`}>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className={`h-4 w-4 ${theme.icon}`} />
            <h4 className={`text-sm font-bold ${theme.text}`}>
              {t('common.settings_panel.impostazioni_avanzate_admin')}
            </h4>
          </div>
          <p className="mb-3 text-xs text-neutral-600 dark:text-neutral-400">
            {t('common.settings_panel.configurazione_personalizzata_del_modell')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  onProviderChange(e.target.value as ProviderName);
                  if (e.target.value !== 'openrouter') {
                    const provider = e.target.value as NonRouterProvider;
                    const options = dbModels[provider];
                    // Usa default dal DB o primo modello disponibile
                    const defaultModel = dbDefaults[provider] || options?.[0]?.value || '';
                    onModelChange(defaultModel);
                  } else {
                    onModelChange(openRouterDefaultModel || '');
                  }
                }}
                className={cn(
                  'w-full rounded-lg border-2 px-3 py-2 text-sm font-medium',
                  'min-h-[2.75rem] touch-manipulation focus:ring-2 focus:outline-none',
                  theme.border,
                  darkModeClasses.input.base,
                  colorTheme === 'nutrition'
                    ? 'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
                    : colorTheme === 'workout'
                      ? 'focus:border-blue-500 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900/50'
                      : 'focus:border-purple-500 focus:ring-purple-200 dark:focus:border-purple-400 dark:focus:ring-purple-900/50'
                )}
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Modello
              </label>
              {selectedProvider === 'openrouter' ? (
                <select
                  value={selectedModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    onModelChange(e.target.value)
                  }
                  className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-sm font-medium dark:bg-neutral-900 ${theme.border} ${
                    colorTheme === 'nutrition'
                      ? 'focus:border-green-500 focus:ring-green-200'
                      : colorTheme === 'workout'
                        ? 'focus:border-blue-500 focus:ring-blue-200'
                        : 'focus:border-purple-500 focus:ring-purple-200'
                  } focus:ring-2 focus:outline-none`}
                >
                  <option value="">{t('common.settings_panel.seleziona_un_modello')}</option>
                  {openRouterModels.map((model) => (
                    <option key={model.id} value={model.modelId}>
                      {model.name}
                    </option>
                  ))}
                  {!openRouterModels.length && (
                    <option value="" disabled>
                      {t('common.settings_panel.nessun_modello_sincronizzato')}
                    </option>
                  )}
                </select>
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    onModelChange(e.target.value)
                  }
                  className={`w-full rounded-lg border-2 bg-white px-3 py-2 text-sm font-medium dark:bg-neutral-900 ${theme.border} ${
                    colorTheme === 'nutrition'
                      ? 'focus:border-green-500 focus:ring-green-200'
                      : colorTheme === 'workout'
                        ? 'focus:border-blue-500 focus:ring-blue-200'
                        : 'focus:border-purple-500 focus:ring-purple-200'
                  } focus:ring-2 focus:outline-none`}
                >
                  {(dbModels[selectedProvider as NonRouterProvider] || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {dbModels[selectedProvider as NonRouterProvider]?.length === 0 && (
                    <option value="" disabled>
                      {t('common.settings_panel.nessun_modello_configurato')}
                    </option>
                  )}
                </select>
              )}
            </div>
          </div>

          {isAdmin && onReasoningChange && onReasoningEffortChange && (
            <div className={`mt-4 rounded-xl border-2 ${theme.border} ${theme.bg} p-4`}>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className={`h-4 w-4 ${theme.icon}`} />
                <h4 className={`text-sm font-bold ${theme.text}`}>
                  {t('common.settings_panel.reasoning_settings')}
                </h4>
              </div>
              <p className="mb-3 text-xs text-neutral-600 dark:text-neutral-400">
                {t('common.settings_panel.configurazione_del_reasoning_per_il_mode')}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Checkbox
                  id="reasoning-enabled"
                  label={t('common.settings_panel.abilita_reasoning')}
                  checked={reasoning}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onReasoningChange(e.target.checked)
                  }
                  className="flex-row-reverse justify-end gap-2"
                />

                {reasoning && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {t('common.settings_panel.reasoning_effort')}
                    </label>
                    <select
                      value={reasoningEffort}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        onReasoningEffortChange(e.target.value as 'low' | 'medium' | 'high')
                      }
                      className={cn(
                        'w-full rounded-lg border-2 px-3 py-2 text-sm font-medium',
                        'min-h-[2.75rem] touch-manipulation focus:ring-2 focus:outline-none',
                        theme.border,
                        darkModeClasses.input.base,
                        colorTheme === 'nutrition'
                          ? 'focus:border-green-500 focus:ring-green-200 dark:focus:border-green-400 dark:focus:ring-green-900/50'
                          : colorTheme === 'workout'
                            ? 'focus:border-blue-500 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900/50'
                            : 'focus:border-purple-500 focus:ring-purple-200 dark:focus:border-purple-400 dark:focus:ring-purple-900/50'
                      )}
                    >
                      <option value="low">{t('common.settings_panel.low_veloce')}</option>
                      <option value="medium">{t('common.settings_panel.medium_bilanciato')}</option>
                      <option value="high">
                        {t('common.settings_panel.high_massima_qualita')}
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <div
        className={cn(
          'overflow-x-hidden rounded-2xl border-2 p-4 shadow-lg sm:p-6',
          darkModeClasses.card.elevated
        )}
      >
        <div className="mb-4 flex items-center gap-2 sm:gap-3">
          <div className={cn('flex-shrink-0 rounded-lg border p-2', theme.bg)}>
            <Settings className={cn('h-4 w-4 sm:h-5 sm:w-5', theme.icon)} />
          </div>
          <h3 className={cn('text-base font-bold sm:text-lg', darkModeClasses.text.primary)}>
            {t('common.settings_panel.impostazioni_ai')}
          </h3>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-x-hidden rounded-2xl border-2 shadow-lg',
        darkModeClasses.card.elevated
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex min-h-[2.75rem] w-full items-center justify-between p-4 transition-colors',
          'touch-manipulation sm:p-6',
          darkModeClasses.interactive.hover,
          'active:bg-neutral-50 dark:active:bg-neutral-800/50'
        )}
        aria-label={isExpanded ? 'Comprimi impostazioni' : 'Espandi impostazioni'}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className={cn('flex-shrink-0 rounded-lg border p-2', theme.bg)}>
            <Settings className={cn('h-4 w-4 sm:h-5 sm:w-5', theme.icon)} />
          </div>
          <h3
            className={cn('truncate text-base font-bold sm:text-lg', darkModeClasses.text.primary)}
          >
            {t('common.settings_panel.impostazioni_ai')}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className={cn('h-5 w-5 flex-shrink-0', darkModeClasses.text.tertiary)} />
        ) : (
          <ChevronDown className={cn('h-5 w-5 flex-shrink-0', darkModeClasses.text.tertiary)} />
        )}
      </button>

      {isExpanded && (
        <div className={cn('overflow-x-hidden border-t p-4 sm:p-6', darkModeClasses.border.base)}>
          {content}
        </div>
      )}
    </div>
  );
}
