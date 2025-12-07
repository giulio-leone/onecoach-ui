import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@onecoach/lib-design-system';
import { KpiCard } from './kpi-card';
export function DashboardHeader({ title, description, actions, stats, className, }) {
    return (_jsxs("div", { className: cn('mb-10 flex flex-col gap-6', className), children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-neutral-900 dark:text-white", children: title }), description && (_jsx("p", { className: "text-base text-neutral-600 dark:text-neutral-400", children: description }))] }), actions && _jsx("div", { className: "flex flex-wrap gap-3", children: actions })] }), stats && stats.length > 0 && (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: stats.map((stat) => (_jsx(KpiCard, { ...stat }, stat.label))) }))] }));
}
