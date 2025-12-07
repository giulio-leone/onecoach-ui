import React from 'react';
export interface CatalogGridProps {
    children: React.ReactNode;
    className?: string;
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    viewMode?: 'grid' | 'list';
}
export declare const CatalogGrid: ({ children, className, isLoading, emptyState, viewMode, }: CatalogGridProps) => import("react/jsx-runtime").JSX.Element;
