export interface ProjectTask {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    dependencies?: string[];
}
export interface Project {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    tasks: ProjectTask[];
}
export declare function ProjectGantt({ project, className }: {
    project: Project;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
