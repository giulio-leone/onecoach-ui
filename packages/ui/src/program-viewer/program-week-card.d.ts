import React from 'react';
export interface ProgramWeekCardProps {
    weekNumber: number;
    focus?: string;
    notes?: string;
    children: React.ReactNode;
    className?: string;
}
export declare function ProgramWeekCard({ weekNumber, focus, notes, children, className, }: ProgramWeekCardProps): import("react/jsx-runtime").JSX.Element;
