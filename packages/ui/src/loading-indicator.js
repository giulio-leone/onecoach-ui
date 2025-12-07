/**
 * LoadingIndicator Component (AI Steps)
 *
 * Refactored for a "Graphic & Modern" look.
 * Hides raw text behind a sleek visual step process.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@OneCoach/lib-design-system';
import { Sparkles, Brain, Zap, CheckCircle2 } from 'lucide-react';
const stages = [
    { icon: Sparkles, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
    { icon: Brain, color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
    { icon: Zap, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
    { icon: CheckCircle2, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
];
const sizeClasses = {
    sm: {
        container: 'max-w-sm p-4',
        iconWrapper: 'h-10 w-10',
        barWidth: 'w-24',
    },
    md: {
        container: 'max-w-md p-6',
        iconWrapper: 'h-12 w-12',
        barWidth: 'w-32',
    },
    lg: {
        container: 'max-w-lg p-8',
        iconWrapper: 'h-14 w-14',
        barWidth: 'w-40',
    },
};
const LoadingIndicatorComponent = ({ stage = 0, message, size = 'md', className, }) => {
    if (stages.length === 0) {
        return null;
    }
    const currentStageIndex = ((stage % stages.length) + stages.length) % stages.length;
    const currentStage = stages[currentStageIndex];
    const Icon = currentStage.icon;
    if (!currentStage || !Icon) {
        return null;
    }
    const sizeStyle = sizeClasses[size] ?? sizeClasses.md;
    return (_jsxs("div", { className: "animate-fadeIn w-full max-w-md", children: [_jsxs("div", { className: cn('relative overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/60 shadow-2xl backdrop-blur-xl', sizeStyle.container, className), children: [_jsx("div", { className: cn('absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-colors duration-700', currentStage.color.replace('text-', 'bg-')) }), _jsxs("div", { className: "relative z-10 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: cn('flex items-center justify-center rounded-xl bg-white/5 shadow-inner transition-all duration-500', sizeStyle.iconWrapper, currentStage.glow), children: _jsx(Icon, { className: cn('h-6 w-6 animate-pulse transition-all duration-500', currentStage.color) }) }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("div", { className: cn('h-1.5 overflow-hidden rounded-full bg-white/5', sizeStyle.barWidth), children: _jsx("div", { className: cn('h-full rounded-full transition-all duration-500', currentStage.color.replace('text-', 'bg-')), style: { width: `${((currentStageIndex + 1) / 4) * 100}%` } }) }), _jsx("div", { className: "flex gap-1", children: [0, 1, 2, 3].map((i) => (_jsx("div", { className: cn('h-1 w-6 rounded-full transition-colors duration-300', i <= currentStageIndex ? 'bg-white/20' : 'bg-white/5') }, i))) })] })] }), _jsxs("div", { className: "flex items-center gap-2 rounded-full border border-white/5 bg-black/20 px-3 py-1.5 backdrop-blur-md", children: [_jsxs("div", { className: "flex gap-1", children: [_jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" }), _jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" }), _jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-white" })] }), _jsx("span", { className: "text-[10px] font-bold tracking-widest text-neutral-500 uppercase", children: "AI PROCESSING" })] })] })] }), message ? (_jsx("div", { className: "mt-4 text-center", children: _jsx("p", { className: "text-sm font-medium text-neutral-400", children: message }) })) : null] }));
};
export { LoadingIndicatorComponent as LoadingIndicator };
