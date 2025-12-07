/**
 * Tooltip Component
 *
 * Componente compatibile con l'API Radix (Tooltip, TooltipTrigger, TooltipContent, TooltipProvider)
 * mantenendo il vecchio shorthand `<Tooltip content="...">...</Tooltip>`.
 */
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
declare const TooltipProvider: React.FC<TooltipPrimitive.TooltipProviderProps>;
declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
    showArrow?: boolean;
};
declare const TooltipContent: React.ForwardRefExoticComponent<Omit<TooltipContentProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
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
type TooltipProps = (TooltipRootProps & {
    content?: never;
}) | (TooltipRootProps & TooltipShorthandProps);
declare const Tooltip: (props: TooltipProps) => import("react/jsx-runtime").JSX.Element;
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
