import React from 'react';
export interface ResourceAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
}
export interface ResourceCardProps {
    title: string;
    subtitle?: string;
    imageSrc?: string | null;
    status?: 'active' | 'draft' | 'archived' | string;
    badges?: string[];
    stats?: Array<{
        label: string;
        value: string | number;
    }>;
    actions?: ResourceAction[];
    onClick?: () => void;
    href?: string;
    className?: string;
    children?: React.ReactNode;
    isSelected?: boolean;
    onSelect?: () => void;
}
export declare const ResourceCard: ({ title, subtitle, imageSrc, status, badges, stats, actions, onClick, href, className, children, isSelected, onSelect, }: ResourceCardProps) => import("react/jsx-runtime").JSX.Element;
