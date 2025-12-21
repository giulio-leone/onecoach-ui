/**
 * Admin Card Component
 *
 * Componente riutilizzabile per card nelle pagine admin
 * Supporta varianti glass e default con padding configurabile
 * Principi: KISS, SOLID, DRY
 */
import { type ReactNode } from 'react';
export interface AdminCardProps {
    title?: string;
    description?: string;
    variant?: 'glass' | 'default';
    padding?: 'sm' | 'md' | 'lg';
    className?: string;
    children: ReactNode;
}
export declare function AdminCard({ title, description, variant, padding, className, children, }: AdminCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=admin-card.d.ts.map