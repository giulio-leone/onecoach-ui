import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ErrorState Component
 *
 * Componente per visualizzare stati di errore
 * Componente indipendente, non wrapper di EmptyState
 */
import { AlertCircle } from 'lucide-react';
export const ErrorState = ({ error, title, description, message, action, className = '', }) => {
    const errorTitle = title ?? 'Si è verificato un errore';
    const errorMessage = error?.message ?? null;
    const errorDescription = description ?? message ?? errorMessage ?? 'Qualcosa è andato storto. Riprova più tardi.';
    return (_jsxs("div", { className: `animate-fadeIn mt-20 text-center text-slate-500 ${className}`, children: [_jsx("div", { className: "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:border-red-800 dark:from-red-900/20 dark:to-red-800/20", children: _jsx(AlertCircle, { size: 40, className: "text-red-500 dark:text-red-400" }) }), _jsx("p", { className: "mb-2 text-xl font-semibold text-slate-700 dark:text-slate-300", children: errorTitle }), _jsx("p", { className: "mb-4 text-sm text-red-600 dark:text-red-400", children: errorDescription }), action && _jsx("div", { className: "mt-4", children: action })] }));
};
