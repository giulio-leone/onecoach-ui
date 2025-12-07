export interface StreamEvent {
    type: string;
    message: string;
    timestamp: Date;
    data?: Record<string, unknown>;
}
export interface StreamingResultProps {
    isStreaming: boolean;
    progress: number;
    currentMessage: string;
    events: StreamEvent[];
    className?: string;
}
export declare function StreamingResult({ isStreaming, progress, currentMessage, events, className, }: StreamingResultProps): import("react/jsx-runtime").JSX.Element | null;
