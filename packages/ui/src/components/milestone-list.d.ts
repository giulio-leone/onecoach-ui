import type { TaskItemProps } from './task-list';
export interface MilestoneProps {
    id: string;
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    tasks: TaskItemProps[];
    className?: string;
}
export declare function MilestoneItem({ title, progress, tasks, className }: MilestoneProps): import("react/jsx-runtime").JSX.Element;
interface MilestoneListProps {
    milestones: MilestoneProps[];
    className?: string;
}
export declare function MilestoneList({ milestones, className }: MilestoneListProps): import("react/jsx-runtime").JSX.Element;
export {};
