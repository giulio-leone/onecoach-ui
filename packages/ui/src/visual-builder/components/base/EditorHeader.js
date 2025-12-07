import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * EditorHeader Component
 *
 * Generic header component for visual builders (workout and nutrition)
 * Supports name, description editing and action buttons
 * Fully optimized for dark mode
 */
import { Save, History } from 'lucide-react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';
export function EditorHeader({ name, description, onNameChange, onDescriptionChange, onSave, isSaving, isEditMode, showVersions: _showVersions, onToggleVersions, saveButtonText, saveButtonVariant = 'blue', className = '', }) {
    const buttonClass = saveButtonVariant === 'green'
        ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 dark:bg-green-500 dark:hover:bg-green-600 dark:active:bg-green-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 text-white';
    return (_jsxs("div", { className: cn('flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 ease-out sm:flex-row sm:items-start sm:justify-between sm:p-6', darkModeClasses.card.base, 'hover:shadow-md dark:hover:shadow-lg', className), children: [_jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("input", { type: "text", value: name, onChange: (e) => onNameChange(e.target.value), className: cn('w-full border-0 bg-transparent text-xl font-bold placeholder-neutral-400/70 transition-colors duration-200 focus:ring-0 focus:outline-none sm:text-2xl', darkModeClasses.text.primary), placeholder: "Nome" }), _jsx("textarea", { value: description, onChange: (e) => onDescriptionChange(e.target.value), className: cn('w-full resize-none border-0 bg-transparent text-sm placeholder-neutral-400/70 transition-colors duration-200 focus:ring-0 focus:outline-none sm:text-base', darkModeClasses.text.secondary), placeholder: "Descrizione", rows: 2 })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [isEditMode && (_jsxs("button", { onClick: onToggleVersions, className: cn('flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200', darkModeClasses.border.base, darkModeClasses.bg.base, darkModeClasses.text.secondary, darkModeClasses.interactive.hover, darkModeClasses.interactive.button), children: [_jsx(History, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Versioni" })] })), _jsxs("button", { onClick: onSave, disabled: isSaving, className: cn('flex min-h-[44px] touch-manipulation items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50', darkModeClasses.interactive.button, buttonClass), children: [_jsx(Save, { className: "h-4 w-4" }), isSaving ? 'Salvataggio...' : saveButtonText || (isEditMode ? 'Salva' : 'Crea')] })] })] }));
}
