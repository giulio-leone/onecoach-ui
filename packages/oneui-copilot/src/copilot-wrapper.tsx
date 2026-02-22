/**
 * Copilot Wrapper Component
 *
 * Wraps the application with the Copilot functionality.
 * Connects the CopilotSidebar to the global store state.
 */

'use client';

import { useCopilotStore } from '@giulio-leone/lib-stores';
import { CopilotSidebar } from './copilot-sidebar';

export function CopilotWrapper() {
  const isOpen = useCopilotStore((state) => state.isOpen);
  const toggleOpen = useCopilotStore((state) => state.toggleOpen);
  const close = useCopilotStore((state) => state.close);
  const mcpContext = useCopilotStore((state) => state.mcpContext);

  // Derive context data based on current domain
  const getContextData = () => {
    switch (mcpContext.domain) {
      case 'nutrition':
        return mcpContext.nutrition;
      case 'workout':
        return mcpContext.workout;
      case 'exercise':
        return mcpContext.exercise;
      case 'oneagenda':
        return mcpContext.oneAgenda;
      case 'marketplace':
        return mcpContext.marketplace;
      case 'analytics':
        return mcpContext.analytics;
      default:
        return null;
    }
  };

  const contextData = getContextData();

  // Don't render if not open, unless we want to keep it mounted for state preservation
  // But usually usually global overlays like this are conditionally rendered or hidden with CSS.
  // Given CopilotSidebar manages its own visibility/animation often, we might check if we should render.
  // The original implementation had: if (!isOpen && !context) return null;
  // But here mcpContext always exists.
  // If isOpen is false, we might still want to render if there's an animation, but let's stick to the previous logic of hiding it effectively.
  // Actually, CopilotSidebar takes an `isOpen` prop, implying it stays mounted or handles transition.
  // Let's pass isOpen to it.
  
  // If we return null when not open, we can't animate opening.
  // But if the sidebar is just a conditional render in layout, maybe it's fine.
  // Let's assume we render it always so it can handle its state? 
  // Wait, the previous implementation returned null.
  // Let's check CopilotSidebar content again. It uses UnifiedChat in 'sidebar' mode.
  // UnifiedChat likely has a Drawer or similar.
  // If we return null, we lose state.
  // However, layout.tsx is the root layout.
  
  // New logic: Just render it. Passage of `isOpen` handles visibility.
  // But we need to make sure `contextType` is valid.
  
  if (!mcpContext.domain && !isOpen) return null;

  return (
    <CopilotSidebar
      contextType={(mcpContext.domain || 'general') as any}
      contextData={contextData as Record<string, unknown> | null}
      isOpen={isOpen}
      onToggle={toggleOpen}
      onClose={close}
    />
  );
}
