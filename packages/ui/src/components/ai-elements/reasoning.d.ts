/**
 * Reasoning Component
 *
 * Collapsible per chain-of-thought / reasoning AI.
 */
import { type ComponentProps, type ReactNode } from 'react';
export interface ReasoningProps extends ComponentProps<'div'> {
    isStreaming?: boolean;
    duration?: number;
    children: ReactNode;
}
export declare const Reasoning: import("react").ForwardRefExoticComponent<Omit<ReasoningProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface ReasoningTriggerProps extends ComponentProps<'button'> {
    duration?: number;
}
export declare const ReasoningTrigger: import("react").ForwardRefExoticComponent<Omit<ReasoningTriggerProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export interface ReasoningContentProps extends ComponentProps<'div'> {
    children: ReactNode;
}
export declare const ReasoningContent: import("react").ForwardRefExoticComponent<Omit<ReasoningContentProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface ReasoningBubbleProps {
    text: string;
    isStreaming?: boolean;
}
export declare function ReasoningBubble({ text, isStreaming }: ReasoningBubbleProps): import("react/jsx-runtime").JSX.Element;
