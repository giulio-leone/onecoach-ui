/**
 * Feature and Framework Metadata for AI Settings
 * Centralized configuration for UI display
 */

import type {
  AIChatFeature,
  FrameworkFeature,
  FeatureMetadata,
  FrameworkFeatureMetadata,
} from './types';

export const FEATURE_METADATA: Record<AIChatFeature, FeatureMetadata> = {
  MODEL_SELECTOR: {
    label: 'Selettore Modello',
    description: 'Permette agli utenti di scegliere quale modello AI usare',
    icon: 'Bot',
    category: 'core',
  },
  SPEECH_RECOGNITION: {
    label: 'Riconoscimento Vocale',
    description: 'Input vocale per dettare messaggi',
    icon: 'Mic',
    category: 'ui',
  },
  CHECKPOINT: {
    label: 'Checkpoint',
    description: 'Salvataggio e ripristino punti di conversazione',
    icon: 'CheckCircle2',
    category: 'advanced',
  },
  CONTEXT: {
    label: 'Contesto',
    description: 'Visualizzazione del contesto della conversazione',
    icon: 'FileText',
    category: 'core',
  },
  CONVERSATION: {
    label: 'Conversazione',
    description: 'Componente base della conversazione chat',
    icon: 'MessageSquare',
    category: 'core',
  },
  SOURCES: {
    label: 'Fonti',
    description: 'Mostra le fonti usate nelle risposte',
    icon: 'Link2',
    category: 'ui',
  },
  SUGGESTION: {
    label: 'Suggerimenti',
    description: 'Suggerimenti di follow-up automatici',
    icon: 'Lightbulb',
    category: 'ui',
  },
  TASK: {
    label: 'Task',
    description: 'Creazione e gestione task dalla chat',
    icon: 'ListTodo',
    category: 'advanced',
  },
  ARTIFACT: {
    label: 'Artifact',
    description: 'Generazione di documenti e codice',
    icon: 'Layers',
    category: 'advanced',
  },
  WEB_PREVIEW: {
    label: 'Anteprima Web',
    description: 'Preview di link e contenuti web',
    icon: 'Globe',
    category: 'ui',
  },
  REASONING: {
    label: 'Ragionamento',
    description: 'Mostra il processo di ragionamento AI',
    icon: 'Brain',
    category: 'advanced',
  },
  QUEUE: {
    label: 'Coda',
    description: 'Gestione coda messaggi in attesa',
    icon: 'Clock',
    category: 'core',
  },
};

export const FRAMEWORK_METADATA: Record<FrameworkFeature, FrameworkFeatureMetadata> = {
  consensus_system: {
    label: 'Sistema Consenso',
    description: 'Multi-model voting per decisioni critiche con strategie configurabili',
    icon: 'Vote',
    configSchema: {
      votingStrategy: {
        type: 'select',
        label: 'Strategia di Voto',
        options: [
          { value: 'majority', label: 'Maggioranza' },
          { value: 'weighted', label: 'Pesato' },
          { value: 'confidence', label: 'Confidenza' },
          { value: 'unanimous', label: 'Unanime' },
        ],
      },
      minModels: {
        type: 'number',
        label: 'Modelli Minimi',
        min: 2,
        max: 5,
      },
      maxModels: {
        type: 'number',
        label: 'Modelli Massimi',
        min: 2,
        max: 5,
      },
      confidenceThreshold: {
        type: 'number',
        label: 'Soglia Confidenza',
        min: 0,
        max: 1,
        step: 0.1,
      },
      timeoutMs: {
        type: 'number',
        label: 'Timeout (ms)',
        min: 5000,
        max: 120000,
        step: 1000,
      },
    },
  },
  import_models: {
    label: 'Import Modelli',
    description: 'Gestione e versioning dei modelli AI importati',
    icon: 'Database',
    configSchema: {},
  },
  workout_import: {
    label: 'Import Workout',
    description: 'Pipeline di import per programmi di allenamento',
    icon: 'Dumbbell',
    configSchema: {},
  },
  skills_system: {
    label: 'Sistema Skills',
    description: 'Registry universale delle skill per capacità estensibili degli agenti',
    icon: 'Puzzle',
    configSchema: {
      enableBuiltInSkills: {
        type: 'boolean',
        label: 'Skills Built-in',
        description: 'Abilita le skill predefinite',
      },
      enableDomainSkills: {
        type: 'boolean',
        label: 'Skills Dominio',
        description: 'Abilita skill specifiche per nutrizione e workout',
      },
      enableCustomSkills: {
        type: 'boolean',
        label: 'Skills Custom',
        description: "Abilita skill definite dall'utente",
      },
      autoDiscovery: {
        type: 'boolean',
        label: 'Auto-Discovery',
        description: 'Scoperta automatica nuove skill',
      },
      skillTimeout: {
        type: 'number',
        label: 'Timeout Skill (ms)',
        min: 1000,
        max: 60000,
        step: 1000,
      },
    },
  },
  learning_feedback_loop: {
    label: 'Learning Feedback',
    description: 'Sistema di apprendimento adattivo che migliora basandosi sulle metriche',
    icon: 'TrendingUp',
    configSchema: {
      enableAdaptiveThresholds: {
        type: 'boolean',
        label: 'Soglie Adattive',
      },
      enableMetricsCollection: {
        type: 'boolean',
        label: 'Raccolta Metriche',
      },
      enableFeedbackLoop: {
        type: 'boolean',
        label: 'Feedback Loop',
      },
      thresholdAdjustmentRate: {
        type: 'number',
        label: 'Rate Adattamento',
        min: 0,
        max: 1,
        step: 0.05,
      },
      metricsRetentionDays: {
        type: 'number',
        label: 'Ritenzione Metriche (giorni)',
        min: 1,
        max: 365,
      },
      minSamplesForAdjustment: {
        type: 'number',
        label: 'Campioni Minimi',
        min: 10,
        max: 1000,
      },
    },
  },
  intelligent_mode_selection: {
    label: 'Selezione Intelligente Mode',
    description: 'Selezione semantica AI-powered del mode per esecuzione ottimale',
    icon: 'Sparkles',
    configSchema: {
      useAISelection: {
        type: 'boolean',
        label: 'Usa AI per Selezione',
      },
      enableCaching: {
        type: 'boolean',
        label: 'Abilita Cache',
      },
      fallbackMode: {
        type: 'select',
        label: 'Mode Fallback',
        options: [
          { value: 'planning', label: 'Planning' },
          { value: 'analyze', label: 'Analyze' },
          { value: 'explain', label: 'Explain' },
          { value: 'review', label: 'Review' },
        ],
      },
      minConfidenceThreshold: {
        type: 'number',
        label: 'Soglia Confidenza Minima',
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
  },
  auto_decomposition: {
    label: 'Auto-Decomposizione',
    description: 'Decomposizione automatica dei task per operazioni complesse',
    icon: 'GitBranch',
    configSchema: {
      enableAutoDecomposition: {
        type: 'boolean',
        label: 'Abilita Auto-Decomposizione',
      },
      maxDepth: {
        type: 'number',
        label: 'Profondità Massima',
        min: 1,
        max: 10,
      },
      minConfidenceThreshold: {
        type: 'number',
        label: 'Soglia Confidenza',
        min: 0,
        max: 1,
        step: 0.1,
      },
      enableCaching: {
        type: 'boolean',
        label: 'Abilita Cache',
      },
    },
  },
  adaptive_recovery: {
    label: 'Recovery Adattivo',
    description: 'Recovery intelligente degli errori con strategie di fallback multiple',
    icon: 'RefreshCw',
    configSchema: {
      enableAdaptiveRecovery: {
        type: 'boolean',
        label: 'Abilita Recovery Adattivo',
      },
      maxRetries: {
        type: 'number',
        label: 'Tentativi Massimi',
        min: 1,
        max: 5,
      },
      strategies: {
        type: 'multiselect',
        label: 'Strategie',
        options: [
          { value: 'regenerate', label: 'Rigenera' },
          { value: 'patch', label: 'Patch' },
          { value: 'escalate', label: 'Escalate' },
        ],
      },
      confidenceThreshold: {
        type: 'number',
        label: 'Soglia Confidenza',
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
  },
  cost_monitoring: {
    label: 'Monitoraggio Costi',
    description: 'Tracking costi in tempo reale e gestione budget',
    icon: 'DollarSign',
    configSchema: {
      enableMonitoring: {
        type: 'boolean',
        label: 'Abilita Monitoraggio',
      },
      budgetLimit: {
        type: 'number',
        label: 'Limite Budget (crediti)',
        min: 0,
        max: 100000,
        step: 100,
      },
      enableAlerts: {
        type: 'boolean',
        label: 'Abilita Alert',
      },
      alertThreshold: {
        type: 'number',
        label: 'Soglia Alert (%)',
        min: 0,
        max: 100,
        step: 5,
      },
    },
  },
  orchestration_tracing: {
    label: 'Tracing Orchestrazione',
    description: "Tracing distribuito per debug e analytics dell'orchestrazione",
    icon: 'Activity',
    configSchema: {
      enableTracing: {
        type: 'boolean',
        label: 'Abilita Tracing',
      },
      enablePerformanceMetrics: {
        type: 'boolean',
        label: 'Metriche Performance',
      },
      enableDecisionLogging: {
        type: 'boolean',
        label: 'Log Decisioni',
      },
      retentionDays: {
        type: 'number',
        label: 'Ritenzione (giorni)',
        min: 1,
        max: 90,
      },
    },
  },
  workout_generation_retry: {
    label: 'Retry Generazione Workout',
    description: 'Configurazione tentativi di retry per generazione workout',
    icon: 'Dumbbell',
    configSchema: {
      count: {
        type: 'number',
        label: 'Numero Tentativi',
        min: 1,
        max: 10,
      },
    },
  },
  generation_recovery: {
    label: 'Recovery Generazione AI',
    description: 'Sistema di resilienza e recovery per processi di generazione AI complessi',
    icon: 'RefreshCw',
    configSchema: {
      enabled: {
        type: 'boolean',
        label: 'Abilita Recovery',
        description: 'Permette di riprendere le generazioni fallite dal punto di interruzione',
      },
      maxRetriesPerPhase: {
        type: 'number',
        label: 'Tentativi Massimi per Fase',
        min: 1,
        max: 5,
        description: 'Numero massimo di tentativi automatici per ogni singola fase',
      },
      stateRetentionHours: {
        type: 'number',
        label: 'Ritenzione Stato (ore)',
        min: 1,
        max: 168,
        description: 'Per quanto tempo conservare lo stato di una generazione interrotta',
      },
      errorFeedbackLevel: {
        type: 'select',
        label: 'Dettaglio Feedback Errori',
        options: [
          { value: 'minimal', label: 'Minimo' },
          { value: 'detailed', label: 'Dettagliato' },
        ],
        description: "Quantità di informazioni di errore inviate all'AI durante il recovery",
      },
    },
  },
};

export const ROLES = ['USER', 'COACH', 'ADMIN', 'SUPER_ADMIN'] as const;

export const ROLE_LABELS: Record<string, string> = {
  USER: 'Utente',
  COACH: 'Coach',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export const PROVIDERS = [
  'GOOGLE',
  'ANTHROPIC',
  'OPENAI',
  'XAI',
  'OPENROUTER',
  'MINIMAX',
  'GROQ',
  'PERPLEXITY',
  'COHERE',
  'MISTRAL',
  'AZURE',
  'AWS_BEDROCK',
  'VERTEX',
  'OLLAMA',
  'LM_STUDIO',
  'GEMINI_CLI',
] as const;

export const EXTERNAL_PROVIDERS = [
  'openrouter',
  'openai',
  'anthropic',
  'xai',
  'google-ai-studio',
  'google-vertex',
] as const;

export const EXTERNAL_PROVIDER_LABELS: Record<string, string> = {
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
  anthropic: 'Claude (Anthropic)',
  xai: 'xAI (Grok)',
  'google-ai-studio': 'Google AI Studio',
  'google-vertex': 'Google Vertex AI',
};

export const EXTERNAL_PROVIDER_COLORS: Record<string, string> = {
  openrouter: 'from-rose-500 to-secondary-500',
  openai: 'from-green-500 to-emerald-500',
  anthropic: 'from-orange-500 to-amber-500',
  xai: 'from-primary-500 to-indigo-500',
  'google-ai-studio': 'from-primary-500 to-yellow-500',
  'google-vertex': 'from-primary-600 to-red-500',
};

export const PROVIDER_LABELS: Record<string, string> = {
  GOOGLE: 'Google AI',
  ANTHROPIC: 'Anthropic',
  OPENAI: 'OpenAI',
  XAI: 'xAI',
  OPENROUTER: 'OpenRouter',
  MINIMAX: 'MiniMax',
  GEMINI_CLI: 'Gemini CLI',
};

export const PROVIDER_COLORS: Record<string, string> = {
  GOOGLE: 'from-primary-500 to-green-500',
  ANTHROPIC: 'from-orange-500 to-amber-500',
  OPENAI: 'from-emerald-500 to-teal-500',
  XAI: 'from-secondary-500 to-secondary-500',
  OPENROUTER: 'from-indigo-500 to-primary-500',
  MINIMAX: 'from-red-500 to-rose-500',
  GEMINI_CLI: 'from-cyan-500 to-sky-500',
};

/**
 * OpenRouter provider slugs for provider routing
 * See: https://openrouter.ai/docs/features/provider-routing
 */
export const OPENROUTER_PROVIDERS = [
  { value: '', label: 'Auto (Default)' },
  { value: 'deepinfra', label: 'DeepInfra' },
  { value: 'together', label: 'Together AI' },
  { value: 'fireworks', label: 'Fireworks AI' },
  { value: 'lepton', label: 'Lepton AI' },
  { value: 'azure', label: 'Azure' },
  { value: 'aws-bedrock', label: 'AWS Bedrock' },
  { value: 'google-vertex', label: 'Google Vertex AI' },
  { value: 'novita', label: 'Novita AI' },
  { value: 'hyperbolic', label: 'Hyperbolic' },
  { value: 'lambda', label: 'Lambda' },
  { value: 'parasail', label: 'Parasail' },
  { value: 'avian', label: 'Avian' },
  { value: 'mancer', label: 'Mancer' },
  { value: 'infermatic', label: 'Infermatic' },
] as const;

/**
 * Mapping from external provider slug to AIProvider enum
 */
export const EXTERNAL_TO_AI_PROVIDER: Record<string, string> = {
  openrouter: 'OPENROUTER',
  openai: 'OPENAI',
  anthropic: 'ANTHROPIC',
  xai: 'XAI',
  'google-ai-studio': 'GOOGLE',
  'google-vertex': 'GOOGLE',
};
