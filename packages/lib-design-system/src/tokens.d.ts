/**
 * Design System Tokens
 *
 * Centralized design tokens for the OneCoach application.
 * These tokens define the core visual language and should be used
 * consistently across all components.
 */
export declare const designTokens: {
    /**
     * Color System
     * Following a structured approach with primary, secondary, neutral, and semantic colors
     */
    readonly colors: {
        readonly primary: {
            readonly 50: "#ecfdf5";
            readonly 100: "#d1fae5";
            readonly 200: "#a7f3d0";
            readonly 300: "#6ee7b7";
            readonly 400: "#34d399";
            readonly 500: "#10b981";
            readonly 600: "#059669";
            readonly 700: "#047857";
            readonly 800: "#065f46";
            readonly 900: "#064e3b";
            readonly 950: "#022c22";
        };
        readonly secondary: {
            readonly 50: "#eff6ff";
            readonly 100: "#dbeafe";
            readonly 200: "#bfdbfe";
            readonly 300: "#93c5fd";
            readonly 400: "#60a5fa";
            readonly 500: "#3b82f6";
            readonly 600: "#2563eb";
            readonly 700: "#1d4ed8";
            readonly 800: "#1e40af";
            readonly 900: "#1e3a8a";
            readonly 950: "#172554";
        };
        readonly neutral: {
            readonly 50: "#f8fafc";
            readonly 100: "#f1f5f9";
            readonly 200: "#e2e8f0";
            readonly 300: "#cbd5e1";
            readonly 400: "#94a3b8";
            readonly 500: "#64748b";
            readonly 600: "#475569";
            readonly 700: "#334155";
            readonly 800: "#1e293b";
            readonly 900: "#0f172a";
            readonly 950: "#020617";
        };
        readonly semantic: {
            readonly success: {
                readonly light: "#d1fae5";
                readonly DEFAULT: "#10b981";
                readonly dark: "#047857";
            };
            readonly warning: {
                readonly light: "#fef3c7";
                readonly DEFAULT: "#f59e0b";
                readonly dark: "#d97706";
            };
            readonly error: {
                readonly light: "#fecaca";
                readonly DEFAULT: "#ef4444";
                readonly dark: "#dc2626";
            };
            readonly info: {
                readonly light: "#dbeafe";
                readonly DEFAULT: "#3b82f6";
                readonly dark: "#1d4ed8";
            };
        };
        readonly background: {
            readonly light: "#ffffff";
            readonly subtle: "#f8fafc";
            readonly muted: "#f1f5f9";
            readonly dark: "#0f172a";
        };
        readonly text: {
            readonly primary: "#0f172a";
            readonly secondary: "#475569";
            readonly tertiary: "#94a3b8";
            readonly inverse: "#ffffff";
            readonly disabled: "#cbd5e1";
        };
        readonly border: {
            readonly light: "#f1f5f9";
            readonly DEFAULT: "#e2e8f0";
            readonly strong: "#cbd5e1";
            readonly inverse: "#334155";
        };
    };
    /**
     * Glassmorphism System
     * Premium glass effects for modern UI
     */
    readonly glass: {
        readonly blur: {
            readonly xs: "4px";
            readonly sm: "8px";
            readonly DEFAULT: "12px";
            readonly md: "16px";
            readonly lg: "20px";
            readonly xl: "24px";
            readonly '2xl': "32px";
        };
        readonly background: {
            readonly light: "rgba(255, 255, 255, 0.7)";
            readonly lightSubtle: "rgba(255, 255, 255, 0.5)";
            readonly lightStrong: "rgba(255, 255, 255, 0.85)";
            readonly dark: "rgba(15, 23, 42, 0.7)";
            readonly darkSubtle: "rgba(15, 23, 42, 0.5)";
            readonly darkStrong: "rgba(15, 23, 42, 0.85)";
            readonly primary: "rgba(16, 185, 129, 0.1)";
            readonly secondary: "rgba(59, 130, 246, 0.1)";
        };
        readonly border: {
            readonly light: "rgba(255, 255, 255, 0.2)";
            readonly dark: "rgba(255, 255, 255, 0.1)";
            readonly accent: "rgba(16, 185, 129, 0.3)";
        };
        readonly shadow: {
            readonly light: "0 8px 32px rgba(0, 0, 0, 0.08)";
            readonly dark: "0 8px 32px rgba(0, 0, 0, 0.32)";
            readonly glow: "0 0 20px rgba(16, 185, 129, 0.2)";
            readonly glowStrong: "0 0 40px rgba(16, 185, 129, 0.3)";
        };
    };
    /**
     * Chat-specific design tokens
     */
    readonly chat: {
        readonly message: {
            readonly user: {
                readonly bg: "rgba(16, 185, 129, 0.1)";
                readonly bgHover: "rgba(16, 185, 129, 0.15)";
                readonly border: "rgba(16, 185, 129, 0.2)";
                readonly text: "#047857";
            };
            readonly assistant: {
                readonly bg: "rgba(255, 255, 255, 0.6)";
                readonly bgDark: "rgba(30, 41, 59, 0.6)";
                readonly border: "rgba(226, 232, 240, 0.5)";
                readonly borderDark: "rgba(71, 85, 105, 0.3)";
            };
        };
        readonly input: {
            readonly bg: "rgba(255, 255, 255, 0.8)";
            readonly bgDark: "rgba(30, 41, 59, 0.8)";
            readonly border: "rgba(226, 232, 240, 0.6)";
            readonly borderDark: "rgba(71, 85, 105, 0.4)";
            readonly focusRing: "rgba(16, 185, 129, 0.4)";
        };
        readonly sidebar: {
            readonly bg: "rgba(248, 250, 252, 0.9)";
            readonly bgDark: "rgba(15, 23, 42, 0.9)";
            readonly itemHover: "rgba(16, 185, 129, 0.08)";
            readonly itemActive: "rgba(16, 185, 129, 0.12)";
        };
    };
    /**
     * Typography System
     */
    readonly typography: {
        readonly fontFamily: {
            readonly sans: readonly ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"];
            readonly mono: readonly ["Fira Code", "Consolas", "Monaco", "Courier New", "monospace"];
        };
        readonly fontSize: {
            readonly xs: {
                readonly size: "0.75rem";
                readonly lineHeight: "1rem";
            };
            readonly sm: {
                readonly size: "0.875rem";
                readonly lineHeight: "1.25rem";
            };
            readonly base: {
                readonly size: "1rem";
                readonly lineHeight: "1.5rem";
            };
            readonly lg: {
                readonly size: "1.125rem";
                readonly lineHeight: "1.75rem";
            };
            readonly xl: {
                readonly size: "1.25rem";
                readonly lineHeight: "1.75rem";
            };
            readonly '2xl': {
                readonly size: "1.5rem";
                readonly lineHeight: "2rem";
            };
            readonly '3xl': {
                readonly size: "1.875rem";
                readonly lineHeight: "2.25rem";
            };
            readonly '4xl': {
                readonly size: "2.25rem";
                readonly lineHeight: "2.5rem";
            };
            readonly '5xl': {
                readonly size: "3rem";
                readonly lineHeight: "1";
            };
            readonly '6xl': {
                readonly size: "3.75rem";
                readonly lineHeight: "1";
            };
        };
        readonly fontWeight: {
            readonly light: "300";
            readonly normal: "400";
            readonly medium: "500";
            readonly semibold: "600";
            readonly bold: "700";
            readonly extrabold: "800";
        };
        readonly letterSpacing: {
            readonly tighter: "-0.05em";
            readonly tight: "-0.025em";
            readonly normal: "0em";
            readonly wide: "0.025em";
            readonly wider: "0.05em";
            readonly widest: "0.1em";
        };
    };
    /**
     * Spacing System
     * Using a consistent 4px base unit scale
     */
    readonly spacing: {
        readonly 0: "0px";
        readonly 0.5: "0.125rem";
        readonly 1: "0.25rem";
        readonly 1.5: "0.375rem";
        readonly 2: "0.5rem";
        readonly 2.5: "0.625rem";
        readonly 3: "0.75rem";
        readonly 3.5: "0.875rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 7: "1.75rem";
        readonly 8: "2rem";
        readonly 9: "2.25rem";
        readonly 10: "2.5rem";
        readonly 11: "2.75rem";
        readonly 12: "3rem";
        readonly 14: "3.5rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 28: "7rem";
        readonly 32: "8rem";
    };
    /**
     * Border Radius System
     */
    readonly borderRadius: {
        readonly none: "0px";
        readonly sm: "0.125rem";
        readonly DEFAULT: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly xl: "0.75rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.5rem";
        readonly full: "9999px";
    };
    /**
     * Shadow System
     */
    readonly shadows: {
        readonly xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
        readonly sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
        readonly DEFAULT: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
        readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
        readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
        readonly none: "none";
        readonly glass: "0 8px 32px rgba(0, 0, 0, 0.08)";
        readonly glassDark: "0 8px 32px rgba(0, 0, 0, 0.32)";
        readonly glow: "0 0 20px rgba(16, 185, 129, 0.2)";
        readonly glowStrong: "0 0 40px rgba(16, 185, 129, 0.3)";
    };
    /**
     * Animation & Transition System
     */
    readonly transitions: {
        readonly duration: {
            readonly instant: "75ms";
            readonly fast: "150ms";
            readonly DEFAULT: "200ms";
            readonly medium: "300ms";
            readonly slow: "500ms";
            readonly slower: "700ms";
        };
        readonly timing: {
            readonly ease: "ease";
            readonly linear: "linear";
            readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
            readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
            readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
            readonly spring: "cubic-bezier(0.34, 1.56, 0.64, 1)";
            readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        };
    };
    /**
     * Chat-specific animations
     */
    readonly animations: {
        readonly fadeIn: "fadeIn 0.2s ease-out";
        readonly fadeInUp: "fadeInUp 0.3s ease-out";
        readonly slideInRight: "slideInRight 0.3s ease-out";
        readonly slideInLeft: "slideInLeft 0.3s ease-out";
        readonly pulse: "pulse 2s ease-in-out infinite";
        readonly shimmer: "shimmer 2s linear infinite";
        readonly typing: "typing 1.4s ease-in-out infinite";
        readonly bounce: "bounce 1s ease-in-out infinite";
    };
    /**
     * Breakpoints for responsive design
     */
    readonly breakpoints: {
        readonly xs: "375px";
        readonly sm: "640px";
        readonly md: "768px";
        readonly lg: "1024px";
        readonly xl: "1280px";
        readonly '2xl': "1536px";
    };
    /**
     * Z-index scale
     */
    readonly zIndex: {
        readonly base: 0;
        readonly dropdown: 1000;
        readonly sticky: 1020;
        readonly fixed: 1030;
        readonly modalBackdrop: 1040;
        readonly modal: 1050;
        readonly popover: 1060;
        readonly tooltip: 1070;
        readonly copilot: 9999;
    };
    /**
     * Opacity scale
     */
    readonly opacity: {
        readonly 0: "0";
        readonly 5: "0.05";
        readonly 10: "0.1";
        readonly 20: "0.2";
        readonly 30: "0.3";
        readonly 40: "0.4";
        readonly 50: "0.5";
        readonly 60: "0.6";
        readonly 70: "0.7";
        readonly 80: "0.8";
        readonly 90: "0.9";
        readonly 95: "0.95";
        readonly 100: "1";
    };
};
export type DesignTokens = typeof designTokens;
export type ColorScale = keyof typeof designTokens.colors.primary;
export type SemanticColor = keyof typeof designTokens.colors.semantic;
export type GlassBlur = keyof typeof designTokens.glass.blur;
export type ChatMessageType = keyof typeof designTokens.chat.message;
