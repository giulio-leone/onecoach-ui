'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * AppShell MainContent
 *
 * Wrapper responsivo che applica margini dinamici per sidebar e copilot.
 */
import { useEffect, useState } from 'react';
import { useSidebar, useUIStore, useCopilotStore } from '@onecoach/lib-stores';
import { cn } from '@onecoach/lib-design-system';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '../modern-sidebar';
export function AppShellMainContent({ children, className }) {
    const { isOpen } = useSidebar();
    const isCollapsed = !isOpen;
    const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
    // Copilot visibility from UIStore (single source of truth)
    const copilotVisible = useUIStore((state) => state.copilotVisible);
    // Copilot width from CopilotStore (supports resize)
    const copilotWidth = useCopilotStore((state) => state.width);
    const isResizing = useCopilotStore((state) => state.isResizing);
    // Detect if we're on desktop (Copilot uses sidebar mode)
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);
    // Only apply right margin on desktop when Copilot is open
    const shouldApplyCopilotMargin = copilotVisible && isDesktop;
    return (_jsx("main", { className: cn('overflow-x-hidden', 
        // Smooth transition only when NOT resizing
        !isResizing && 'transition-all duration-300', 'min-h-screen', className), style: {
            marginLeft: isDesktop ? `${sidebarWidth}px` : undefined,
            // Right margin for Copilot sidebar (desktop only) - uses dynamic width
            marginRight: shouldApplyCopilotMargin ? `${copilotWidth}px` : undefined,
        }, children: children }));
}
