import type { HabitProps } from './habit-card';
interface HabitListProps {
    habits: HabitProps[];
    onToggleHabit?: (id: string) => void;
    className?: string;
}
export declare function HabitList({ habits, onToggleHabit, className }: HabitListProps): import("react/jsx-runtime").JSX.Element;
export {};
