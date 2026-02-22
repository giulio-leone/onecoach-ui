/**
 * Tooltip Component
 *
 * Componente compatibile con l'API Radix (Tooltip, TooltipTrigger, TooltipContent, TooltipProvider)
 * mantenendo il vecchio shorthand `<Tooltip content="...">...</Tooltip>`.
 */

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@giulio-leone/lib-design-system';

const TooltipProvider: React.FC<any> = TooltipPrimitive.Provider;

const TooltipTrigger: React.FC<any> = TooltipPrimitive.Trigger;

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
  showArrow?: boolean;
};

const TooltipContent: React.ForwardRefExoticComponent<any> = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 z-50 overflow-hidden rounded-lg border border-neutral-800/60 bg-neutral-900 px-3 py-2 text-xs text-neutral-50 shadow-xl shadow-black/15 dark:border-neutral-200/30 dark:bg-neutral-100 dark:text-neutral-900',
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow ? (
        <TooltipPrimitive.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
      ) : null}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type TooltipRootProps = React.ComponentProps<typeof TooltipPrimitive.Root>;

type TooltipShorthandProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: TooltipContentProps['side'];
  /**
   * Alias di side per retro-compatibilità con codice esistente
   */
  position?: TooltipContentProps['side'];
  align?: TooltipContentProps['align'];
  delayDuration?: TooltipPrimitive.TooltipProviderProps['delayDuration'];
  contentClassName?: string;
  showArrow?: boolean;
};

type TooltipProps =
  | (TooltipRootProps & { content?: never })
  | (TooltipRootProps & TooltipShorthandProps);

const isShorthand = (props: TooltipProps): props is TooltipRootProps & TooltipShorthandProps =>
  (props as TooltipShorthandProps).content !== undefined;

const Tooltip = (props: TooltipProps) => {
  if (isShorthand(props)) {
    const {
      children,
      content,
      position,
      side = position ?? 'top',
      align = 'center',
      delayDuration = 200,
      contentClassName,
      showArrow = false,
      ...rest
    } = props;

    return (
      <TooltipProvider delayDuration={delayDuration}>
        <TooltipPrimitive.Root {...rest}>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent
            side={side}
            align={align}
            showArrow={showArrow}
            className={contentClassName}
          >
            {content}
          </TooltipContent>
        </TooltipPrimitive.Root>
      </TooltipProvider>
    );
  }

  const { children, ...rest } = props;
  return <TooltipPrimitive.Root {...rest}>{children}</TooltipPrimitive.Root>;
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
