/**
 * ErrorState Component
 *
 * Componente per visualizzare stati di errore
 * Componente indipendente, non wrapper di EmptyState
 */
import type { ReactNode } from 'react';
export interface ErrorStateProps {
    error: Error | null | undefined;
    title?: string | null;
    description?: string | null;
    /**
     * Alias più esplicito per descrivere l'errore (backward compat con le app)
     */
    message?: string | null;
    action?: ReactNode;
    className?: string;
}
export declare const ErrorState: ({ error, title, description, message, action, className, }: ErrorStateProps) => import("react/jsx-runtime").JSX.Element;
