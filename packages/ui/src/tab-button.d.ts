/**
 * TabButton Component - Web
 *
 * Componente atomico per tab navigation
 * Segue SRP
 */
import type { LucideIcon } from 'lucide-react';
import type { TabButtonSharedProps } from './tab-button.shared';
export interface TabButtonProps extends TabButtonSharedProps {
    icon: LucideIcon;
}
export declare const TabButton: ({ active, onClick, icon: Icon, label, count }: TabButtonProps) => import("react/jsx-runtime").JSX.Element;
