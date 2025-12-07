/**
 * PromptInput Component - SOTA Design
 *
 * Modern AI chat input with glassmorphism, micro-interactions.
 * Compound components pattern - NO form element (parent handles form).
 *
 * Design inspired by: Linear, Vercel AI, ChatGPT, Claude
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { Send, Square, Paperclip, Mic, Sparkles, X } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../../dropdown-menu';
import { Button } from '../../button';
export const PromptInput = forwardRef(({ className, isLoading, children, ...props }, ref) => (_jsxs("div", { ref: ref, "data-loading": isLoading, className: cn(
    // Base container
    'relative flex flex-col overflow-hidden', 
    // Glassmorphism
    'rounded-2xl border bg-white/90 backdrop-blur-xl', 'border-neutral-200/80 dark:border-white/10 dark:bg-neutral-900/90', 
    // Shadow & glow
    'shadow-[0_8px_32px_rgba(0,0,0,0.08)]', 'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]', 
    // Focus-within ring
    'ring-0 ring-indigo-500/0 transition-all duration-200', 'focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/30', 'dark:focus-within:border-indigo-400/30 dark:focus-within:ring-indigo-400/20', 
    // Loading state
    'data-[loading=true]:ring-2 data-[loading=true]:ring-indigo-500/20', className), ...props, children: [_jsx("div", { className: cn('absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300', 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20', 'pointer-events-none group-focus-within:opacity-100', '-z-10 blur-xl') }), children] })));
PromptInput.displayName = 'PromptInput';
export const PromptInputBody = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex items-end gap-3 px-4 py-3', className), ...props, children: children })));
PromptInputBody.displayName = 'PromptInputBody';
export const PromptInputTextarea = forwardRef(({ className, placeholder = 'Scrivi un messaggio...', onSubmit, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.();
        }
        onKeyDown?.(e);
    };
    return (_jsx("textarea", { ref: ref, placeholder: placeholder, rows: 1, onKeyDown: handleKeyDown, className: cn(
        // Base
        'w-full flex-1 resize-none bg-transparent', 'text-[15px] leading-relaxed text-neutral-900 dark:text-white', 
        // Placeholder
        'placeholder:text-neutral-400 dark:placeholder:text-neutral-500', 
        // Focus
        'focus:outline-none', 
        // Size constraints
        'max-h-[200px] min-h-[24px]', 
        // Scrollbar styling
        'scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600', className), onInput: (e) => {
            // Auto-resize with smooth feel
            const target = e.target;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
        }, ...props }));
});
PromptInputTextarea.displayName = 'PromptInputTextarea';
export const PromptInputFooter = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex items-center justify-between gap-2', 'border-t border-neutral-100/80 dark:border-white/5', 'px-4 py-2', className), ...props, children: children })));
PromptInputFooter.displayName = 'PromptInputFooter';
export const PromptInputTools = forwardRef(({ className, children, ...props }, ref) => (_jsx("div", { ref: ref, className: cn('flex items-center gap-1', className), ...props, children: children })));
PromptInputTools.displayName = 'PromptInputTools';
export const PromptInputButton = forwardRef(({ variant = 'ghost', size = 'md', className, children, ...props }, ref) => (_jsx("button", { ref: ref, type: "button", className: cn(
    // Base
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150', 'active:scale-95', 
    // Size
    size === 'sm' && 'h-7 px-2 text-xs', size === 'md' && 'h-8 px-2.5 text-sm', 
    // Variants
    variant === 'ghost' &&
        'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white', variant === 'accent' && [
        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
        'hover:from-indigo-600 hover:to-purple-600',
        'shadow-sm shadow-indigo-500/25',
    ], className), ...props, children: children })));
PromptInputButton.displayName = 'PromptInputButton';
export const PromptInputSubmit = forwardRef(({ status = 'ready', disabled, onStop, className, ...props }, ref) => {
    const isStreaming = status === 'streaming';
    const isSubmitted = status === 'submitted';
    const isBusy = isStreaming || isSubmitted;
    const isDisabled = disabled && !isBusy;
    return (_jsxs("button", { ref: ref, type: isBusy ? 'button' : 'submit', disabled: isDisabled, onClick: isBusy ? onStop : undefined, "aria-label": isBusy ? 'Ferma generazione' : 'Invia messaggio', className: cn(
        // Base
        'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', 'transition-all duration-200', 'active:scale-90', 
        // Ready state - Gradient with glow
        !isBusy &&
            !isDisabled &&
            'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 dark:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30', 
        // Disabled state
        isDisabled && [
            'cursor-not-allowed bg-neutral-100 text-neutral-400',
            'dark:bg-neutral-800 dark:text-neutral-600',
        ], 
        // Streaming/Stop state
        isBusy && [
            'bg-red-500/10 text-red-500 ring-1 ring-red-500/20',
            'hover:bg-red-500/20 hover:ring-red-500/30',
            'dark:bg-red-500/20 dark:text-red-400 dark:ring-red-500/30',
        ], className), ...props, children: [!isBusy && !isDisabled && (_jsx("div", { className: "absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 hover:opacity-100" })), _jsx("span", { className: "relative z-10", children: isBusy ? _jsx(Square, { className: "h-4 w-4" }) : _jsx(Send, { className: "h-4 w-4" }) })] }));
});
PromptInputSubmit.displayName = 'PromptInputSubmit';
export const PromptInputAttachButton = forwardRef(({ accept, onFileSelect, className, ...props }, ref) => {
    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept || '*/*';
        input.multiple = true;
        input.onchange = (e) => {
            const files = e.target.files;
            if (files?.length)
                onFileSelect?.(files);
        };
        input.click();
    };
    return (_jsx("button", { ref: ref, type: "button", onClick: handleClick, "aria-label": "Allega file", className: cn('flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150', 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600', 'dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-300', 'active:scale-95', className), ...props, children: _jsx(Paperclip, { className: "h-4 w-4" }) }));
});
PromptInputAttachButton.displayName = 'PromptInputAttachButton';
export const PromptInputVoiceButton = forwardRef(({ isRecording, onToggleRecording, className, ...props }, ref) => (_jsx("button", { ref: ref, type: "button", onClick: onToggleRecording, "aria-label": isRecording ? 'Ferma registrazione' : 'Registra voce', className: cn('flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150', 'active:scale-95', !isRecording &&
        'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-300', isRecording && ['animate-pulse bg-red-500 text-white', 'shadow-lg shadow-red-500/30'], className), ...props, children: _jsx(Mic, { className: "h-4 w-4" }) })));
PromptInputVoiceButton.displayName = 'PromptInputVoiceButton';
export const PromptInputAIMode = forwardRef(({ mode = 'AI Coach', className, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn('flex items-center gap-1.5 rounded-md px-2 py-1', 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10', 'text-xs font-medium text-indigo-600 dark:text-indigo-400', className), ...props, children: [_jsx(Sparkles, { className: "h-3 w-3" }), mode] })));
PromptInputAIMode.displayName = 'PromptInputAIMode';
const PromptInputContext = createContext(null);
export const usePromptInput = () => {
    const ctx = useContext(PromptInputContext);
    if (!ctx)
        throw new Error('PromptInput components must be used within PromptInputProvider');
    return ctx;
};
export function PromptInputProvider({ children }) {
    const [attachments, setAttachments] = useState([]);
    const [accept, setAccept] = useState();
    const [multiple, setMultiple] = useState(undefined);
    const inputRef = useRef(null);
    const addFiles = useCallback((files) => {
        const next = [];
        Array.from(files).forEach((file) => {
            const id = `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`;
            next.push({
                id,
                filename: file.name,
                url: URL.createObjectURL(file),
                mediaType: file.type,
                size: file.size,
                file,
            });
        });
        setAttachments((prev) => [...prev, ...next]);
    }, []);
    const removeAttachment = useCallback((id) => {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
    }, []);
    const triggerFileDialog = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    }, []);
    const setPickerOptions = useCallback(({ accept: nextAccept, multiple: nextMultiple }) => {
        setAccept(nextAccept);
        setMultiple(nextMultiple);
    }, []);
    const ctxValue = useMemo(() => ({
        attachments,
        addFiles,
        removeAttachment,
        accept,
        multiple,
        setPickerOptions,
        triggerFileDialog,
    }), [attachments, addFiles, removeAttachment, accept, multiple, setPickerOptions, triggerFileDialog]);
    return (_jsxs(PromptInputContext.Provider, { value: ctxValue, children: [_jsx("input", { ref: inputRef, type: "file", className: "hidden", accept: accept, multiple: multiple, onChange: (e) => e.target.files && addFiles(e.target.files) }), children] }));
}
export const PromptInputRoot = ({ accept, multiple, ...props }) => {
    const ctx = usePromptInput();
    useEffect(() => {
        ctx.setPickerOptions({ accept, multiple });
    }, [accept, multiple, ctx]);
    return _jsx(PromptInput, { ...props });
};
export const PromptInputActionMenu = DropdownMenu;
export const PromptInputActionMenuTrigger = ({ className }) => (_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { type: "button", variant: "ghost", size: "icon-sm", className: cn('h-8 w-8 rounded-lg', className), "aria-label": "Apri menu allegati", children: _jsx(Paperclip, { className: "h-4 w-4" }) }) }));
export const PromptInputActionMenuContent = DropdownMenuContent;
export const PromptInputActionAddAttachments = ({ label = 'Aggiungi allegato', }) => {
    const ctx = usePromptInput();
    return (_jsx(DropdownMenuItem, { onSelect: () => ctx.triggerFileDialog(), className: "cursor-pointer", children: label }));
};
export const PromptInputAttachments = ({ children, }) => {
    const { attachments } = usePromptInput();
    if (!attachments.length)
        return null;
    return (_jsx("div", { className: "flex flex-wrap gap-2 px-4 pt-3", children: attachments.map((a) => children(a)) }));
};
export const PromptInputAttachment = ({ data }) => {
    const { removeAttachment } = usePromptInput();
    return (_jsxs("div", { className: "group relative flex items-center gap-2 rounded-lg border border-neutral-200 bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80", children: [_jsx("span", { className: "truncate", children: data.filename }), _jsx("button", { type: "button", onClick: () => removeAttachment(data.id), className: "opacity-0 transition-opacity group-hover:opacity-100", "aria-label": "Rimuovi allegato", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] }));
};
export const PromptInputSpeechButton = ({ className }) => (_jsxs(Button, { variant: "ghost", size: "icon-sm", className: cn('h-8 w-8 rounded-lg', className), type: "button", children: [_jsx(Mic, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Speech" })] }));
// Aliases for backwards compatibility
export const PromptInputProviderRoot = PromptInputProvider;
