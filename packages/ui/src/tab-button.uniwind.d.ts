/**
 * TabButton Component - Unified with Uniwind
 *
 * Cross-platform tab button using Uniwind className approach
 * Works on both web (Tailwind CSS) and native (Uniwind/Metro)
 */
import type { ComponentType } from 'react';
import type { TabButtonSharedProps } from './tab-button.shared';
export interface UnifiedTabButtonProps extends TabButtonSharedProps {
    icon: ComponentType<{
        size?: number;
        color?: string;
        className?: string;
    }>;
}
export declare const UnifiedTabButton: ({ active, onClick, icon: Icon, label, count, }: UnifiedTabButtonProps) => import("react/jsx-runtime").JSX.Element;
