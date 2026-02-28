/**
 * PromptInput Component - SOTA Design
 *
 * Modern AI chat input with glassmorphism, micro-interactions.
 * Compound components pattern - NO form element (parent handles form).
 *
 * Design inspired by: Linear, Vercel AI, ChatGPT, Claude
 */

'use client';

import {
  forwardRef,
  type ComponentProps,
  type ReactNode,
  type KeyboardEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Send, Square, Paperclip, Mic, Sparkles, X } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../dropdown-menu';
import { Button } from '../../../button';

// ============================================================================
// PromptInput Container - DIV not FORM (parent controls form submission)
// ============================================================================

export interface PromptInputProps extends ComponentProps<'div'> {
  /** Whether input is in loading/streaming state */
  isLoading?: boolean;
  children: ReactNode;
}

export const PromptInput = forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, isLoading, children, ...props }, ref) => (
    <div
      ref={ref}
      data-loading={isLoading}
      className={cn(
        // Base container
        'relative flex flex-col overflow-hidden',
        // Glassmorphism
        'rounded-2xl border bg-white/90 backdrop-blur-xl',
        'border-neutral-200/80 dark:border-white/10 dark:bg-neutral-900/90',
        // Shadow & glow
        'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        // Focus-within ring
        'ring-0 ring-indigo-500/0 transition-all duration-200',
        'focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/30',
        'dark:focus-within:border-indigo-400/30 dark:focus-within:ring-indigo-400/20',
        // Loading state
        'data-[loading=true]:ring-2 data-[loading=true]:ring-indigo-500/20',
        className
      )}
      {...props}
    >
      {/* Animated gradient border on focus */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
          'bg-gradient-to-r from-indigo-500/20 via-secondary-500/20 to-secondary-500/20',
          'pointer-events-none group-focus-within:opacity-100',
          '-z-10 blur-xl'
        )}
      />
      {children}
    </div>
  )
);
PromptInput.displayName = 'PromptInput';

// ============================================================================
// PromptInput Body
// ============================================================================

export interface PromptInputBodyProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const PromptInputBody = forwardRef<HTMLDivElement, PromptInputBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-end gap-3 px-4 py-3', className)} {...props}>
      {children}
    </div>
  )
);
PromptInputBody.displayName = 'PromptInputBody';

// ============================================================================
// PromptInput Textarea - Auto-resizing with smooth animations
// ============================================================================

export interface PromptInputTextareaProps extends ComponentProps<'textarea'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
}

export const PromptInputTextarea = forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, placeholder = 'Scrivi un messaggio...', onSubmit, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.();
      }
      onKeyDown?.(e);
    };

    return (
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={1}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base
          'w-full flex-1 resize-none bg-transparent',
          'text-[15px] leading-relaxed text-neutral-900 dark:text-white',
          // Placeholder
          'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
          // Focus
          'focus:outline-none',
          // Size constraints
          'max-h-[200px] min-h-[24px]',
          // Scrollbar styling
          'scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600',
          className
        )}
        onInput={(e) => {
          // Auto-resize with smooth feel
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
        }}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = 'PromptInputTextarea';

// ============================================================================
// PromptInput Footer (optional toolbar)
// ============================================================================

export interface PromptInputFooterProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const PromptInputFooter = forwardRef<HTMLDivElement, PromptInputFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between gap-2',
        'border-t border-neutral-100/80 dark:border-white/5',
        'px-4 py-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
PromptInputFooter.displayName = 'PromptInputFooter';

// ============================================================================
// PromptInput Tools (toolbar buttons container)
// ============================================================================

export interface PromptInputToolsProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const PromptInputTools = forwardRef<HTMLDivElement, PromptInputToolsProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
      {children}
    </div>
  )
);
PromptInputTools.displayName = 'PromptInputTools';

// ============================================================================
// PromptInput Tool Button
// ============================================================================

export interface PromptInputButtonProps extends ComponentProps<'button'> {
  variant?: 'ghost' | 'accent';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export const PromptInputButton = forwardRef<HTMLButtonElement, PromptInputButtonProps>(
  ({ variant = 'ghost', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        // Base
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150',
        'active:scale-95',
        // Size
        size === 'sm' && 'h-7 px-2 text-xs',
        size === 'md' && 'h-8 px-2.5 text-sm',
        // Variants
        variant === 'ghost' &&
          'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white',
        variant === 'accent' && [
          'bg-gradient-to-r from-indigo-500 to-secondary-500 text-white',
          'hover:from-indigo-600 hover:to-secondary-600',
          'shadow-sm shadow-indigo-500/25',
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
PromptInputButton.displayName = 'PromptInputButton';

// ============================================================================
// PromptInput Submit Button - SOTA Design
// ============================================================================

export type PromptInputStatus = 'ready' | 'streaming' | 'submitted';

export interface PromptInputSubmitProps extends Omit<
  ComponentProps<'button'>,
  'type' | 'children'
> {
  status?: PromptInputStatus;
  onStop?: () => void;
}

export const PromptInputSubmit = forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ status = 'ready', disabled, onStop, className, ...props }, ref) => {
    const isStreaming = status === 'streaming';
    const isSubmitted = status === 'submitted';
    const isBusy = isStreaming || isSubmitted;
    const isDisabled = disabled && !isBusy;

    return (
      <button
        ref={ref}
        type={isBusy ? 'button' : 'submit'}
        disabled={isDisabled}
        onClick={isBusy ? onStop : undefined}
        aria-label={isBusy ? 'Ferma generazione' : 'Invia messaggio'}
        className={cn(
          // Base
          'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          'transition-all duration-200',
          'active:scale-90',
          // Ready state - Gradient with glow
          !isBusy &&
            !isDisabled &&
            'bg-gradient-to-br from-indigo-500 via-indigo-600 to-secondary-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 dark:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30',
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
          ],
          className
        )}
        {...props}
      >
        {/* Animated background gradient */}
        {!isBusy && !isDisabled && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400 via-secondary-500 to-secondary-500 opacity-0 transition-opacity duration-300 hover:opacity-100" />
        )}

        {/* Icon */}
        <span className="relative z-10">
          {isBusy ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </span>
      </button>
    );
  }
);
PromptInputSubmit.displayName = 'PromptInputSubmit';

// ============================================================================
// PromptInput Attachment Button
// ============================================================================

export interface PromptInputAttachButtonProps extends Omit<ComponentProps<'button'>, 'type'> {
  accept?: string;
  onFileSelect?: (files: FileList) => void;
}

export const PromptInputAttachButton = forwardRef<HTMLButtonElement, PromptInputAttachButtonProps>(
  ({ accept, onFileSelect, className, ...props }, ref) => {
    const handleClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept || '*/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files?.length) onFileSelect?.(files);
      };
      input.click();
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-label="Allega file"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150',
          'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600',
          'dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-300',
          'active:scale-95',
          className
        )}
        {...props}
      >
        <Paperclip className="h-4 w-4" />
      </button>
    );
  }
);
PromptInputAttachButton.displayName = 'PromptInputAttachButton';

// ============================================================================
// PromptInput Voice Button
// ============================================================================

export interface PromptInputVoiceButtonProps extends Omit<ComponentProps<'button'>, 'type'> {
  isRecording?: boolean;
  onToggleRecording?: () => void;
}

export const PromptInputVoiceButton = forwardRef<HTMLButtonElement, PromptInputVoiceButtonProps>(
  ({ isRecording, onToggleRecording, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onToggleRecording}
      aria-label={isRecording ? 'Ferma registrazione' : 'Registra voce'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150',
        'active:scale-95',
        !isRecording &&
          'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-300',
        isRecording && ['animate-pulse bg-red-500 text-white', 'shadow-lg shadow-red-500/30'],
        className
      )}
      {...props}
    >
      <Mic className="h-4 w-4" />
    </button>
  )
);
PromptInputVoiceButton.displayName = 'PromptInputVoiceButton';

// ============================================================================
// PromptInput AI Mode Indicator
// ============================================================================

export interface PromptInputAIModeProps extends ComponentProps<'div'> {
  mode?: string;
}

export const PromptInputAIMode = forwardRef<HTMLDivElement, PromptInputAIModeProps>(
  ({ mode = 'AI Coach', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-1',
        'bg-gradient-to-r from-indigo-500/10 to-secondary-500/10',
        'text-xs font-medium text-indigo-600 dark:text-indigo-400',
        className
      )}
      {...props}
    >
      <Sparkles className="h-3 w-3" />
      {mode}
    </div>
  )
);
PromptInputAIMode.displayName = 'PromptInputAIMode';

// ============================================================================
// PromptInput Attachments + Actions (context-based)
// ============================================================================

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
  setPickerOptions: (opts: { accept?: string; multiple?: boolean }) => void;
  triggerFileDialog: () => void;
};

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

export const usePromptInput = () => {
  const ctx = useContext(PromptInputContext);
  if (!ctx) throw new Error('PromptInput components must be used within PromptInputProvider');
  return ctx;
};

export function PromptInputProvider({ children }: { children: React.ReactNode }) {
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [accept, setAccept] = useState<string | undefined>();
  const [multiple, setMultiple] = useState<boolean | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList) => {
    const next: PromptAttachment[] = [];
    Array.from(files).forEach((file: File) => {
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

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a: PromptAttachment) => a.id !== id));
  }, []);

  const triggerFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  }, []);

  const setPickerOptions = useCallback(
    ({ accept: nextAccept, multiple: nextMultiple }: { accept?: string; multiple?: boolean }) => {
      setAccept(nextAccept);
      setMultiple(nextMultiple);
    },
    []
  );

  const ctxValue = useMemo(
    () => ({
      attachments,
      addFiles,
      removeAttachment,
      accept,
      multiple,
      setPickerOptions,
      triggerFileDialog,
    }),
    [attachments, addFiles, removeAttachment, accept, multiple, setPickerOptions, triggerFileDialog]
  );

  return (
    <PromptInputContext.Provider value={ctxValue}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.files && addFiles(e.target.files)
        }
      />
      {children}
    </PromptInputContext.Provider>
  );
}

// Sync accept/multiple with provider (optional)
export type PromptInputRootProps = PromptInputProps & {
  accept?: string;
  multiple?: boolean;
};

export const PromptInputRoot = ({ accept, multiple, ...props }: PromptInputRootProps) => {
  const ctx = usePromptInput();
  useEffect(() => {
    ctx.setPickerOptions({ accept, multiple });
  }, [accept, multiple, ctx]);
  return <PromptInput {...props} />;
};

export const PromptInputActionMenu = DropdownMenu;

export const PromptInputActionMenuTrigger = ({ className }: { className?: string }) => (
  <DropdownMenuTrigger asChild>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn('h-8 w-8 rounded-lg', className)}
      aria-label="Apri menu allegati"
      suppressHydrationWarning
    >
      <Paperclip className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
);

export const PromptInputActionMenuContent = DropdownMenuContent;

export const PromptInputActionAddAttachments = ({
  label = 'Aggiungi allegato',
}: {
  label?: string;
}) => {
  const ctx = usePromptInput();
  return (
    <DropdownMenuItem onSelect={() => ctx.triggerFileDialog()} className="cursor-pointer">
      {label}
    </DropdownMenuItem>
  );
};

export const PromptInputAttachments = ({
  children,
}: {
  children: (attachment: PromptAttachment) => React.ReactNode;
}) => {
  const { attachments } = usePromptInput();
  if (!attachments.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3">
      {attachments.map((a: PromptAttachment) => children(a))}
    </div>
  );
};

export const PromptInputAttachment = ({ data }: { data: PromptAttachment }) => {
  const { removeAttachment } = usePromptInput();
  return (
    <div className="group relative flex items-center gap-2 rounded-lg border border-neutral-200 bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur dark:border-white/[0.08] dark:bg-neutral-900/80">
      <span className="truncate">{data.filename}</span>
      <button
        type="button"
        onClick={() => removeAttachment(data.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Rimuovi allegato"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const PromptInputSpeechButton = ({ className }: { className?: string }) => (
  <Button
    variant="ghost"
    size="icon-sm"
    className={cn('h-8 w-8 rounded-lg', className)}
    type="button"
  >
    <Mic className="h-4 w-4" />
    <span className="sr-only">Speech</span>
  </Button>
);

// Aliases for backwards compatibility
export const PromptInputProviderRoot = PromptInputProvider;
