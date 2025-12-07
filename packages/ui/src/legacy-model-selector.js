/**
 * ModelSelector Component
 *
 * Componente atomico per selezione modello AI
 * Segue SRP, usa constants invece di hardcoded values (DRY)
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Settings, Sparkles, Zap } from 'lucide-react';
import { AI_MODELS } from '@onecoach/constants';
export const ModelSelector = ({ model, onChange, extendedThinking, onThinkingChange, }) => {
    const isSonnet = model === AI_MODELS.SONNET_4_5;
    const isHaiku = model === AI_MODELS.HAIKU_4_5;
    return (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-md dark:bg-neutral-900", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx(Settings, { size: 18, className: "text-slate-600" }), _jsx("h3", { className: "font-semibold text-slate-900", children: "Configurazione AI" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-xs font-semibold tracking-wide text-slate-600 uppercase", children: "Modello" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { onClick: () => onChange(AI_MODELS.SONNET_4_5), className: `rounded-lg p-3 text-sm font-medium transition-all ${isSonnet
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'} `, children: [_jsx(Sparkles, { size: 16, className: "mr-1 inline" }), "Sonnet 4.5"] }), _jsxs("button", { onClick: () => onChange(AI_MODELS.HAIKU_4_5), className: `rounded-lg p-3 text-sm font-medium transition-all ${isHaiku
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'} `, children: [_jsx(Zap, { size: 16, className: "mr-1 inline" }), "Haiku 4.5"] })] })] }), _jsx("div", { className: "border-t border-slate-200 pt-3", children: _jsxs("label", { className: "flex cursor-pointer items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: extendedThinking, onChange: (e) => onThinkingChange(e.target.checked), className: "h-4 w-4 rounded border-slate-300 bg-slate-100 text-emerald-600 focus:ring-emerald-500" }), _jsxs("span", { className: "text-sm font-medium text-slate-700", children: ["Ragionamento Esteso", _jsx("span", { className: "ml-1 text-xs text-slate-500", children: "(consigliato)" })] })] }) })] })] }));
};
