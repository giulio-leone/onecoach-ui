import React from 'react';
export interface GlassToolbarProps {
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    children?: React.ReactNode;
    className?: string;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}
export declare const GlassToolbar: ({ searchQuery, onSearchChange, viewMode, onViewModeChange, children, className, startContent, endContent, }: GlassToolbarProps) => import("react/jsx-runtime").JSX.Element;
