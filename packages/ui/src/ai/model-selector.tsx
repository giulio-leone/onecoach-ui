'use client';

import NextImage from 'next/image';
import { cn } from '@giulio-leone/lib-design-system';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '../command';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../dialog';
import { CheckIcon, ChevronDownIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

/**
 * ModelSelector Component - AI Elements v6
 *
 * Admin-only AI model selection dialog with glassmorphism styling,
 * provider logos, and capability indicators.
 *
 * Access controlled by AIChatFeatureConfig (MODEL_SELECTOR feature).
 *
 * @see https://v6.ai-sdk.dev/elements/components/model-selector
 */

export type ModelSelectorProps = ComponentProps<typeof Dialog>;

export const ModelSelector = (props: ModelSelectorProps) => <Dialog {...props} />;

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger> & {
  modelName?: string;
  providerName?: string;
};

export const ModelSelectorTrigger = ({
  className,
  modelName,
  providerName,
  children,
  ...props
}: ModelSelectorTriggerProps) => (
  <DialogTrigger
    className={cn(
      // Base
      'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
      // Glassmorphism
      'bg-white/60 dark:bg-neutral-800/60',
      'backdrop-blur-sm',
      'border border-neutral-200/50 dark:border-neutral-700/50',
      // Text
      'text-neutral-700 dark:text-neutral-300',
      // Hover
      'hover:bg-white/80 hover:dark:bg-neutral-800/80',
      'hover:border-primary-300 hover:dark:border-primary-700',
      // Focus
      'focus-visible:ring-primary-500/50 focus-visible:ring-2 focus-visible:outline-none',
      // Transition
      'transition-all duration-200',
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        <SparklesIcon className="text-primary-500 size-4 shrink-0" />
        <span className="flex-1 truncate text-left">
          {/* Mobile: show "AI", Desktop: show full model name */}
          <span className="sm:hidden">AI</span>
          <span className="hidden sm:inline">{modelName || 'Seleziona modello'}</span>
          {providerName && (
            <span className="ml-1 hidden text-neutral-400 sm:inline dark:text-neutral-500">
              · {providerName}
            </span>
          )}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
      </>
    )}
  </DialogTrigger>
);

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const ModelSelectorContent = ({
  className,
  children,
  title = 'Seleziona Modello AI',
  ...props
}: ModelSelectorContentProps) => (
  <DialogContent
    className={cn(
      'overflow-hidden p-0',
      // Glassmorphism
      'bg-white/95 dark:bg-neutral-900/95',
      'backdrop-blur-xl',
      'border border-neutral-200/50 dark:border-neutral-700/50',
      'shadow-2xl',
      className
    )}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">{children}</Command>
  </DialogContent>
);

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog {...props} />
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = ({
  className,
  placeholder = 'Cerca modelli...',
  ...props
}: ModelSelectorInputProps) => (
  <CommandInput
    className={cn(
      'h-auto px-4 py-4',
      'text-base',
      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
      className
    )}
    placeholder={placeholder}
    {...props}
  />
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = ({ className, ...props }: ModelSelectorListProps) => (
  <CommandList className={cn('max-h-[400px] overflow-y-auto', className)} {...props} />
);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = ({ className, children, ...props }: ModelSelectorEmptyProps) => (
  <CommandEmpty className={cn('py-8 text-center text-neutral-500', className)} {...props}>
    {children ?? 'Nessun modello trovato.'}
  </CommandEmpty>
);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = ({ className, ...props }: ModelSelectorGroupProps) => (
  <CommandGroup
    className={cn(
      '[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2',
      '[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold',
      '[&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:uppercase',
      '[&_[cmdk-group-heading]]:text-neutral-500 dark:[&_[cmdk-group-heading]]:text-neutral-400',
      className
    )}
    {...props}
  />
);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem> & {
  isSelected?: boolean;
  isFast?: boolean;
};

export const ModelSelectorItem = ({
  className,
  children,
  isSelected,
  isFast,
  ...props
}: ModelSelectorItemProps) => (
  <CommandItem
    className={cn(
      // Base
      'mx-2 cursor-pointer rounded-lg px-3 py-3',
      // Hover
      'aria-selected:bg-primary-50 dark:aria-selected:bg-primary-900/30',
      // Selected state
      isSelected && 'bg-primary-50/50 dark:bg-primary-900/20',
      className
    )}
    {...props}
  >
    {children}
    <div className="ml-auto flex items-center gap-2">
      {isFast && (
        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <ZapIcon className="size-3" />
          Veloce
        </span>
      )}
      {isSelected && <CheckIcon className="text-primary-500 size-4" />}
    </div>
  </CommandItem>
);

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = ({ className, ...props }: ModelSelectorShortcutProps) => (
  <CommandShortcut className={cn('text-neutral-400', className)} {...props} />
);

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ModelSelectorSeparator = ({ className, ...props }: ModelSelectorSeparatorProps) => (
  <CommandSeparator className={cn('my-2', className)} {...props} />
);

export type ModelSelectorLogoProps = Omit<ComponentProps<'img'>, 'src' | 'alt'> & {
  provider:
    | 'moonshotai-cn'
    | 'lucidquery'
    | 'moonshotai'
    | 'zai-coding-plan'
    | 'alibaba'
    | 'xai'
    | 'vultr'
    | 'nvidia'
    | 'upstage'
    | 'groq'
    | 'github-copilot'
    | 'mistral'
    | 'vercel'
    | 'nebius'
    | 'deepseek'
    | 'alibaba-cn'
    | 'google-vertex-anthropic'
    | 'venice'
    | 'chutes'
    | 'cortecs'
    | 'github-models'
    | 'togetherai'
    | 'azure'
    | 'baseten'
    | 'huggingface'
    | 'opencode'
    | 'fastrouter'
    | 'google'
    | 'google-vertex'
    | 'cloudflare-workers-ai'
    | 'inception'
    | 'wandb'
    | 'openai'
    | 'zhipuai-coding-plan'
    | 'perplexity'
    | 'openrouter'
    | 'zenmux'
    | 'v0'
    | 'iflowcn'
    | 'synthetic'
    | 'deepinfra'
    | 'zhipuai'
    | 'submodel'
    | 'zai'
    | 'inference'
    | 'requesty'
    | 'morph'
    | 'lmstudio'
    | 'anthropic'
    | 'aihubmix'
    | 'fireworks-ai'
    | 'modelscope'
    | 'llama'
    | 'scaleway'
    | 'amazon-bedrock'
    | 'cerebras'
    | (string & {});
};

export const ModelSelectorLogo = ({ provider, className, ...props }: ModelSelectorLogoProps) => (
  <NextImage
    {...props}
    alt={`${provider} logo`}
    className={cn(
      'size-5 rounded-md p-0.5',
      'bg-white dark:bg-neutral-800',
      'ring-1 ring-neutral-200/50 dark:ring-neutral-700/50',
      className
    )}
    height={20}
    src={`https://models.dev/logos/${provider}.svg`}
    width={20}
  />
);

export type ModelSelectorLogoGroupProps = ComponentProps<'div'>;

export const ModelSelectorLogoGroup = ({ className, ...props }: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      'flex shrink-0 items-center -space-x-1.5',
      '[&>img]:ring-2 [&>img]:ring-white dark:[&>img]:ring-neutral-900',
      className
    )}
    {...props}
  />
);

export type ModelSelectorNameProps = ComponentProps<'span'>;

export const ModelSelectorName = ({ className, ...props }: ModelSelectorNameProps) => (
  <span
    className={cn(
      'flex-1 truncate text-left font-medium',
      'text-neutral-900 dark:text-neutral-100',
      className
    )}
    {...props}
  />
);

export type ModelSelectorDescriptionProps = ComponentProps<'span'>;

export const ModelSelectorDescription = ({
  className,
  ...props
}: ModelSelectorDescriptionProps) => (
  <span className={cn('text-xs text-neutral-500 dark:text-neutral-400', className)} {...props} />
);
