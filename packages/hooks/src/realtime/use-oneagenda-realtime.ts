/**
 * useOneAgendaRealtime Hook
 *
 * Hook per sincronizzazione TRUE realtime di Project, Task, Milestone, Habit, HabitLog.
 * Aggiorna direttamente il cache di React Query invece di invalidare.
 */

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@giulio-leone/lib-shared';
import { useAuthStore, useRealtimeSyncSingle, useRealtimeListSync } from '@giulio-leone/lib-stores';

// Re-export delle query keys per coerenza
export const oneagendaKeys = {
  all: ['oneagenda'] as const,
  tasks: {
    all: () => [...oneagendaKeys.all, 'tasks'] as const,
    lists: () => [...oneagendaKeys.all, 'tasks', 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...oneagendaKeys.all, 'tasks', 'list', filters] as const,
    details: () => [...oneagendaKeys.all, 'tasks', 'detail'] as const,
    detail: (id: string) => [...oneagendaKeys.all, 'tasks', 'detail', id] as const,
  },
  projects: {
    all: () => [...oneagendaKeys.all, 'projects'] as const,
    lists: () => [...oneagendaKeys.all, 'projects', 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...oneagendaKeys.all, 'projects', 'list', filters] as const,
    details: () => [...oneagendaKeys.all, 'projects', 'detail'] as const,
    detail: (id: string) => [...oneagendaKeys.all, 'projects', 'detail', id] as const,
  },
  milestones: {
    all: () => [...oneagendaKeys.all, 'milestones'] as const,
    lists: () => [...oneagendaKeys.all, 'milestones', 'list'] as const,
    list: (projectId?: string) => [...oneagendaKeys.all, 'milestones', 'list', projectId] as const,
    detail: (id: string) => [...oneagendaKeys.all, 'milestones', 'detail', id] as const,
  },
  habits: {
    all: () => [...oneagendaKeys.all, 'habits'] as const,
    lists: () => [...oneagendaKeys.all, 'habits', 'list'] as const,
    list: () => [...oneagendaKeys.all, 'habits', 'list'] as const,
    detail: (id: string) => [...oneagendaKeys.all, 'habits', 'detail', id] as const,
    logs: (habitId: string) => [...oneagendaKeys.all, 'habits', habitId, 'logs'] as const,
  },
} as const;

// Tipi per i record del database
interface ProjectRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface TaskRecord {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface MilestoneRecord {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface HabitRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency?: string;
  targetCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface HabitLogRecord {
  id: string;
  habitId: string;
  date: string;
  completed?: boolean;
  count?: number;
  notes?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// ============================================================================
// PROJECTS
// ============================================================================

/**
 * Hook per sincronizzazione realtime della lista progetti.
 */
export function useProjectsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<ProjectRecord>({
    table: 'projects',
    queryKey: oneagendaKeys.projects.lists(),
    queryClient,
    filter: userId ? `userId=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Project ${event}:`, record.id);
    },
    onError: (error) => {
      logger.error('[Realtime] Projects error:', error);
    },
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo progetto.
 */
export function useProjectDetailRealtime(projectId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<ProjectRecord>({
    table: 'projects',
    recordId: projectId!,
    queryKey: oneagendaKeys.projects.detail(projectId!),
    queryClient,
    enabled: !!projectId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Project detail ${event}:`, record.id);
    },
  });
}

// ============================================================================
// TASKS
// ============================================================================

/**
 * Hook per sincronizzazione realtime della lista task.
 *
 * @param projectId - Opzionale, filtra per progetto
 */
export function useTasksRealtime(projectId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<TaskRecord>({
    table: 'tasks',
    queryKey: projectId ? oneagendaKeys.tasks.list({ projectId }) : oneagendaKeys.tasks.lists(),
    queryClient,
    filter: projectId ? `projectId=eq.${projectId}` : userId ? `userId=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Task ${event}:`, { id: record.id, title: record.title });
      // Invalida anche il progetto parent se presente
      if (record.projectId) {
        queryClient.invalidateQueries({
          queryKey: oneagendaKeys.projects.detail(record.projectId),
        });
      }
    },
    onError: (error) => {
      logger.error('[Realtime] Tasks error:', error);
    },
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo task.
 */
export function useTaskDetailRealtime(taskId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<TaskRecord>({
    table: 'tasks',
    recordId: taskId!,
    queryKey: oneagendaKeys.tasks.detail(taskId!),
    queryClient,
    enabled: !!taskId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Task detail ${event}:`, record.id);
    },
  });
}

// ============================================================================
// MILESTONES
// ============================================================================

/**
 * Hook per sincronizzazione realtime delle milestone di un progetto.
 */
export function useMilestonesRealtime(projectId?: string) {
  const queryClient = useQueryClient();

  useRealtimeListSync<MilestoneRecord>({
    table: 'milestones',
    queryKey: oneagendaKeys.milestones.list(projectId),
    queryClient,
    filter: projectId ? `projectId=eq.${projectId}` : undefined,
    enabled: !!projectId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Milestone ${event}:`, record.id);
      // Invalida anche il progetto parent
      queryClient.invalidateQueries({
        queryKey: oneagendaKeys.projects.detail(record.projectId),
      });
    },
  });
}

// ============================================================================
// HABITS
// ============================================================================

/**
 * Hook per sincronizzazione realtime della lista habit.
 */
export function useHabitsRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeListSync<HabitRecord>({
    table: 'habits',
    queryKey: oneagendaKeys.habits.lists(),
    queryClient,
    filter: userId ? `userId=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Habit ${event}:`, { id: record.id, name: record.name });
    },
    onError: (error) => {
      logger.error('[Realtime] Habits error:', error);
    },
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo habit.
 */
export function useHabitDetailRealtime(habitId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<HabitRecord>({
    table: 'habits',
    recordId: habitId!,
    queryKey: oneagendaKeys.habits.detail(habitId!),
    queryClient,
    enabled: !!habitId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] Habit detail ${event}:`, record.id);
    },
  });
}

/**
 * Hook per sincronizzazione realtime dei log di un habit.
 */
export function useHabitLogsRealtime(habitId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeListSync<HabitLogRecord>({
    table: 'habit_logs',
    queryKey: oneagendaKeys.habits.logs(habitId!),
    queryClient,
    filter: habitId ? `habitId=eq.${habitId}` : undefined,
    enabled: !!habitId,
    onSynced: (event, record) => {
      logger.warn(`[Realtime] HabitLog ${event}:`, record.id);
      // Invalida anche l'habit parent per aggiornare le statistiche
      queryClient.invalidateQueries({
        queryKey: oneagendaKeys.habits.detail(record.habitId),
      });
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinato per sincronizzare TUTTO OneAgenda.
 *
 * @example
 * ```tsx
 * function OneAgendaPage() {
 *   useAllOneAgendaRealtime();
 *   // ... rest of the component
 * }
 * ```
 */
export function useAllOneAgendaRealtime() {
  useProjectsRealtime();
  useTasksRealtime();
  useHabitsRealtime();
}

/**
 * Hook per sincronizzare un progetto specifico con tutti i suoi children.
 *
 * @param projectId - ID del progetto
 */
export function useProjectFullRealtime(projectId: string | undefined | null) {
  useProjectDetailRealtime(projectId);
  useTasksRealtime(projectId || undefined);
  useMilestonesRealtime(projectId || undefined);
}
