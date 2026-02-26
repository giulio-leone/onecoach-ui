/**
 * Core UI primitives (merged from @giulio-leone/ui-core)
 *
 * Only exports components unique to core that are NOT already
 * provided by the root ui barrel (button, card, badge, dialog, etc.
 * are wrapped/re-exported by root files and should not be duplicated).
 *
 * @packageDocumentation
 */

// Interactive Components
export * from './components/dnd';
export * from './components/progress-ring';

// Premium Layout Components
export * from './components/glass-container';
export * from './components/micro-interactions';

// Feedback & Input Components
export * from './components/empty-state';
export * from './components/notes-input';

// Wizard Components
export * from './components/wizard/selection-card';
export * from './components/wizard/wizard-radio-group';
export * from './components/wizard/wizard-slider';

// Selection & Toolbar
export * from './selection-toolbar';

// Import Modal
export * from './components/import-modal';

// Providers
export * from './realtime-provider';
export { SupabaseProvider, useSupabaseContext } from './supabase-provider';
export { DialogRenderer } from './dialog-renderer';
export { SessionProvider } from './session-provider';
export { IntlProvider } from './intl-provider';
export { PwaProvider } from './pwa-provider';
export { QueryProvider } from './query-provider';
export { ThemeInitializer } from './theme-initializer';
export { ReactNativeWebPolyfill } from './react-native-web-polyfill';
