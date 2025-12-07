export interface TaskItemProps {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: Date;
    onToggle?: (id: string) => void;
    className?: string;
}
export declare function TaskItem({ id, title, status, priority, dueDate, onToggle, className, }: TaskItemProps): import("react/jsx-runtime").JSX.Element;
interface TaskListProps {
    tasks: TaskItemProps[];
    onToggleTask?: (id: string) => void;
    className?: string;
}
export declare function TaskList({ tasks, onToggleTask, className }: TaskListProps): import("react/jsx-runtime").JSX.Element;
export {};
