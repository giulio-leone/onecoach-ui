/**
 * Visual Builder Base Components
 *
 * Generic, reusable components for visual builders
 * Platform-specific versions are automatically resolved by React Native/Expo
 */

// Web versions (default)
export * from './EditorHeader';
export * from './VersionHistory';
export * from './CollapsibleSection';
export * from './ActionButton';
export { EmptyState as VisualBuilderEmptyState } from './EmptyState';
export * from './MetadataForm';
export * from './ItemCard';
export * from './ResponsiveActionPill';
export * from './UndoRedoToolbar';
export * from './VersionHistoryModal';

// React Native versions are in .native.tsx files
// They will be automatically resolved by React Native/Expo module resolution
