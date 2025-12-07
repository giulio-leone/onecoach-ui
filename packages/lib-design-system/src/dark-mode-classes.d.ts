/**
 * Dark Mode Classes Utility - ENHANCED
 *
 * Centralized dark mode class strings following DRY principle.
 * These constants can be reused across components to maintain consistency.
 * Enhanced with additional utilities and composable patterns.
 */
import { type ClassValue } from 'clsx';
/**
 * Core dark mode classes for different surface levels and states
 */
export declare const darkModeClasses: {
    readonly bg: {
        readonly base: "bg-white dark:bg-neutral-900";
        readonly elevated: "bg-white dark:bg-neutral-800";
        readonly subtle: "bg-neutral-50 dark:bg-neutral-800/50";
        readonly muted: "bg-neutral-100 dark:bg-neutral-800";
        readonly hover: "hover:bg-neutral-50 dark:hover:bg-neutral-800";
        readonly active: "bg-blue-50 dark:bg-blue-900/20";
        readonly selected: "bg-primary-50 dark:bg-primary-900/20";
        readonly overlay: "bg-black/40 dark:bg-black/60";
        readonly overlayLight: "bg-white dark:bg-neutral-900/90 dark:bg-neutral-900/90";
        readonly backdrop: "bg-black/50 dark:bg-black/70 backdrop-blur-sm";
        readonly gradient: "bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800";
        readonly gradientPrimary: "bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600";
        readonly disabled: "bg-neutral-100 dark:bg-neutral-800/50 cursor-not-allowed";
    };
    readonly text: {
        readonly primary: "text-neutral-900 dark:text-neutral-100";
        readonly secondary: "text-neutral-700 dark:text-neutral-300";
        readonly tertiary: "text-neutral-600 dark:text-neutral-400";
        readonly muted: "text-neutral-500 dark:text-neutral-500";
        readonly disabled: "text-neutral-400 dark:text-neutral-600";
        readonly inverse: "text-white dark:text-neutral-900";
        readonly link: "text-primary-600 dark:text-primary-400";
        readonly linkHover: "hover:text-primary-700 dark:hover:text-primary-300";
        readonly brand: "text-primary-600 dark:text-primary-400";
    };
    readonly border: {
        readonly base: "border border-neutral-200 dark:border-neutral-700";
        readonly strong: "border border-neutral-300 dark:border-neutral-600";
        readonly subtle: "border border-neutral-100 dark:border-neutral-800";
        readonly focus: "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30";
        readonly hover: "hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors duration-200";
        readonly error: "border-red-400 dark:border-red-600";
        readonly success: "border-green-400 dark:border-green-600";
        readonly warning: "border-yellow-400 dark:border-yellow-600";
    };
    readonly interactive: {
        readonly hover: "hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all duration-200 ease-out";
        readonly active: "active:bg-neutral-100 dark:active:bg-neutral-700/70 active:scale-[0.98] transition-all duration-150";
        readonly focus: "focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 focus:outline-none transition-all duration-200";
        readonly focusVisible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/30 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 transition-all duration-200";
        readonly disabled: "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";
        readonly button: "transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.98]";
    };
    readonly card: {
        readonly base: "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 shadow-sm dark:shadow-lg dark:shadow-neutral-950/50 rounded-2xl";
        readonly elevated: "bg-white dark:bg-neutral-800 shadow-md dark:shadow-xl dark:shadow-neutral-950/60 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl";
        readonly hover: "hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all duration-200 ease-out";
        readonly interactive: "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-neutral-950/50 transition-all duration-200 ease-out rounded-2xl";
        readonly glass: "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/60 shadow-md dark:shadow-lg dark:shadow-neutral-950/50 rounded-2xl";
    };
    readonly input: {
        readonly base: "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl shadow-sm dark:shadow-lg transition-all duration-300 ease-out hover:shadow-md hover:shadow-neutral-200/50 dark:hover:shadow-xl dark:hover:shadow-neutral-950/70 hover:border-neutral-300 dark:hover:border-neutral-600";
        readonly placeholder: "placeholder-neutral-400 dark:placeholder-neutral-500";
        readonly disabled: "bg-neutral-100 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-500 cursor-not-allowed opacity-50";
        readonly error: "border-red-400 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-500/30 focus:shadow-lg focus:shadow-red-500/20 dark:focus:shadow-lg dark:focus:shadow-red-500/30 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]";
        readonly success: "border-green-400 dark:border-green-600 focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-500/30 focus:shadow-lg focus:shadow-green-500/20 dark:focus:shadow-lg dark:focus:shadow-green-500/30 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]";
        readonly focus: "focus:ring-4 focus:ring-emerald-500/30 dark:focus:ring-emerald-400/30 focus:border-emerald-500 dark:focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/20 dark:focus:shadow-lg dark:focus:shadow-emerald-400/20 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]";
    };
    readonly nav: {
        readonly link: "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200";
        readonly active: "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium";
        readonly activeAlt: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
        readonly icon: "text-neutral-500 dark:text-neutral-400";
        readonly iconActive: "text-primary-600 dark:text-primary-400";
        readonly iconActiveAlt: "text-blue-600 dark:text-blue-400";
    };
    readonly semantic: {
        readonly success: {
            readonly bg: "bg-green-50 dark:bg-green-900/20";
            readonly bgSolid: "bg-green-500 dark:bg-green-600";
            readonly text: "text-green-700 dark:text-green-400";
            readonly textSolid: "text-white dark:text-white";
            readonly border: "border-green-200 dark:border-green-800";
            readonly hover: "hover:bg-green-100 dark:hover:bg-green-900/30";
        };
        readonly warning: {
            readonly bg: "bg-yellow-50 dark:bg-yellow-900/20";
            readonly bgSolid: "bg-yellow-500 dark:bg-yellow-600";
            readonly text: "text-yellow-700 dark:text-yellow-400";
            readonly textSolid: "text-white dark:text-neutral-900";
            readonly border: "border-yellow-200 dark:border-yellow-800";
            readonly hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30";
        };
        readonly error: {
            readonly bg: "bg-red-50 dark:bg-red-900/20";
            readonly bgSolid: "bg-red-500 dark:bg-red-600";
            readonly text: "text-red-700 dark:text-red-400";
            readonly textSolid: "text-white dark:text-white";
            readonly border: "border-red-200 dark:border-red-800";
            readonly hover: "hover:bg-red-100 dark:hover:bg-red-900/30";
        };
        readonly info: {
            readonly bg: "bg-blue-50 dark:bg-blue-900/20";
            readonly bgSolid: "bg-blue-500 dark:bg-blue-600";
            readonly text: "text-blue-700 dark:text-blue-400";
            readonly textSolid: "text-white dark:text-white";
            readonly border: "border-blue-200 dark:border-blue-800";
            readonly hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30";
        };
    };
    readonly shadow: {
        readonly sm: "shadow-sm dark:shadow-md dark:shadow-neutral-950/50";
        readonly md: "shadow-md dark:shadow-lg dark:shadow-neutral-950/60";
        readonly lg: "shadow-lg dark:shadow-xl dark:shadow-neutral-950/70";
        readonly xl: "shadow-xl dark:shadow-2xl dark:shadow-neutral-950/80";
        readonly '2xl': "shadow-2xl dark:shadow-2xl dark:shadow-neutral-950/90";
        readonly inner: "shadow-inner dark:shadow-inner dark:shadow-neutral-950/70";
    };
    readonly table: {
        readonly header: "bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700";
        readonly row: "border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50";
        readonly rowOdd: "bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50";
        readonly rowEven: "bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/60";
        readonly cell: "text-neutral-900 dark:text-neutral-100";
    };
    readonly scrollbar: {
        readonly base: "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-neutral-100 dark:scrollbar-track-neutral-800";
    };
    readonly divider: {
        readonly base: "border-neutral-200 dark:border-neutral-700";
        readonly strong: "border-neutral-300 dark:border-neutral-600";
        readonly subtle: "border-neutral-100 dark:border-neutral-800";
    };
    readonly list: {
        readonly container: "divide-y divide-neutral-100 dark:divide-neutral-800";
        readonly item: "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-colors";
        readonly itemHover: "hover:bg-neutral-50 dark:hover:bg-neutral-800/50";
        readonly itemActive: "bg-neutral-50 dark:bg-neutral-800/50";
        readonly itemSelected: "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400";
    };
    readonly transaction: {
        readonly container: "rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm dark:shadow-2xl dark:shadow-neutral-950/50";
        readonly header: "border-b border-neutral-200 dark:border-neutral-700 p-3 sm:p-4";
        readonly item: "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors";
        readonly iconPositive: "rounded-full bg-green-100 dark:bg-green-900/40 p-2 border border-green-200 dark:border-green-800";
        readonly iconNegative: "rounded-full bg-red-100 dark:bg-red-900/40 p-2 border border-red-200 dark:border-red-800";
        readonly iconNeutral: "rounded-full bg-neutral-100 dark:bg-neutral-700/50 p-2 border border-neutral-200 dark:border-neutral-600";
        readonly title: "font-medium text-neutral-900 dark:text-neutral-100";
        readonly subtitle: "text-xs sm:text-sm text-neutral-500 dark:text-neutral-400";
        readonly amountPositive: "text-sm sm:text-base font-bold text-green-600 dark:text-green-400";
        readonly amountNegative: "text-sm sm:text-base font-bold text-red-600 dark:text-red-400";
        readonly balance: "text-xs text-neutral-500 dark:text-neutral-400";
    };
    readonly iconBadge: {
        readonly base: "rounded-full p-2 flex items-center justify-center";
        readonly success: "bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400";
        readonly error: "bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400";
        readonly warning: "bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400";
        readonly info: "bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400";
        readonly neutral: "bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400";
        readonly purple: "bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400";
    };
    readonly emptyState: {
        readonly container: "rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-8 sm:p-12 text-center shadow-sm dark:shadow-2xl dark:shadow-neutral-950/50";
        readonly icon: "mx-auto h-10 w-10 text-neutral-400 dark:text-neutral-600 sm:h-12 sm:w-12";
        readonly text: "mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400";
    };
    readonly loading: {
        readonly skeleton: "animate-pulse rounded bg-neutral-200 dark:bg-neutral-700";
        readonly container: "rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 sm:p-6";
    };
    readonly chat: {
        readonly container: "rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl dark:shadow-2xl dark:shadow-neutral-950/50";
        readonly messageArea: "bg-white dark:bg-neutral-800";
        readonly welcomeBubble: "rounded-2xl border-2 border-purple-100 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-neutral-800 p-4 shadow-sm dark:shadow-lg dark:shadow-purple-950/30 sm:p-6";
        readonly suggestionBox: "rounded-lg border border-purple-200 dark:border-purple-800/50 bg-purple-100 dark:bg-purple-900/40 p-3 shadow-sm dark:shadow-lg dark:shadow-purple-950/30";
        readonly suggestionText: "text-purple-900 dark:text-purple-200";
        readonly suggestionSubtext: "text-purple-800 dark:text-purple-300";
        readonly inputArea: "border-t-2 border-neutral-200 dark:border-neutral-700 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800/50 dark:to-neutral-800";
        readonly inputField: "border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm focus-within:border-purple-500 dark:focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-900/50";
        readonly userBubble: "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800";
        readonly assistantBubble: "bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700";
        readonly timestamp: "text-neutral-500 dark:text-neutral-500";
    };
    readonly settings: {
        readonly panel: "rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm dark:shadow-lg dark:shadow-neutral-950/30";
        readonly header: "border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50";
        readonly content: "bg-white dark:bg-neutral-800";
        readonly toggle: "bg-neutral-100 dark:bg-neutral-700";
    };
};
/**
 * Helper function to combine dark mode classes with stable ordering
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 * @param classes - Array of class strings to combine
 * @returns Combined class string with stable ordering
 */
export declare function cn(...classes: ClassValue[]): string;
/**
 * Type exports for TypeScript autocomplete
 */
export type DarkModeClasses = typeof darkModeClasses;
