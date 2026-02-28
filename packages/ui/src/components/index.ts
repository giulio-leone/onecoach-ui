// Re-export LoadingState and ErrorState components
export { LoadingIndicator as LoadingState } from '../loading-indicator';
export type { LoadingIndicatorProps } from '../loading-indicator';
export { ErrorState } from '../error-state';
export type { ErrorStateProps } from '../error-state';
export { EmptyState } from '../empty-state';
export type { EmptyStateProps } from '../empty-state';

// ── Core (primitives & utilities) ──────────────────────────
export * from './core/Animated';
export * from './core/progress-bar';
export * from './core/SkeletonLoader';
export * from './core/model-selector-modal';
export * from './core/model-selector';

// ── Domain (business-specific) ─────────────────────────────
export * from './domain/habit-card';
export * from './domain/habit-list';
export * from './domain/milestone-list';
export * from './domain/project-card';
// Native-only components (excluded from web type-check)
// export * from './domain/recursive-task-item';
export * from './domain/task-list';
export * from './domain/task-types';
export * from './domain/unified-list-item';
export * from './domain/project-gantt';

// ── AI Elements (domain) ────────────────────────────────────
export * from './domain/ai-elements';

// ── Chat (domain) ───────────────────────────────────────────
export * from './domain/chat/chat-history-modal';
export * from './domain/chat/conversation-list';

// ── AI Generation (domain) ──────────────────────────────────
export * from './domain/ai-generation-view';

export type { FilterOption } from './domain/catalog/catalog-layout';
