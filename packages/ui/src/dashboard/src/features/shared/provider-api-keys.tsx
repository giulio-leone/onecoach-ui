'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Zap,
  Server,
  Globe,
  Cpu,
  Bot,
  Copy,
  Check,
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Input, Switch } from '@giulio-leone/ui';
import { cn } from '@giulio-leone/lib-design-system';
import type { ProviderName } from '@giulio-leone/lib-ai';
interface ProviderConfigClient {
  provider: ProviderName;
  label: string;
  maskedKey: string;
  hasKey: boolean;
  isEnabled: boolean;
  env: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  defaultModel?: string | null;
  defaultProvider?: string | null;
}
interface ProviderApiKeysProps {
  configs: ProviderConfigClient[];
}
interface ProviderState extends ProviderConfigClient {
  newApiKey: string;
  modelInput: string;
  providerInput: string;
  isSaving: boolean;
  saveSuccess: boolean;
  isDeleting: boolean;
  vercelSynced?: boolean;
  vercelError?: string;
  error?: string;
  showKeyInput: boolean;
  isExpanded: boolean;
  connectionStatus: 'idle' | 'testing' | 'connected' | 'failed';
  latency?: number;
}
const PROVIDER_INFO: Record<
  ProviderName,
  { description: string; icon: React.ElementType; color: string; gradient: string; accent: string }
> = {
  google: {
    description: 'Gemini 2.5 Flash / Pro tramite Google AI Studio',
    icon: Sparkles,
    color: 'text-blue-400',
    gradient: 'from-blue-500/5 via-blue-500/0 to-transparent',
    accent: 'bg-blue-500',
  },
  anthropic: {
    description: 'Modelli Claude 3.5 (Haiku, Sonnet)',
    icon: Bot,
    color: 'text-amber-400',
    gradient: 'from-amber-500/5 via-amber-500/0 to-transparent',
    accent: 'bg-amber-500',
  },
  openai: {
    description: 'Modelli GPT-4o / GPT-5 tramite OpenAI',
    icon: Zap,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/5 via-emerald-500/0 to-transparent',
    accent: 'bg-emerald-500',
  },
  xai: {
    description: 'Modelli Grok via xAI',
    icon: Cpu,
    color: 'text-neutral-400',
    gradient: 'from-neutral-500/5 via-neutral-500/0 to-transparent',
    accent: 'bg-neutral-500',
  },
  minimax: {
    description: 'Modelli MiniMax M2, M2-Stable e M2.1 (tramite Anthropic SDK)',
    icon: Server,
    color: 'text-rose-400',
    gradient: 'from-rose-500/5 via-rose-500/0 to-transparent',
    accent: 'bg-rose-500',
  },
  openrouter: {
    description: 'Aggregatore multi-provider OpenRouter',
    icon: Globe,
    color: 'text-violet-400',
    gradient: 'from-violet-500/5 via-violet-500/0 to-transparent',
    accent: 'bg-violet-500',
  },
  'gemini-cli': {
    description: 'Gemini CLI Integration (Local)',
    icon: Sparkles,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/5 via-cyan-500/0 to-transparent',
    accent: 'bg-cyan-500',
  },
};
const providerOrder: ProviderName[] = [
  'anthropic',
  'openai',
  'google',
  'minimax',
  'xai',
  'xai',
  'openrouter',
  'gemini-cli',
];
export function ProviderApiKeysSection({ configs }: ProviderApiKeysProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const initialState = providerOrder.map<ProviderState>((provider) => {
    const config =
      configs.find((item) => item.provider === provider) ??
      ({
        provider,
        label: provider.charAt(0).toUpperCase() + provider.slice(1),
        maskedKey: '',
        hasKey: false,
        isEnabled: false,
        env: '',
        defaultModel: null,
        defaultProvider: null,
      } as ProviderConfigClient);
    const defaultModel = config.defaultModel ?? null;
    const defaultProvider = config.defaultProvider ?? null;
    return {
      ...config,
      defaultModel,
      defaultProvider,
      newApiKey: '',
      modelInput: defaultModel ?? '',
      providerInput: defaultProvider ?? '',
      isSaving: false,
      saveSuccess: false,
      isDeleting: false,
      vercelSynced: config.hasKey,
      showKeyInput: false,
      isExpanded: false,
      connectionStatus: 'idle',
    };
  });
  const [providers, setProviders] = useState<ProviderState[]>(initialState);
  const updateProviderState = (provider: ProviderName, updates: Partial<ProviderState>) => {
    setProviders((prev) =>
      prev.map((item) => (item.provider === provider ? { ...item, ...updates } : item))
    );
  };
  const handleToggle = (provider: ProviderName, isEnabled: boolean) => {
    updateProviderState(provider, {
      isEnabled,
      saveSuccess: false,
      error: undefined,
    });
  };
  const handleApiKeyChange = (provider: ProviderName, value: string) => {
    updateProviderState(provider, {
      newApiKey: value,
      saveSuccess: false,
      error: undefined,
    });
  };
  const toggleKeyInputVisibility = (provider: ProviderName) => {
    const current = providers.find((p) => p.provider === provider);
    if (current) {
      updateProviderState(provider, { showKeyInput: !current.showKeyInput });
    }
  };
  const toggleExpand = (provider: ProviderName) => {
    const current = providers.find((p) => p.provider === provider);
    if (current) {
      updateProviderState(provider, { isExpanded: !current.isExpanded });
    }
  };
  const testConnection = async (provider: ProviderName) => {
    updateProviderState(provider, { connectionStatus: 'testing', latency: undefined });
    // Simulate network request
    const latency = Math.floor(Math.random() * 200) + 50; // 50-250ms
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const current = providers.find((p) => p.provider === provider);
    // Fail if no key or disabled (simulation logic)
    if (!current?.hasKey && !current?.newApiKey) {
      updateProviderState(provider, { connectionStatus: 'failed' });
    } else {
      updateProviderState(provider, { connectionStatus: 'connected', latency });
    }
  };
  const handleSave = async (provider: ProviderName) => {
    updateProviderState(provider, { isSaving: true, saveSuccess: false, error: undefined });
    const current = providers.find((item) => item.provider === provider);
    if (!current) return;
    try {
      const defaultModelParam = provider === 'openrouter' ? current.modelInput.trim() : undefined;
      const defaultProviderParam =
        provider === 'openrouter' ? current.providerInput.trim() : undefined;
      // Ensure we don't send empty string as apiKey, send undefined to keep existing
      const apiKeyPayload = current.newApiKey?.trim() || undefined;
      const response = await fetch('/api/admin/config/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKeyPayload,
          isEnabled: current.isEnabled,
          defaultModel: defaultModelParam?.length ? defaultModelParam : null,
          defaultProvider: defaultProviderParam?.length ? defaultProviderParam : null,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || tCommon('errors.saveError'));
      }
      const payload = await response.json();
      const updated = payload.config;
      const vercelStatus = payload.vercel;
      updateProviderState(provider, {
        maskedKey: updated.maskedKey,
        hasKey: updated.hasKey,
        isEnabled: updated.isEnabled,
        updatedAt: updated.updatedAt,
        updatedBy: updated.updatedBy,
        newApiKey: '',
        defaultModel: updated.defaultModel ?? null,
        defaultProvider: updated.defaultProvider ?? null,
        modelInput: provider === 'openrouter' ? (updated.defaultModel ?? '') : current.modelInput,
        providerInput:
          provider === 'openrouter' ? (updated.defaultProvider ?? '') : current.providerInput,
        isSaving: false,
        saveSuccess: true,
        vercelSynced: vercelStatus?.synced ?? updated.hasKey,
        vercelError: vercelStatus?.error,
        showKeyInput: false,
        isExpanded: false, // Collapse on save
      });
      // Reset success message after 3 seconds
      setTimeout(() => {
        updateProviderState(provider, { saveSuccess: false });
      }, 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : tCommon('errors.unknown');
      updateProviderState(provider, {
        isSaving: false,
        saveSuccess: false,
        error: message,
      });
    }
  };
  const handleDelete = async (provider: ProviderName) => {
    if (!confirm(`Sei sicuro di voler eliminare l'API key per ${provider} da Vercel?`)) return;
    updateProviderState(provider, { isDeleting: true, error: undefined });
    try {
      const response = await fetch(`/api/admin/config/providers?provider=${provider}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Errore nell'eliminazione");
      }
      updateProviderState(provider, {
        hasKey: false,
        maskedKey: '',
        isDeleting: false,
        vercelSynced: false,
        saveSuccess: true,
        connectionStatus: 'idle',
      });
      setTimeout(() => {
        updateProviderState(provider, { saveSuccess: false });
      }, 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : tCommon('errors.unknown');
      updateProviderState(provider, { isDeleting: false, error: message });
    }
  };
  const activeProvidersCount = providers.filter((p) => p.isEnabled && p.hasKey).length;
  const totalProviders = providers.length;
  const isSystemOperational = activeProvidersCount > 0;
  return (
    <div className="space-y-8">
      {/* Dashboard Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-bold tracking-wider text-blue-500 uppercase dark:text-blue-400">
                {t('provider_api_keys.system_status')}
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t('provider_api_keys.ai_command_center')}
            </h3>
            <p className="max-w-xl text-neutral-500 dark:text-neutral-400">
              {t('provider_api_keys.gestione_centralizzata_delle_connessioni')}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-neutral-100 bg-white/50 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {t('provider_api_keys.provider_attivi')}
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                {activeProvidersCount}
                <span className="text-sm text-neutral-400 dark:text-neutral-500">
                  /{totalProviders}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white/50 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {t('provider_api_keys.stato_sistema')}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    'text-lg font-bold',
                    isSystemOperational
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {isSystemOperational ? 'Operativo' : 'Setup Richiesto'}
                </span>
                {isSystemOperational && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.provider}
            state={provider}
            onToggle={handleToggle}
            onApiKeyChange={handleApiKeyChange}
            onToggleKeyInput={toggleKeyInputVisibility}
            onSave={handleSave}
            onDelete={handleDelete}
            onExpand={toggleExpand}
            onTestConnection={testConnection}
          />
        ))}
      </div>
    </div>
  );
}
function ProviderCard({
  state,
  onToggle,
  onApiKeyChange,
  onToggleKeyInput,
  onSave,
  onDelete,
  onExpand,
  onTestConnection,
}: {
  state: ProviderState;
  onToggle: (p: ProviderName, v: boolean) => void;
  onApiKeyChange: (p: ProviderName, v: string) => void;
  onToggleKeyInput: (p: ProviderName) => void;
  onSave: (p: ProviderName) => void;
  onDelete: (p: ProviderName) => void;
  onExpand: (p: ProviderName) => void;
  onTestConnection: (p: ProviderName) => void;
}) {
  const t = useTranslations('admin');

  const info = PROVIDER_INFO[state.provider];
  const Icon = info.icon;
  const [isCopied, setIsCopied] = useState(false);
  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.hasKey) {
      navigator.clipboard.writeText(state.maskedKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border backdrop-blur-2xl transition-all duration-500',
        state.isExpanded ? 'row-span-2' : '',
        state.isEnabled
          ? 'border-neutral-200 bg-white/80 shadow-xl dark:border-neutral-700 dark:bg-neutral-800'
          : 'border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900'
      )}
    >
      {/* Active Glow Effect - Reduced opacity for elegance */}
      {state.isEnabled && (
        <div
          className={cn(
            'absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-10 blur-3xl dark:opacity-10',
            info.accent
          )}
        ></div>
      )}
      {/* Background Gradient - Subtle */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500',
          state.isEnabled || state.isExpanded ? 'opacity-100' : 'group-hover:opacity-100',
          'bg-gradient-to-b',
          info.gradient
        )}
      />
      {/* Header - Always Visible */}
      <div className="relative z-10 cursor-pointer p-6" onClick={() => onExpand(state.provider)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner transition-transform duration-500 group-hover:scale-110',
                state.isEnabled
                  ? 'from-white to-neutral-100 dark:from-[#252525] dark:to-[#2A2A2A] dark:shadow-black/50'
                  : 'from-neutral-100 to-neutral-200 opacity-50 dark:from-[#1A1A1A] dark:to-[#202020]'
              )}
            >
              <Icon
                className={cn(
                  'h-7 w-7 transition-colors duration-300',
                  state.isEnabled ? info.color : 'text-neutral-400 dark:text-neutral-500'
                )}
              />
            </div>
            <div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white">{state.label}</h4>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    state.isEnabled
                      ? 'animate-pulse bg-green-500'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  )}
                ></div>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {state.isEnabled ? 'Operational' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}>
              <Switch
                checked={state.isEnabled}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onToggle(state.provider, e.target.checked)
                }
              />
            </div>
            <div className="rounded-full bg-neutral-100 p-1 text-neutral-400 transition-colors hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10">
              {state.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
        {/* Mini Status Bar (Visible when collapsed) */}
        {!state.isExpanded && (
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <KeyRound size={12} />
              <span className="font-mono">{state.hasKey ? 'KEY_CONFIGURED' : 'NO_KEY'}</span>
            </div>
            {state.vercelSynced && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 size={12} />
                <span>Synced</span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Expanded Content */}
      <AnimatePresence>
        {state.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-neutral-100 bg-white/50 px-6 pb-6 dark:border-white/5 dark:bg-black/20"
          >
            <div className="space-y-6 pt-6">
              {/* Connection Status & Test */}
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      state.connectionStatus === 'connected'
                        ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                        : state.connectionStatus === 'failed'
                          ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-neutral-400'
                    )}
                  >
                    {state.connectionStatus === 'testing' ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : state.connectionStatus === 'connected' ? (
                      <Wifi size={20} />
                    ) : state.connectionStatus === 'failed' ? (
                      <WifiOff size={20} />
                    ) : (
                      <Activity size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {state.connectionStatus === 'testing'
                        ? 'Testing Connection...'
                        : state.connectionStatus === 'connected'
                          ? 'Connected'
                          : state.connectionStatus === 'failed'
                            ? 'Connection Failed'
                            : 'Connection Status'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {state.latency ? `${state.latency}ms latency` : 'Check API availability'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTestConnection(state.provider)}
                  disabled={state.connectionStatus === 'testing'}
                  className="h-8 text-xs dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                >
                  {state.connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {t('provider_api_keys.api_key_configuration')}
                    </label>
                    {state.hasKey && (
                      <span className="flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                        <Server size={10} />
                        {state.env}
                      </span>
                    )}
                  </div>
                  <div className="group/input relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-4 w-4 text-neutral-400 transition-colors group-focus-within/input:text-blue-500" />
                    </div>
                    <Input
                      type={state.showKeyInput ? 'text' : 'password'}
                      autoComplete="off"
                      value={state.newApiKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onApiKeyChange(state.provider, e.target.value)
                      }
                      placeholder={state.hasKey ? '••••••••••••••••' : 'Enter new API Key'}
                      className="bg-white pr-10 pl-10 transition-all focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-neutral-600"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                      {state.hasKey && !state.newApiKey && (
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-neutral-300"
                          title={t('provider_api_keys.copy_masked_key')}
                        >
                          {isCopied ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleKeyInput(state.provider)}
                        className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-neutral-300"
                      >
                        {state.showKeyInput ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
                {state.provider === 'openrouter' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2"
                  >
                    <div className="rounded-lg border border-dashed border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                      {t('provider_api_keys.il_modello_predefinito_openrouter_si_con')}
                    </div>
                  </motion.div>
                )}
              </div>
              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {state.hasKey && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      disabled={state.isSaving || state.isDeleting}
                      onClick={() => onDelete(state.provider)}
                    >
                      {state.isDeleting ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Trash2 size={14} className="mr-1.5" />
                      )}
                      {t('provider_api_keys.revoke_key')}
                    </Button>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="bg-neutral-900 text-white shadow-lg shadow-neutral-500/20 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  size="sm"
                  disabled={state.isSaving || state.isDeleting}
                  onClick={() => onSave(state.provider)}
                >
                  {state.isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t('provider_api_keys.save_changes')}
                </Button>
              </div>
              {/* Messages */}
              <AnimatePresence mode="wait">
                {state.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <AlertCircle size={14} />
                    {state.error}
                  </motion.div>
                )}
                {state.saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <CheckCircle2 size={14} />{' '}
                    {t('provider_api_keys.configuration_saved_successfully')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
