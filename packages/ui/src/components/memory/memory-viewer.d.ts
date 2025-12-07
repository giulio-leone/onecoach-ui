/**
 * Memory Viewer Component
 *
 * Displays user memory organized by domains.
 * KISS: Simple tabbed interface
 * SOLID: Single responsibility - only display
 */
import type { MemoryDomain } from '@OneCoach/lib-core/user-memory/types';
export interface MemoryViewerProps {
    userId: string;
    initialDomain?: MemoryDomain;
    className?: string;
}
export declare function MemoryViewer({ userId, initialDomain, className }: MemoryViewerProps): import("react/jsx-runtime").JSX.Element;
