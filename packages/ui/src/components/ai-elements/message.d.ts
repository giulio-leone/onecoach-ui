/**
 * Message Component
 *
 * Bolla messaggio con supporto completo per AI SDK v6 parts[].
 * Renderizza text, tool-invocation, reasoning, source-url.
 */
import { type ReactNode, type ComponentProps } from 'react';
import { motion } from 'framer-motion';
export type MessageRole = 'user' | 'assistant' | 'system';
export interface MessageProps extends ComponentProps<typeof motion.div> {
    /** Ruolo: user o assistant */
    from: MessageRole;
    children: ReactNode;
}
export declare const Message: import("react").ForwardRefExoticComponent<Omit<MessageProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface MessageContentProps extends ComponentProps<'div'> {
    children: ReactNode;
}
export declare const MessageContent: import("react").ForwardRefExoticComponent<Omit<MessageContentProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface MessageResponseProps extends ComponentProps<'div'> {
    children: string;
}
export declare const MessageResponse: import("react").ForwardRefExoticComponent<Omit<MessageResponseProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface MessageActionsProps extends ComponentProps<'div'> {
    children: ReactNode;
}
export declare const MessageActions: import("react").ForwardRefExoticComponent<Omit<MessageActionsProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface MessageActionProps extends ComponentProps<'button'> {
    label?: string;
    children: ReactNode;
}
export declare const MessageAction: import("react").ForwardRefExoticComponent<Omit<MessageActionProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=message.d.ts.map