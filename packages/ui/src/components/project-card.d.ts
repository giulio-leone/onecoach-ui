interface ProjectCardProps {
    id: string;
    title: string;
    description?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ON_HOLD';
    progress: number;
    dueDate?: Date;
    taskCount: number;
    completedTaskCount: number;
    color?: string;
    className?: string;
}
export declare function ProjectCard({ id, title, description, status, progress, dueDate, taskCount, completedTaskCount, color, className, }: ProjectCardProps): import("react/jsx-runtime").JSX.Element;
export {};
