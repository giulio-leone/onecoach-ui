/**
 * UI Components - Web Barrel Export
 * Web-specific exports that exclude native-only components
 */

// Core Components
export * from './button';
export * from './button-link';
export * from './input';
export * from './label';
export * from './select';
export * from './textarea';
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
export * from './empty-state';
export * from './button-group';
export * from './carousel';
export * from './collapsible';
export * from './scroll-area';
export * from './progress';
export * from './separator';
export { Separator } from './separator';
export * from './dropdown-menu';
export * from './hover-card';
export * from './command';
export * from './input-group';

// Navigation Components
export * from './tab-button';
export * from './tabs';

// Overlay Components
export * from './dialog';
export * from './drawer';

// Feature Components
export * from './components/model-selector';
export { ModelSelector as LegacyModelSelector } from './legacy-model-selector';
export * from './theme-toggle';
export * from './date-picker-with-presets';
export * from './date-picker';
export * from './date-range-picker';

// Design System - Typography
export * from './typography';

// Design System - Layout
export * from './layout';

// Design System - Form Controls
// Design System - Form Controls
export * from './checkbox';
export * from './checkbox-group';
export * from './radio';
export * from './radio-group';
export * from './switch';

// Design System - Dark Mode Optimized Components
export * from './icon-badge';
export * from './amount-display';
export * from './transaction-item';

// Cross-platform Image
export * from './image';

// Animation Components (web versions only)
export * from './components/Animated/index.web';

// Skeleton Loaders
export * from './components/SkeletonLoader';
export * from './skeleton';

// Animation Hooks (web versions)
export * from './hooks/useAnimations.web';

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
export * from './wizard';
export * from './wizard-slider';

// Program Viewer Components
export * from './program-viewer';

// Project Management Components
export * from './components/progress-bar';
export * from './components/project-card';
export * from './components/project-gantt';
export * from './components/task-list';
export * from './components/milestone-list';
export * from './components/habit-card';
// Native-only - excluded from web
// export * from './components/habit-list';
// export * from './components/unified-list-item';

// Chat Components
export * from './components/chat/conversation-list';
export * from './components/chat/chat-history-modal'; // Added

// AI Elements Components (AI SDK v6 native)
export * from './components/ai-elements';

// AI Generation Components
export * from './components/ai-generation-view';

// Catalog Components
export * from './components/catalog/resource-card';
export * from './components/catalog/catalog-grid';
export * from './components/catalog/catalog-layout';
export * from './tabs/hash-tabs';

// Slider Component
export * from './slider';

// Premium Glass Components
export * from './combobox';
export * from './glass-table';
export * from './glass-toolbar';

// New Chat UI (Nano Banana Pro)
export * from './chat/chat-layout-wrapper';
export * from './chat/chat-header';
export * from './chat/chat-messages-list';
export * from './chat/chat-input-area';

// Program Cards
export * from './program-card';
export * from './programs-page-layout';

// Import Modal (generic file upload component)
export { ImportModal } from '@giulio-leone/ui-core';
