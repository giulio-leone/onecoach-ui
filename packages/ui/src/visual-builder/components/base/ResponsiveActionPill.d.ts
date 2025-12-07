import React from 'react';
export interface ResponsiveActionPillProps {
    label: string;
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    variant?: 'blue' | 'emerald' | 'purple' | 'red' | 'neutral';
    className?: string;
    showLabelOnMobile?: boolean;
    title?: string;
    isIconOnly?: boolean;
}
export declare function ResponsiveActionPill({ label, icon, onClick, variant, className, showLabelOnMobile, title, isIconOnly, }: ResponsiveActionPillProps): import("react/jsx-runtime").JSX.Element;
