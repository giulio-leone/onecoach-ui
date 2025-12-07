export interface HabitProps {
    id: string;
    title: string;
    description?: string;
    streak: number;
    completedToday: boolean;
    frequency: 'DAILY' | 'WEEKLY';
    onToggle?: (id: string) => void;
    className?: string;
}
export declare function HabitCard({ id, title, description, streak, completedToday, frequency, onToggle, className, }: HabitProps): import("react/jsx-runtime").JSX.Element;
