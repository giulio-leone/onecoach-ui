/**
 * Conversation Component
 *
 * Container per la lista messaggi con scroll automatico.
 * Ispirato ad AI Elements Conversation.
 */
import React, { type ReactNode } from 'react';
export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
export declare const Conversation: React.ForwardRefExoticComponent<ConversationProps & React.RefAttributes<HTMLDivElement>>;
export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
export declare const ConversationContent: React.ForwardRefExoticComponent<ConversationContentProps & React.RefAttributes<HTMLDivElement>>;
export interface ConversationEmptyStateProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    className?: string;
}
export declare function ConversationEmptyState({ icon, title, description, className, }: ConversationEmptyStateProps): import("react/jsx-runtime").JSX.Element;
export interface ConversationScrollButtonProps {
    onClick?: () => void;
    show?: boolean;
    className?: string;
}
export declare function ConversationScrollButton({ onClick, show, className, }: ConversationScrollButtonProps): import("react/jsx-runtime").JSX.Element | null;
