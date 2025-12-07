/**
 * Tooltip Component
 *
 * Componente compatibile con l'API Radix (Tooltip, TooltipTrigger, TooltipContent, TooltipProvider)
 * mantenendo il vecchio shorthand `<Tooltip content="...">...</Tooltip>`.
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@OneCoach/lib-design-system';
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 6, showArrow = false, ...props }, ref) => (_jsx(TooltipPrimitive.Portal, { children: _jsxs(TooltipPrimitive.Content, { ref: ref, sideOffset: sideOffset, className: cn('data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 z-50 overflow-hidden rounded-lg border border-neutral-800/60 bg-neutral-900 px-3 py-2 text-xs text-neutral-50 shadow-xl shadow-black/15 dark:border-neutral-200/30 dark:bg-neutral-100 dark:text-neutral-900', className), ...props, children: [props.children, showArrow ? (_jsx(TooltipPrimitive.Arrow, { className: "fill-neutral-900 dark:fill-neutral-100" })) : null] }) })));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const isShorthand = (props) => props.content !== undefined;
const Tooltip = (props) => {
    if (isShorthand(props)) {
        const { children, content, position, side = position ?? 'top', align = 'center', delayDuration = 200, contentClassName, showArrow = false, ...rest } = props;
        return (_jsx(TooltipProvider, { delayDuration: delayDuration, children: _jsxs(TooltipPrimitive.Root, { ...rest, children: [_jsx(TooltipTrigger, { asChild: true, children: children }), _jsx(TooltipContent, { side: side, align: align, showArrow: showArrow, className: contentClassName, children: content })] }) }));
    }
    const { children, ...rest } = props;
    return _jsx(TooltipPrimitive.Root, { ...rest, children: children });
};
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
