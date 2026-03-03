/**
 * Copilot Sidebar Component
 *
 * Placeholder pending re-implementation with gauss-chat-react.
 */

'use client';

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

export function CopilotSidebar(_props: CopilotSidebarProps) {
  // TODO: Re-implement with gauss-chat-react
  return null;
}
