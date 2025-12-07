'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@OneCoach/lib-design-system';
import { UnifiedListItem } from './unified-list-item';
export function HabitList({ habits, onToggleHabit, className }) {
    return (_jsx("div", { className: cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className), children: habits.map((habit) => (_jsx(UnifiedListItem, { id: habit.id, title: habit.title, description: habit.description, type: "habit", status: habit.completedToday ? 'completed' : 'pending', streak: habit.streak, onToggle: () => onToggleHabit?.(habit.id), onPress: () => { }, className: "mb-0 h-full" // Override margin and height
         }, habit.id))) }));
}
