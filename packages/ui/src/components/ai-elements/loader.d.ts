/**
 * Loader Component
 *
 * Streaming indicators for AI response loading states.
 */
import { type ComponentProps } from 'react';
export interface StreamingDotsProps extends ComponentProps<'div'> {
    size?: 'sm' | 'md' | 'lg';
}
export declare const StreamingDots: import("react").ForwardRefExoticComponent<Omit<StreamingDotsProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface TypingIndicatorProps extends ComponentProps<'div'> {
    label?: string;
}
export declare const TypingIndicator: import("react").ForwardRefExoticComponent<Omit<TypingIndicatorProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface MessageLoaderProps extends ComponentProps<'div'> {
    lines?: number;
}
export declare const MessageLoader: import("react").ForwardRefExoticComponent<Omit<MessageLoaderProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface AIElementSpinnerProps extends ComponentProps<'svg'> {
    size?: 'sm' | 'md' | 'lg';
}
export declare const AIElementSpinner: import("react").ForwardRefExoticComponent<Omit<AIElementSpinnerProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
export interface AIThinkingProps extends ComponentProps<'div'> {
    message?: string;
}
export declare function AIThinking({ message, className, ...props }: AIThinkingProps): import("react/jsx-runtime").JSX.Element;
export interface ToolExecutingProps extends ComponentProps<'div'> {
    toolName?: string;
}
export declare function ToolExecuting({ toolName, className, ...props }: ToolExecutingProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=loader.d.ts.map