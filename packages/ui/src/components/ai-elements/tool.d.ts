/**
 * Tool Component
 *
 * Visualizzazione di tool invocations (AI SDK v6).
 * Mostra stato, input, output con collapsible.
 * Uses CSS grid animation (no framer-motion for React 19 compatibility)
 */
import { type ComponentProps, type ReactNode } from 'react';
export type ToolState = 'input-streaming' | 'input-available' | 'approval-requested' | 'approval-responded' | 'output-available' | 'output-error' | 'output-denied';
export interface ToolInput {
    [key: string]: unknown;
}
export interface ToolProps extends ComponentProps<'div'> {
    defaultOpen?: boolean;
    children: ReactNode;
}
export declare const Tool: import("react").ForwardRefExoticComponent<Omit<ToolProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface ToolHeaderProps extends Omit<ComponentProps<'button'>, 'type'> {
    title?: string;
    toolType?: string;
    state: ToolState;
}
export declare const ToolHeader: import("react").ForwardRefExoticComponent<Omit<ToolHeaderProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export interface ToolContentProps extends ComponentProps<'div'> {
    isOpen?: boolean;
    children: ReactNode;
}
export declare const ToolContent: import("react").ForwardRefExoticComponent<Omit<ToolContentProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface ToolInputDisplayProps extends ComponentProps<'div'> {
    input: ToolInput;
}
export declare const ToolInputDisplay: import("react").ForwardRefExoticComponent<Omit<ToolInputDisplayProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface ToolOutputDisplayProps extends ComponentProps<'div'> {
    output?: unknown;
    errorText?: string;
}
export declare const ToolOutputDisplay: import("react").ForwardRefExoticComponent<Omit<ToolOutputDisplayProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface ToolBubbleProps {
    toolName: string;
    state: ToolState | 'pending' | 'result' | 'error';
    args?: ToolInput;
    result?: unknown;
}
export declare function ToolBubble({ toolName, state, args, result }: ToolBubbleProps): import("react/jsx-runtime").JSX.Element;
