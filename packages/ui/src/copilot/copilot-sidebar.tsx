/**
 * Copilot Sidebar Component
 *
 * Wrapper che usa UnifiedChat in modalità sidebar con:
 * - Resize handle per ridimensionare la larghezza (desktop/tablet)
 * - Bottom sheet su mobile
 * - Integrazione con CopilotStore per stato condiviso
 *
 * PRINCIPI: KISS, SOLID, DRY
 * - Delega tutta la logica a UnifiedChat
 * - Zero duplicazione di codice
 */

'use client';

import { UnifiedChat } from '@giulio-leone/lib-chat-core/client';
import type { ScreenContextType } from '@giulio-leone/lib-chat-core/types';
import { useCopilotStore } from '@giulio-leone/lib-stores';
import { CopilotResizeHandle } from './copilot-resize-handle';
import type { NutritionPlan } from '@giulio-leone/types/nutrition';
import type { WorkoutProgram } from '@giulio-leone/types/workout';

export interface CopilotSidebarProps {
  contextType:
    | 'nutrition'
    | 'workout'
    | 'chat'
    | 'analytics'
    | 'oneagenda'
    | 'exercise'
    | 'marketplace'
    | 'athlete'
    | 'settings'
    | 'admin'
    | 'general';
  contextData?: NutritionPlan | WorkoutProgram | Record<string, unknown> | null;
  onContextUpdate?: (
    updatedContext: NutritionPlan | WorkoutProgram | Record<string, unknown>
  ) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  onClose?: () => void;
}

export function CopilotSidebar({
  contextType,
  contextData,
  onContextUpdate,
  isOpen,
  onToggle,
  onClose,
}: CopilotSidebarProps) {
  // Get resize state from CopilotStore
  const width = useCopilotStore((state) => state.width);
  const minWidth = useCopilotStore((state) => state.minWidth);
  const maxWidth = useCopilotStore((state) => state.maxWidth);
  const isResizing = useCopilotStore((state) => state.isResizing);

  // Map context data to unified format - preserve all data including IDs
  const mappedContextData = contextData
    ? {
        // Spread all context data first
        ...contextData,
        // Then override with computed values
        entityId:
          (contextData as { entityId?: string }).entityId || (contextData as { id?: string }).id,
        entityType: (contextData as { entityType?: string }).entityType,
        type: contextType,
      }
    : undefined;

  return (
    <UnifiedChat
      mode="sidebar"
      contextType={contextType as ScreenContextType}
      contextData={mappedContextData as Record<string, unknown>}
      onContextUpdate={onContextUpdate}
      isOpen={isOpen}
      onToggle={onToggle}
      onClose={onClose}
      // Resize props
      width={width}
      minWidth={minWidth}
      maxWidth={maxWidth}
      isResizing={isResizing}
      resizeHandle={<CopilotResizeHandle />}
    />
  );
}
