/**
 * ModelSelector Component
 *
 * Componente atomico per selezione modello AI
 * Segue SRP, usa constants invece di hardcoded values (DRY)
 */

'use client';

import { Settings, Sparkles, Zap } from 'lucide-react';
import { AI_MODELS } from '@giulio-leone/lib-shared';
import type { AiModel } from '@giulio-leone/types/chat';

export interface ModelSelectorProps {
  model: AiModel;
  onChange: (model: AiModel) => void;
  extendedThinking: boolean;
  onThinkingChange: (enabled: boolean) => void;
}

export const ModelSelector = ({
  model,
  onChange,
  extendedThinking,
  onThinkingChange,
}: ModelSelectorProps) => {
  const isSonnet = model === AI_MODELS.SONNET_4_5;
  const isHaiku = model === AI_MODELS.HAIKU_4_5;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:bg-neutral-900">
      <div className="mb-3 flex items-center gap-2">
        <Settings size={18} className="text-slate-600" />
        <h3 className="font-semibold text-slate-900">Configurazione AI</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
            Modello
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange(AI_MODELS.SONNET_4_5)}
              className={`rounded-lg p-3 text-sm font-medium transition-all ${
                isSonnet
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              } `}
            >
              <Sparkles size={16} className="mr-1 inline" />
              Sonnet 4.5
            </button>
            <button
              onClick={() => onChange(AI_MODELS.HAIKU_4_5)}
              className={`rounded-lg p-3 text-sm font-medium transition-all ${
                isHaiku
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              } `}
            >
              <Zap size={16} className="mr-1 inline" />
              Haiku 4.5
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={extendedThinking}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onThinkingChange(e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Ragionamento Esteso
              <span className="ml-1 text-xs text-slate-500">(consigliato)</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
