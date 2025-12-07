import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Alert Component
 *
 * Componente per messaggi di notifica e avvisi
 */
import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
export const Alert = ({ variant = 'info', title, children, dismissible = false, onDismiss, className = '', ...props }) => {
    const [isDismissed, setIsDismissed] = React.useState(false);
    const variantStyles = {
        success: 'bg-success-light dark:bg-green-900/30 border-success dark:border-green-700 text-success-dark dark:text-green-300',
        warning: 'bg-warning-light dark:bg-yellow-900/30 border-warning dark:border-yellow-700 text-warning-dark dark:text-yellow-300',
        error: 'bg-error-light dark:bg-red-900/30 border-error dark:border-red-700 text-error-dark dark:text-red-300',
        info: 'bg-info-light dark:bg-blue-900/30 border-info dark:border-blue-700 text-info-dark dark:text-blue-300',
    };
    const icons = {
        success: CheckCircle,
        warning: AlertTriangle,
        error: AlertCircle,
        info: Info,
    };
    const Icon = icons[variant];
    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };
    if (isDismissed)
        return null;
    return (_jsxs("div", { className: `relative flex gap-3 rounded-xl border p-4 ${variantStyles[variant]} ${className}`, role: "alert", ...props, children: [_jsx(Icon, { className: "mt-0.5 h-5 w-5 flex-shrink-0" }), _jsxs("div", { className: "flex-1", children: [title && _jsx("div", { className: "mb-1 font-semibold", children: title }), _jsx("div", { className: "text-sm", children: children })] }), dismissible && (_jsx("button", { onClick: handleDismiss, className: "flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:bg-neutral-900/5 dark:hover:bg-white", "aria-label": "Dismiss alert", children: _jsx(X, { className: "h-4 w-4" }) }))] }));
};
