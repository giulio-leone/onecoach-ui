/**
 * VersionHistory Component
 *
 * Generic version history component for visual builders
 * Displays list of versions with restore functionality
 * Fully optimized for dark mode
 */
export interface Version {
    id: string;
    version: number;
    createdAt: string | Date;
}
export interface VersionHistoryProps {
    versions: Version[];
    onRestore: (version: number) => void;
    className?: string;
    variant?: 'blue' | 'green';
}
export declare function VersionHistory({ versions, onRestore, className, variant, }: VersionHistoryProps): import("react/jsx-runtime").JSX.Element;
