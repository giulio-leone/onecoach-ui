export interface UnifiedListItemProps {
    id: string;
    title: string;
    description?: string;
    type: 'task' | 'habit' | 'event';
    status: 'pending' | 'completed' | 'skipped' | 'in-progress';
    time?: string;
    priority?: 'low' | 'medium' | 'high';
    streak?: number;
    onToggle?: () => void;
    onPress?: () => void;
    className?: string;
}
/**
 * UnifiedListItem Component
 *
 * A versatile list item component designed to display both one-off Tasks
 * and recurring Habits in a unified "Agenda" view.
 */
export declare function UnifiedListItem({ title, description, type, status, time, priority, streak, onToggle, onPress, className, }: UnifiedListItemProps): import("react/jsx-runtime").JSX.Element;
