/**
 * Memory Progress Tracker Component
 *
 * Tracks and displays user progress (weight, injuries, goals).
 * KISS: Simple progress display with add button
 */
export interface MemoryProgressTrackerProps {
    userId: string;
    className?: string;
}
export declare function MemoryProgressTracker({ userId, className }: MemoryProgressTrackerProps): import("react/jsx-runtime").JSX.Element;
