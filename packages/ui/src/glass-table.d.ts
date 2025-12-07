import React from 'react';
export interface GlassTableColumn<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}
export interface GlassTableProps<T> {
    data: T[];
    columns: GlassTableColumn<T>[];
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T) => string;
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    className?: string;
    selectedIds?: Set<string> | string[];
    onSelectRow?: (id: string) => void;
    onSelectAll?: () => void;
    isAllSelected?: boolean;
}
export declare function GlassTable<T>({ data, columns, onRowClick, keyExtractor, isLoading, emptyState, className, selectedIds, onSelectRow, onSelectAll, isAllSelected, }: GlassTableProps<T>): string | number | bigint | true | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined>;
