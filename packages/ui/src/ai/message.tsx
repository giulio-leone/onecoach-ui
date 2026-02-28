'use client';
import NextImage from 'next/image';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@giulio-leone/ui';
import type { FileUIPart } from './ai-types';
// import type { UIMessage } from 'ai';
import { ChevronLeftIcon, ChevronRightIcon, PaperclipIcon, XIcon } from 'lucide-react';
import type { ComponentProps, HTMLAttributes, ReactElement } from 'react';
import { createContext, memo, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { Streamdown } from 'streamdown';

type MessageRole = 'function' | 'data' | 'system' | 'user' | 'assistant' | 'tool';

/**
 * Message Component - AI Elements v6
 *
 * Glassmorphism-enabled message bubbles with premium visual effects,
 * smooth animations, and responsive design.
 *
 * @see https://v6.ai-sdk.dev/elements/components/message
 */
export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: MessageRole;
};
export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      // Layout
      'group flex w-full max-w-[85%] flex-col gap-2',
      // Responsive max-width
      'sm:max-w-[80%] lg:max-w-[75%]',
      // Role-based alignment
      from === 'user' ? 'is-user ml-auto items-end' : 'is-assistant items-start',
      // Animation
      'animate-in fade-in-0 duration-300',
      from === 'user' ? 'slide-in-from-right-4' : 'slide-in-from-left-4',
      className
    )}
    {...props}
  />
);
export type MessageContentProps = HTMLAttributes<HTMLDivElement>;
export const MessageContent = ({ children, className, ...props }: MessageContentProps) => (
  <div
    className={cn(
      // Base styles
      'relative w-fit max-w-full overflow-hidden text-sm',
      // Glassmorphism for user messages
      'group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-md',
      'group-[.is-user]:from-primary-500 group-[.is-user]:to-primary-600 group-[.is-user]:bg-gradient-to-br',
      'group-[.is-user]:px-4 group-[.is-user]:py-3',
      'group-[.is-user]:text-white',
      'group-[.is-user]:shadow-primary-500/20 group-[.is-user]:shadow-lg',
      // Assistant styles - glassmorphism
      'group-[.is-assistant]:rounded-2xl group-[.is-assistant]:rounded-bl-md',
      'group-[.is-assistant]:bg-white/70 group-[.is-assistant]:dark:bg-white/[0.06]',
      'group-[.is-assistant]:backdrop-blur-sm',
      'group-[.is-assistant]:border group-[.is-assistant]:border-neutral-200/50',
      'group-[.is-assistant]:dark:border-white/[0.08]',
      'group-[.is-assistant]:px-4 group-[.is-assistant]:py-3',
      'group-[.is-assistant]:text-neutral-900 group-[.is-assistant]:dark:text-neutral-100',
      'group-[.is-assistant]:shadow-md group-[.is-assistant]:shadow-neutral-900/5',
      'group-[.is-assistant]:dark:shadow-neutral-900/20',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
export type MessageActionsProps = ComponentProps<'div'>;
export const MessageActions = ({ className, children, ...props }: MessageActionsProps) => (
  <div
    className={cn(
      'flex items-center gap-1 pt-1',
      // Visibility animation
      'opacity-0 transition-opacity duration-200 group-hover:opacity-100',
      'focus-within:opacity-100',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
export type MessageActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};
export const MessageAction = ({
  tooltip,
  children,
  label,
  variant = 'ghost',
  size = 'icon-sm',
  className,
  ...props
}: MessageActionProps) => {
  const button = (
    <Button
      size={size}
      type="button"
      variant={variant}
      className={cn(
        // Size
        'size-7',
        // Hover effects
        'hover:bg-neutral-100 dark:hover:bg-white/[0.06]',
        // Focus
        'focus-visible:ring-primary-500 focus-visible:ring-2',
        className
      )}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  );
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return button;
};
MessageAction.displayName = 'MessageAction';
MessageActions.displayName = 'MessageActions';
// Branch context for managing multiple response versions
type MessageBranchContextType = {
  currentBranch: number;
  totalBranches: number;
  goToPrevious: () => void;
  goToNext: () => void;
  branches: ReactElement[];
  setBranches: (branches: ReactElement[]) => void;
};
const MessageBranchContext = createContext<MessageBranchContextType | null>(null);
const useMessageBranch = () => {
  const context = useContext(MessageBranchContext);
  if (!context) {
    throw new Error('MessageBranch components must be used within MessageBranch');
  }
  return context;
};
export type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
};
export const MessageBranch = ({
  defaultBranch = 0,
  onBranchChange,
  className,
  ...props
}: MessageBranchProps) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);
  const [branches, setBranches] = useState<ReactElement[]>([]);
  const handleBranchChange = (newBranch: number) => {
    setCurrentBranch(newBranch);
    onBranchChange?.(newBranch);
  };
  const goToPrevious = () => {
    const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
    handleBranchChange(newBranch);
  };
  const goToNext = () => {
    const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
    handleBranchChange(newBranch);
  };
  const contextValue: MessageBranchContextType = {
    currentBranch,
    totalBranches: branches.length,
    goToPrevious,
    goToNext,
    branches,
    setBranches,
  };
  return (
    <MessageBranchContext.Provider value={contextValue}>
      <div className={cn('grid w-full gap-2 [&>div]:pb-0', className)} {...props} />
    </MessageBranchContext.Provider>
  );
};
export type MessageBranchContentProps = HTMLAttributes<HTMLDivElement>;
export const MessageBranchContent = ({ children, ...props }: MessageBranchContentProps) => {
  const { currentBranch, setBranches, branches } = useMessageBranch();
  const childrenArray = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children]
  );
  useLayoutEffect(() => {
    if (branches.length !== childrenArray.length) {
      setBranches(childrenArray);
    }
  }, [childrenArray, branches, setBranches]);
  return childrenArray.map((branch, index) => (
    <div
      className={cn(
        'grid gap-2 overflow-hidden [&>div]:pb-0',
        'transition-opacity duration-200',
        index === currentBranch ? 'block opacity-100' : 'hidden opacity-0'
      )}
      key={branch.key}
      {...props}
    >
      {branch}
    </div>
  ));
};
export type MessageBranchSelectorProps = HTMLAttributes<HTMLDivElement> & {
  from: MessageRole;
};
export const MessageBranchSelector = ({
  className,
  from: _from,
  ...props
}: MessageBranchSelectorProps) => {
  const { totalBranches } = useMessageBranch();
  if (totalBranches <= 1) return null;
  return (
    <ButtonGroup
      className={cn(
        '[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md',
        className
      )}
      orientation="horizontal"
      {...props}
    />
  );
};
export type MessageBranchPreviousProps = ComponentProps<typeof Button>;
export const MessageBranchPrevious = ({ children, ...props }: MessageBranchPreviousProps) => {
  const { goToPrevious, totalBranches } = useMessageBranch();
  return (
    <Button
      aria-label="Versione precedente"
      disabled={totalBranches <= 1}
      onClick={goToPrevious}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronLeftIcon size={14} />}
    </Button>
  );
};
export type MessageBranchNextProps = ComponentProps<typeof Button>;
export const MessageBranchNext = ({ children, ...props }: MessageBranchNextProps) => {
  const { goToNext, totalBranches } = useMessageBranch();
  return (
    <Button
      aria-label="Versione successiva"
      disabled={totalBranches <= 1}
      onClick={goToNext}
      size="icon-sm"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronRightIcon size={14} />}
    </Button>
  );
};
export type MessageBranchPageProps = HTMLAttributes<HTMLSpanElement>;
export const MessageBranchPage = ({ className, ...props }: MessageBranchPageProps) => {
  const { currentBranch, totalBranches } = useMessageBranch();
  return (
    <ButtonGroupText
      className={cn('text-muted-foreground border-none bg-transparent shadow-none', className)}
      {...props}
    >
      {currentBranch + 1} di {totalBranches}
    </ButtonGroupText>
  );
};
export type MessageResponseProps = ComponentProps<typeof Streamdown>;
export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown
      className={cn(
        // Base
        'size-full',
        // Typography
        'prose prose-sm max-w-none',
        'dark:prose-invert',
        // Code blocks
        'prose-pre:bg-neutral-100 prose-pre:dark:bg-zinc-950',
        'prose-pre:border prose-pre:border-neutral-200/50 prose-pre:dark:border-white/[0.08]',
        'prose-pre:rounded-lg',
        // Links
        'prose-a:text-primary-600 prose-a:dark:text-primary-400',
        'prose-a:no-underline hover:prose-a:underline',
        // Lists
        'prose-li:marker:text-neutral-400',
        // Margins
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
MessageResponse.displayName = 'MessageResponse';
export type MessageAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: FileUIPart;
  className?: string;
  onRemove?: () => void;
};
export function MessageAttachment({
  data, className, onRemove, ...props }: MessageAttachmentProps) {
  const filename = data.filename || '';
  const mediaType = data.mediaType?.startsWith('image/') && data.url ? 'image' : 'file';
  const isImage = mediaType === 'image';
  const attachmentLabel = filename || (isImage ? 'Immagine' : 'Allegato');
  return (
    <div
      className={cn(
        'group/attachment relative size-20 overflow-hidden rounded-xl',
        'ring-1 ring-neutral-200/50 dark:ring-neutral-700/50',
        'transition-all duration-200',
        'hover:ring-primary-500/50 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {isImage ? (
        <>
          <NextImage
            alt={filename || 'allegato'}
            className="size-full object-cover"
            fill
            src={data.url}
            unoptimized
          />
          {onRemove && (
            <Button
              aria-label="Rimuovi allegato"
              className={cn(
                'absolute top-1 right-1 size-6 rounded-full p-0',
                'bg-neutral-900/60 text-white backdrop-blur-sm',
                'opacity-0 transition-opacity group-hover/attachment:opacity-100',
                'hover:bg-neutral-900/80'
              )}
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                e.stopPropagation();
                onRemove();
              }}
              type="button"
              variant="ghost"
            >
              <XIcon className="size-3" />
            </Button>
          )}
        </>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex size-full items-center justify-center bg-neutral-100 dark:bg-white/[0.04]">
                <PaperclipIcon className="size-5 text-neutral-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{attachmentLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
export type MessageAttachmentsProps = ComponentProps<'div'>;
export function MessageAttachments({ children, className, ...props }: MessageAttachmentsProps) {
  if (!children) return null;
  return (
    <div className={cn('ml-auto flex w-fit flex-wrap items-start gap-2', className)} {...props}>
      {children}
    </div>
  );
}
export type MessageToolbarProps = ComponentProps<'div'>;
export const MessageToolbar = ({ className, children, ...props }: MessageToolbarProps) => (
  <div className={cn('mt-4 flex w-full items-center justify-between gap-4', className)} {...props}>
    {children}
  </div>
);
