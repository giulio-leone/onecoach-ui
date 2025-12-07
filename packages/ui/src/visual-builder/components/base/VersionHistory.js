import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VersionHistory Component
 *
 * Generic version history component for visual builders
 * Displays list of versions with restore functionality
 * Fully optimized for dark mode
 */
import { darkModeClasses, cn } from '@OneCoach/lib-design-system';
export function VersionHistory({ versions, onRestore, className = '', variant = 'blue', }) {
    const gradientClass = variant === 'green'
        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
    return (_jsxs("div", { className: cn('overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-lg sm:p-6', darkModeClasses.card.base, className), children: [_jsx("h3", { className: cn('mb-4 text-lg font-semibold sm:mb-6 sm:text-xl', darkModeClasses.text.primary), children: "Cronologia Versioni" }), _jsx("div", { className: "space-y-2", children: versions.length === 0 ? (_jsx("p", { className: cn('text-sm', darkModeClasses.text.muted), children: "Nessuna versione precedente" })) : (versions.map((v) => (_jsxs("div", { className: cn('flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md', darkModeClasses.border.base, darkModeClasses.bg.subtle, darkModeClasses.interactive.hover), children: [_jsxs("div", { children: [_jsxs("p", { className: cn('font-semibold', darkModeClasses.text.primary), children: ["Versione ", v.version] }), _jsx("p", { className: cn('mt-1 text-xs font-medium sm:text-sm', darkModeClasses.text.muted), children: new Date(v.createdAt).toLocaleString('it-IT') })] }), _jsx("button", { onClick: () => onRestore(v.version), className: cn('min-h-[44px] touch-manipulation rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]', gradientClass), children: "Ripristina" })] }, v.id)))) })] }));
}
