/**
 * Memory Timeline Component
 *
 * Displays timeline of significant events (progress, injuries, goals).
 * KISS: Simple timeline list
 */
import type { TimelineEventType, MemoryDomain } from '@onecoach/lib-core/user-memory/types';
export interface MemoryTimelineProps {
    userId: string;
    eventType?: TimelineEventType;
    domain?: MemoryDomain;
    limit?: number;
    className?: string;
}
export declare function MemoryTimeline({ userId, eventType, domain, limit, className, }: MemoryTimelineProps): import("react/jsx-runtime").JSX.Element;
