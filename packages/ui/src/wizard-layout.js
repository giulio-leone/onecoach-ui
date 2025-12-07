import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { cn } from '@OneCoach/lib-design-system';
import { GlassCard } from './glass-card';
import { GradientButton } from './gradient-button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
export function WizardLayout({ steps, currentStepIndex, onStepChange, onComplete, isCompleting = false, title, subtitle, className, }) {
    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;
    if (!currentStep)
        return null;
    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        }
        else {
            onStepChange(currentStepIndex + 1);
        }
    };
    const handleBack = () => {
        if (!isFirstStep) {
            onStepChange(currentStepIndex - 1);
        }
    };
    return (_jsxs(View, { className: cn('flex-1', className), children: [_jsxs(View, { className: "mb-6", children: [title && (_jsx(Text, { className: "text-2xl font-bold text-neutral-900 dark:text-neutral-100", children: title })), subtitle && (_jsx(Text, { className: "mt-1 text-base text-neutral-500 dark:text-neutral-400", children: subtitle })), _jsx(View, { className: "mt-6", children: _jsx(View, { className: "flex-row justify-between px-1", children: steps.map((step, index) => {
                                const isActive = index === currentStepIndex;
                                const isCompleted = index < currentStepIndex;
                                return (_jsxs(View, { className: "flex-1 items-center", children: [_jsx(View, { className: cn('h-1 w-full rounded-full transition-all duration-300', isCompleted
                                                ? 'bg-blue-600 dark:bg-blue-500'
                                                : isActive
                                                    ? 'bg-blue-200 dark:bg-blue-900'
                                                    : 'bg-neutral-200 dark:bg-neutral-800') }), isActive && (_jsxs(Text, { className: "absolute top-3 text-xs font-bold text-blue-600 dark:text-blue-400", children: ["Step ", index + 1] }))] }, step.id));
                            }) }) })] }), _jsxs(ScrollView, { className: "flex-1", contentContainerStyle: { paddingBottom: 100 }, showsVerticalScrollIndicator: false, children: [_jsxs(View, { className: "mb-6", children: [_jsx(Text, { className: "text-xl font-bold text-neutral-900 dark:text-neutral-100", children: currentStep.title }), currentStep.description && (_jsx(Text, { className: "mt-1 text-base text-neutral-500 dark:text-neutral-400", children: currentStep.description }))] }), _jsx(View, { className: "min-h-[300px]", children: currentStep.component })] }), _jsxs(GlassCard, { intensity: "heavy", className: "absolute right-0 bottom-0 left-0 flex-row items-center justify-between rounded-t-3xl rounded-b-none border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:border-neutral-800", children: [_jsxs(TouchableOpacity, { onPress: handleBack, disabled: isFirstStep, className: cn('flex-row items-center gap-2 rounded-xl px-4 py-3 transition-all', isFirstStep
                            ? 'opacity-0'
                            : 'bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-800 dark:active:bg-neutral-700'), children: [_jsx(ChevronLeft, { size: 20, color: isFirstStep ? '#cbd5e1' : '#475569' }), _jsx(Text, { className: "font-semibold text-neutral-600 dark:text-neutral-300", children: "Indietro" })] }), _jsx(GradientButton, { onPress: handleNext, disabled: !currentStep.isValid || isCompleting, loading: isCompleting, className: "min-w-[140px]", children: _jsxs(View, { className: "flex-row items-center gap-2", children: [_jsx(Text, { className: "font-bold text-white", children: isLastStep ? 'Genera' : 'Avanti' }), !isLastStep && _jsx(ChevronRight, { size: 20, color: "white" }), isLastStep && _jsx(Check, { size: 20, color: "white" })] }) })] })] }));
}
