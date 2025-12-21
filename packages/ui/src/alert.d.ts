/**
 * Alert Component
 *
 * Componente per messaggi di notifica e avvisi
 */
import React from 'react';
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    children: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
}
export declare const Alert: ({ variant, title, children, dismissible, onDismiss, className, ...props }: AlertProps) => import("react/jsx-runtime").JSX.Element | null;
export declare const AlertDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const AlertTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>>;
//# sourceMappingURL=alert.d.ts.map