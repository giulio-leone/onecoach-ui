'use client';
import { cn } from '@giulio-leone/lib-design-system';
import { Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@giulio-leone/ui';
import type { ToolUIPart } from './ai-types';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  ShieldAlertIcon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ComponentProps, ReactNode } from 'react';
import { isValidElement } from 'react';
import { CodeBlock } from './code-block';
/**
 * Tool Component - AI Elements v6
 *
 * Displays tool/function call information with glassmorphism styling,
 * collapsible content, status indicators, and input/output visualization.
 *
 * @see https://v6.ai-sdk.dev/elements/components/tool
 */
export type ToolProps = ComponentProps<typeof Collapsible>;
export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn(
      // Base
      'not-prose mb-4 w-full overflow-hidden rounded-xl',
      // Glassmorphism
      'bg-white/60 dark:bg-neutral-800/60',
      'backdrop-blur-sm',
      'border border-neutral-200/50 dark:border-white/[0.08]',
      // Shadow
      'shadow-sm',
      // Transition
      'transition-all duration-200',
      'hover:shadow-md',
      className
    )}
    {...props}
  />
);
export type ToolHeaderProps = {
  title?: string;
  type: ToolUIPart['type'];
  state: ToolUIPart['state'];
  className?: string;
};
const statusConfigs: Record<ToolUIPart['state'], { icon: ReactNode; variant: string }> = {
  'input-streaming': {
    icon: <CircleIcon className="size-3" />,
    variant: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  },
  'input-available': {
    icon: <ClockIcon className="size-3 animate-spin" />,
    variant: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  },
  'approval-requested': {
    icon: <ShieldAlertIcon className="size-3" />,
    variant: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  'approval-responded': {
    icon: <CheckCircleIcon className="size-3" />,
    variant: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  },
  'output-available': {
    icon: <CheckCircleIcon className="size-3" />,
    variant: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  'output-error': {
    icon: <XCircleIcon className="size-3" />,
    variant: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
  'output-denied': {
    icon: <XCircleIcon className="size-3" />,
    variant: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

const StatusBadge = ({ status, label }: { status: ToolUIPart['state']; label: string }) => {
  const config = statusConfigs[status];
  return (
    <Badge
      className={cn(
        'gap-1.5 rounded-full border-0 px-2.5 py-0.5 text-xs font-medium',
        config.variant
      )}
      variant="outline"
    >
      {config.icon}
      {label}
    </Badge>
  );
};
export const ToolHeader = ({ className, title, type, state, ...props }: ToolHeaderProps) => {
  const t = useTranslations();

  const statusLabels: Record<ToolUIPart['state'], string> = {
    'input-streaming': t('common.ui.waiting'),
    'input-available': t('common.ui.running'),
    'approval-requested': t('common.ui.approvalRequested'),
    'approval-responded': t('common.ui.responded'),
    'output-available': t('common.ui.completed'),
    'output-error': t('common.error'),
    'output-denied': t('common.ui.denied'),
  };

  return (
    <CollapsibleTrigger
      className={cn(
        // Layout
        'group flex w-full items-center justify-between gap-4 px-4 py-3',
        // Hover
        'hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30',
        // Focus
        'focus-visible:ring-primary-500/50 focus-visible:ring-2 focus-visible:outline-none',
        // Transition
        'transition-colors duration-200',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary-100 dark:bg-primary-900/30 flex size-8 items-center justify-center rounded-lg">
          <WrenchIcon className="text-primary-600 dark:text-primary-400 size-4" />
        </div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {title ?? type.split('-').slice(1).join('-')}
        </span>
        <StatusBadge status={state} label={statusLabels[state]} />
      </div>
      <ChevronDownIcon
        className={cn(
          'size-4 text-neutral-400 transition-transform duration-300',
          'group-data-[state=open]:rotate-180'
        )}
      />
    </CollapsibleTrigger>
  );
};
export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;
export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      // Animation
      'data-[state=closed]:animate-out data-[state=open]:animate-in',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
      'outline-none',
      // Border top
      'border-t border-neutral-200/50 dark:border-white/[0.08]',
      className
    )}
    {...props}
  />
);
export type ToolInputProps = ComponentProps<'div'> & {
  input: ToolUIPart['input'];
};
export const ToolInput = ({ className, input, ...props }: ToolInputProps) => {
  const t = useTranslations();
  return (
    <div className={cn('space-y-3 p-4', className)} {...props}>
      <h4 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {t('common.ui.parameters')}
      </h4>
      <div className="overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
        <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
      </div>
    </div>
  );
};
export type ToolOutputProps = ComponentProps<'div'> & {
  output: ToolUIPart['output'];
  errorText: ToolUIPart['errorText'];
};
export const ToolOutput = ({ className, output, errorText, ...props }: ToolOutputProps) => {
  const t = useTranslations();

  if (!(output || errorText)) {
    return null;
  }
  let Output = <div>{output as ReactNode}</div>;
  if (typeof output === 'object' && !isValidElement(output)) {
    Output = <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />;
  } else if (typeof output === 'string') {
    Output = <CodeBlock code={output} language="json" />;
  }
  return (
    <div
      className={cn(
        'space-y-3 p-4',
        'border-t border-neutral-200/50 dark:border-white/[0.08]',
        className
      )}
      {...props}
    >
      <h4
        className={cn(
          'text-xs font-semibold tracking-wide uppercase',
          errorText ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'
        )}
      >
        {errorText ? t('common.error') : t('common.ui.result')}
      </h4>
      <div
        className={cn(
          'overflow-x-auto rounded-lg text-xs [&_table]:w-full',
          errorText
            ? 'bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-neutral-50 dark:bg-neutral-900/50'
        )}
      >
        {errorText && <div className="font-mono">{errorText}</div>}
        {!errorText && Output}
      </div>
    </div>
  );
};
