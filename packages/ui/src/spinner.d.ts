/**
 * Spinner Component
 *
 * Componente per indicatori di caricamento
 */
export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'neutral' | 'white';
    className?: string;
}
export declare const Spinner: ({ size, variant, className }: SpinnerProps) => import("react/jsx-runtime").JSX.Element;
export declare const PageLoader: () => import("react/jsx-runtime").JSX.Element;
