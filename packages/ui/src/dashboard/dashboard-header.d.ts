import type React from 'react';
import { type KpiCardProps } from './kpi-card';
export interface DashboardHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    stats?: KpiCardProps[];
    className?: string;
}
export declare function DashboardHeader({ title, description, actions, stats, className, }: DashboardHeaderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=dashboard-header.d.ts.map