import React from 'react';
export interface QuickAction {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType | string;
    href: string;
    color?: string;
}
interface QuickActionsGridProps {
    actions: QuickAction[];
    className?: string;
}
export declare function QuickActionsGrid({ actions, className }: QuickActionsGridProps): import("react/jsx-runtime").JSX.Element;
export {};
