export interface CatalogHeaderProps {
    title: string;
    description?: string;
    stats?: Array<{
        label: string;
        value: string | number;
    }>;
    onAdd?: () => void;
    addLabel?: string;
}
export declare const CatalogHeader: ({ title, description, stats, onAdd, addLabel, }: CatalogHeaderProps) => import("react/jsx-runtime").JSX.Element;
export interface FilterOption {
    label: string;
    value: string;
}
export interface CatalogToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    activeFilters?: string[];
    filterOptions?: FilterOption[];
    onFilterChange?: (value: string) => void;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    className?: string;
}
export declare const CatalogToolbar: ({ searchQuery, onSearchChange, activeFilters, filterOptions, onFilterChange, viewMode, onViewModeChange, className, }: CatalogToolbarProps) => import("react/jsx-runtime").JSX.Element;
