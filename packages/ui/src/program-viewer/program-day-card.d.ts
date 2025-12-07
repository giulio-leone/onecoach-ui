import React from 'react';
export interface ProgramDayCardProps {
    dayNumber: number;
    name?: string;
    notes?: string;
    children: React.ReactNode;
    onTrack?: () => void;
    trackLabel?: string;
    variant?: 'workout' | 'nutrition';
    className?: string;
}
export declare function ProgramDayCard({ dayNumber, name, notes, children, onTrack, trackLabel, variant, className, }: ProgramDayCardProps): import("react/jsx-runtime").JSX.Element;
