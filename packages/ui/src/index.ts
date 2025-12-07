/// <reference path="./types.d.ts" />
/**
 * UI Components - Barrel Export
 *
 * Esporta tutti i componenti atomici UI del Design System
 */

// Core Components
export * from './components/model-selector';
export * from './button';
export * from './card';
export * from './avatar';
export * from './streaming-result';

// Feedback Components
export * from './badge';
export * from './alert';
export * from './tooltip';
export * from './spinner';
export * from './loading-indicator';
export * from './error-state';
export * from './button-group';
export * from './empty-state';
export * from './progress';
export * from './scroll-area';
export * from './collapsible';
export * from './carousel';
export * from './separator';
export { Separator } from './separator';

// Navigation Components
export * from './tab-button';
export * from './tab-button.uniwind';
export * from './tabs';
export * from './tabs/hash-tabs';

// Overlay Components
export * from './modal';
export * from './dialog';
export * from './drawer';
export * from './dropdown-menu';
export * from './hover-card';

// Feature Components

export { ModelSelector as LegacyModelSelector } from './legacy-model-selector';
export * from './theme-toggle';
export * from './date-picker-with-presets';

// Design System - Typography
export * from './typography';

// Design System - Layout
export * from './layout';

// Design System - Form Controls
export * from './form-controls';
export * from './select';
export * from './input';
export * from './input-group';
export * from './command';
export * from './textarea';

// Design System - Dark Mode Optimized Components
export * from './icon-badge';
export * from './amount-display';
export * from './transaction-item';

// Cross-platform Image
export * from './image';

// Animation Components
export * from './components/Animated';

// Skeleton Loaders
export * from './components/SkeletonLoader';
export * from './skeleton';

// Animation Hooks
export * from './hooks/useAnimations';

// App Shell
export * from './app-shell';

// Admin primitives
export * from './admin';

// Dashboard primitives
export * from './dashboard';

// Checkout kit
export * from './checkout';

// Visual Builder Components
export * from './modern-sidebar';
export * from './sidebar-item';
export * from './visual-builder';

// New Generation Components

export * from './stat-card';

export * from './selection-card';
export * from './stepper';

export * from './wizard-layout';
export * from './welcome-header';
export * from './quick-actions-grid';

// Program Viewer Components
export * from './program-viewer';

// Project Management Components
export * from './components/progress-bar';
export * from './components/project-card';
export * from './components/project-gantt';
export * from './components/task-list';
export * from './components/milestone-list';
export * from './components/habit-card';
export * from './components/habit-list';
export * from './components/unified-list-item';

// Chat Components
export * from './components/chat/conversation-list';

// AI Elements Components (AI SDK v6 native)
export * from './components/ai-elements';

// AI Generation Components
export * from './components/ai-generation-view';

// Catalog Components
export * from './components/catalog/resource-card';
export * from './components/catalog/catalog-grid';
export * from './components/catalog/catalog-layout';
export * from './slider';

// Premium Glass Components
export * from './combobox';
export * from './glass-table';
export * from './glass-toolbar';

// Memory Components
export * from './components/memory';

// Cross-platform (Expo/Web)
export * from './xplat';
