/**
 * PromptInput Component - SOTA Design
 *
 * Modern AI chat input with glassmorphism, micro-interactions.
 * Compound components pattern - NO form element (parent handles form).
 *
 * Design inspired by: Linear, Vercel AI, ChatGPT, Claude
 */
import { type ComponentProps, type ReactNode } from 'react';
import { DropdownMenu, DropdownMenuContent } from '../../dropdown-menu';
export interface PromptInputProps extends ComponentProps<'div'> {
    /** Whether input is in loading/streaming state */
    isLoading?: boolean;
    children: ReactNode;
}
export declare const PromptInput: import("react").ForwardRefExoticComponent<Omit<PromptInputProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface PromptInputBodyProps extends ComponentProps<'div'> {
    children: ReactNode;
}
export declare const PromptInputBody: import("react").ForwardRefExoticComponent<Omit<PromptInputBodyProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface PromptInputTextareaProps extends ComponentProps<'textarea'> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit?: () => void;
}
export declare const PromptInputTextarea: import("react").ForwardRefExoticComponent<Omit<PromptInputTextareaProps, "ref"> & import("react").RefAttributes<HTMLTextAreaElement>>;
export interface PromptInputFooterProps extends ComponentProps<'div'> {
    children: ReactNode;
}
export declare const PromptInputFooter: import("react").ForwardRefExoticComponent<Omit<PromptInputFooterProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface PromptInputToolsProps extends ComponentProps<'div'> {
    children: ReactNode;
}
export declare const PromptInputTools: import("react").ForwardRefExoticComponent<Omit<PromptInputToolsProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export interface PromptInputButtonProps extends ComponentProps<'button'> {
    variant?: 'ghost' | 'accent';
    size?: 'sm' | 'md';
    children: ReactNode;
}
export declare const PromptInputButton: import("react").ForwardRefExoticComponent<Omit<PromptInputButtonProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export type PromptInputStatus = 'ready' | 'streaming' | 'submitted';
export interface PromptInputSubmitProps extends Omit<ComponentProps<'button'>, 'type' | 'children'> {
    status?: PromptInputStatus;
    onStop?: () => void;
}
export declare const PromptInputSubmit: import("react").ForwardRefExoticComponent<Omit<PromptInputSubmitProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export interface PromptInputAttachButtonProps extends Omit<ComponentProps<'button'>, 'type'> {
    accept?: string;
    onFileSelect?: (files: FileList) => void;
}
export declare const PromptInputAttachButton: import("react").ForwardRefExoticComponent<Omit<PromptInputAttachButtonProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export interface PromptInputVoiceButtonProps extends Omit<ComponentProps<'button'>, 'type'> {
    isRecording?: boolean;
    onToggleRecording?: () => void;
}
export declare const PromptInputVoiceButton: import("react").ForwardRefExoticComponent<Omit<PromptInputVoiceButtonProps, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export interface PromptInputAIModeProps extends ComponentProps<'div'> {
    mode?: string;
}
export declare const PromptInputAIMode: import("react").ForwardRefExoticComponent<Omit<PromptInputAIModeProps, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export type PromptAttachment = {
    id: string;
    filename: string;
    url: string;
    mediaType?: string;
    size?: number;
    file?: File;
};
type PromptInputContextValue = {
    attachments: PromptAttachment[];
    addFiles: (files: FileList) => void;
    removeAttachment: (id: string) => void;
    accept?: string;
    multiple?: boolean;
    setPickerOptions: (opts: {
        accept?: string;
        multiple?: boolean;
    }) => void;
    triggerFileDialog: () => void;
};
export declare const usePromptInput: () => PromptInputContextValue;
export declare function PromptInputProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export type PromptInputRootProps = PromptInputProps & {
    accept?: string;
    multiple?: boolean;
};
export declare const PromptInputRoot: ({ accept, multiple, ...props }: PromptInputRootProps) => import("react/jsx-runtime").JSX.Element;
export declare const PromptInputActionMenu: typeof DropdownMenu;
export declare const PromptInputActionMenuTrigger: ({ className }: {
    className?: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const PromptInputActionMenuContent: typeof DropdownMenuContent;
export declare const PromptInputActionAddAttachments: ({ label, }: {
    label?: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const PromptInputAttachments: ({ children, }: {
    children: (attachment: PromptAttachment) => React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element | null;
export declare const PromptInputAttachment: ({ data }: {
    data: PromptAttachment;
}) => import("react/jsx-runtime").JSX.Element;
export declare const PromptInputSpeechButton: ({ className }: {
    className?: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const PromptInputProviderRoot: typeof PromptInputProvider;
export {};
//# sourceMappingURL=prompt-input.d.ts.map