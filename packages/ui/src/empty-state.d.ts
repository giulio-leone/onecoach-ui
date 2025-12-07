/**
 * EmptyState Component
 *
 * Componente atomico per stati vuoti
 * Segue SRP
 */
import type { LucideIcon } from 'lucide-react';
export interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
}
export declare const EmptyState: ({ icon: Icon, title, description }: EmptyStateProps) => import("react/jsx-runtime").JSX.Element;
