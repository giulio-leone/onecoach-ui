/**
 * ModelSelector Component
 *
 * Componente atomico per selezione modello AI
 * Segue SRP, usa constants invece di hardcoded values (DRY)
 */
import type { AiModel } from '@onecoach/types';
export interface ModelSelectorProps {
    model: AiModel;
    onChange: (model: AiModel) => void;
    extendedThinking: boolean;
    onThinkingChange: (enabled: boolean) => void;
}
export declare const ModelSelector: ({ model, onChange, extendedThinking, onThinkingChange, }: ModelSelectorProps) => import("react/jsx-runtime").JSX.Element;
