/**
 * LoadingIndicator Component (AI Steps)
 *
 * Refactored for a "Graphic & Modern" look.
 * Hides raw text behind a sleek visual step process.
 */
export interface LoadingIndicatorProps {
    stage?: number;
    /**
     * Messaggio opzionale da mostrare sotto l'animazione
     */
    message?: string;
    /**
     * Dimensione del componente
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Classi aggiuntive per personalizzare il contenitore
     */
    className?: string;
}
declare const LoadingIndicatorComponent: ({ stage, message, size, className, }: LoadingIndicatorProps) => import("react/jsx-runtime").JSX.Element | null;
export { LoadingIndicatorComponent as LoadingIndicator };
