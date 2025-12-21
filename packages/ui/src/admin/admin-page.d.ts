import React from 'react';
type AdminPageProps = {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
    maxWidth?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    padding?: 'sm' | 'md' | 'lg';
};
/**
 * AdminPage - wrapper con background e contenitore coerente tra pagine admin.
 */
export declare function AdminPage({ children, className, gradient, maxWidth, padding, }: AdminPageProps): import("react/jsx-runtime").JSX.Element;
type AdminSectionProps = {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
};
/**
 * AdminSection - sezione con titolo/azioni opzionali e spaziatura standard.
 */
export declare function AdminSection({ title, description, actions, children, className, }: AdminSectionProps): import("react/jsx-runtime").JSX.Element;
/**
 * AdminPageContent - wrapper per blocchi principali (e.g., card/griglie).
 */
export declare function AdminPageContent({ className, children, }: {
    className?: string;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=admin-page.d.ts.map