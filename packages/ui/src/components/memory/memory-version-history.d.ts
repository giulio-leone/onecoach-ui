/**
 * Memory Version History Component
 *
 * Displays version history with diff and restore capability.
 * KISS: Simple version list with restore button
 */
export interface MemoryVersionHistoryProps {
    userId: string;
    limit?: number;
    onRestore?: (versionNumber: number) => void;
    className?: string;
}
export declare function MemoryVersionHistory({ userId, limit, onRestore, className, }: MemoryVersionHistoryProps): import("react/jsx-runtime").JSX.Element;
