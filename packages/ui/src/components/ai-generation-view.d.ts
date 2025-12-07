export interface AIGenerationLog {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}
export interface AIGenerationViewProps {
    title?: string;
    subtitle?: string;
    progress: number;
    logs: AIGenerationLog[];
    isGenerating: boolean;
    isSuccess: boolean;
    error: string | null;
    successTitle?: string;
    successMessage?: string;
    successActionLabel?: string;
    onSuccessAction?: () => void;
    onRetry?: () => void;
    className?: string;
    children?: React.ReactNode;
}
export declare function AIGenerationView({ title, subtitle, progress, logs, isGenerating, isSuccess, error, successTitle, successMessage, successActionLabel, onSuccessAction, onRetry, className, children, }: AIGenerationViewProps): import("react/jsx-runtime").JSX.Element;
