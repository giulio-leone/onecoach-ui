export interface FilterBarProps {
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
    initialSearch?: string;
    children?: React.ReactNode;
    className?: string;
}
export declare function FilterBar({ searchPlaceholder, onSearchChange, initialSearch, children, className, }: FilterBarProps): import("react/jsx-runtime").JSX.Element;
