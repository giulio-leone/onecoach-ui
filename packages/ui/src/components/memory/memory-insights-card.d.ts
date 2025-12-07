/**
 * Memory Insights Card
 *
 * Displays AI-generated insights and patterns.
 * KISS: Simple card component
 */
import type { MemoryPattern, MemoryInsight } from '@OneCoach/lib-core/user-memory/types';
export interface MemoryInsightsCardProps {
    patterns?: MemoryPattern[];
    insights?: MemoryInsight[];
    className?: string;
}
export declare function MemoryInsightsCard({ patterns, insights, className, }: MemoryInsightsCardProps): import("react/jsx-runtime").JSX.Element | null;
