import './types/nativewind';

export * from './amount-display';
export * from './animated-number';
export * from './avatar';
export * from './badge';
export * from './button';
export * from './card';
export * from './carousel';
export * from './checkbox';
export * from './checkbox-group';
export * from './collapsible';
export * from './combobox';
export * from './command';
export * from './date-picker-with-presets';
export * from './date-picker';
export * from './date-range-picker';
export * from './dialog';
export * from './drawer';
export * from './dropdown-menu';
export * from './empty-state';
export * from './error-state';
export * from './generating-card';
export * from './glass-table';
export * from './glass-toolbar';
export * from './hover-card';
export * from './icon-badge';
export * from './image';
export * from './input';
export * from './input-group';
export * from './label';
export * from './layout-primitives';
export * from './loading-indicator';
export * from './modern-sidebar';
export * from './progress';
export * from './quick-actions-grid';
export * from './radio';
export * from './radio-group';
export * from './scroll-area';
export * from './select';
export * from './selection-card';
export * from './separator';
export * from './sidebar-item';
export * from './skeleton';
export * from './slider';
export * from './spinner';
export * from './stat-card';
export * from './stepper';
export * from './streaming-result';
export * from './switch';
export * from './tab-button';
export * from './tabs';
export * from './textarea';
export * from './theme-toggle';
export * from './tooltip';
export * from './transaction-item';
export * from './typography';
export * from './welcome-header';
export * from './wizard';
export * from './wizard-layout';
export * from './wizard-slider';
export * from './alert';
export * from './admin';
export * from './app-shell';
export * from './dashboard';
export * from './components/catalog/catalog-grid';
export * from './components/catalog/catalog-layout';
export * from './components/catalog/resource-card';
export * from './button-group';
export * from './checkout';
export * from './components';
export * from './program-card';
export * from './programs-page-layout';
// Program Viewer
export * from './program-viewer/program-action-bar';
export * from './program-viewer/program-day-card';
export * from './program-viewer/program-goals-section';
export * from './program-viewer/program-info-card';
export * from './program-viewer/program-week-card';
// Visual Builder Base Components
export * from './visual-builder/components/base/EditorHeader';
export * from './visual-builder/components/base/VersionHistory';
export * from './visual-builder/contexts/clipboard-context';

// Core (merged from @giulio-leone/ui-core) — selective re-exports to avoid conflicts
export {
  // DnD
  DndProvider, SortableItem, SortableList, ClientOnlyDndWrapper,
  // Providers
  RealtimeProvider, AdminRealtimeProvider,
  SupabaseProvider, useSupabaseContext,
  DialogRenderer, SessionProvider, IntlProvider,
  PwaProvider, QueryProvider, ThemeInitializer,
  ReactNativeWebPolyfill,
  // Unique components
  GlassContainer, ScaleTouch, PulseIndicator,
  ProgressRing, NotesInput, ImportModal,
  SelectionToolbar,
} from './core';
export type { SortableItemRenderProps } from './core';

// Domain modules (merged packages)
export * from './copilot';
export * from './features';
export * from './agenda';
// analytics: use @giulio-leone/ui/analytics (names conflict with ./dashboard)
// messages: use @giulio-leone/ui/messages (names conflict with ./components)
export * from './marketplace';
export * from './layout';
export * from './auth';
export * from './pricing';
