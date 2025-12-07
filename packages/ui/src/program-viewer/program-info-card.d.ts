import React from 'react';
import type { LucideIcon } from 'lucide-react';
export interface ProgramMetadata {
    label: string;
    value: string | React.ReactNode;
    icon?: LucideIcon;
    className?: string;
}
export interface ProgramInfoCardProps {
    name: string;
    description?: string;
    metadata?: ProgramMetadata[];
    icon?: LucideIcon;
    variant?: 'workout' | 'nutrition';
    className?: string;
}
export declare function ProgramInfoCard({ name, description, metadata, icon: Icon, variant, className, }: ProgramInfoCardProps): import("react/jsx-runtime").JSX.Element;
