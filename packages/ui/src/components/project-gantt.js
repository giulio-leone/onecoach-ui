'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@OneCoach/lib-design-system';
export function ProjectGantt({ project, className }) {
    const startDate = startOfWeek(project.startDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(project.endDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const totalDays = days.length;
    return (_jsxs("div", { className: cn('w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900', className), children: [_jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsxs("h3", { className: "text-lg font-bold text-neutral-900 dark:text-white", children: [project.title, " - Gantt"] }) }), _jsxs("div", { className: "relative min-w-[800px]", children: [_jsx("div", { className: "grid auto-cols-fr grid-flow-col border-b border-neutral-200 pb-2 dark:border-neutral-800", children: days.map((day) => (_jsxs("div", { className: "flex flex-col items-center justify-center text-xs text-neutral-500", children: [_jsx("span", { className: "font-bold", children: format(day, 'd', { locale: it }) }), _jsx("span", { children: format(day, 'EE', { locale: it }) })] }, day.toString()))) }), _jsx("div", { className: "mt-4 space-y-3", children: project.tasks.map((task) => {
                            const startOffset = differenceInDays(task.startDate, startDate);
                            const duration = differenceInDays(task.endDate, task.startDate) + 1;
                            const leftPercent = (startOffset / totalDays) * 100;
                            const widthPercent = (duration / totalDays) * 100;
                            return (_jsx("div", { className: "relative h-8 w-full", children: _jsxs("div", { className: "absolute top-0 h-8 rounded-md bg-sky-500/20 dark:bg-sky-500/30", style: {
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                    }, children: [_jsx("div", { className: "h-full rounded-md bg-sky-500", style: { width: `${task.progress}%` } }), _jsx("span", { className: "absolute top-1/2 left-2 -translate-y-1/2 truncate text-xs font-medium whitespace-nowrap text-sky-900 dark:text-sky-100", style: { maxWidth: '100%' }, children: task.title })] }) }, task.id));
                        }) })] })] }));
}
