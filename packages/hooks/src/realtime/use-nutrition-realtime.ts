/**
 * useNutritionRealtime Hook
 *
 * Hook per sincronizzazione TRUE realtime dei nutrition plans e logs.
 * Aggiorna direttamente il cache di React Query invece di invalidare.
 */

'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useRealtimeSyncSingle,
  useRealtimeSubscription,
  useRealtimeSync,
} from '@giulio-leone/lib-stores';
import { useAuthStore } from '@giulio-leone/lib-stores';
import { nutritionKeys } from '@giulio-leone/lib-api';

// Tipi per i record del database (struttura reale dal Prisma schema)
interface NutritionPlanRecord {
  id: string;
  userId: string; // camelCase come nel database
  name: string;
  description: string;
  durationWeeks: number;
  targetMacros: unknown; // Json
  userProfile?: unknown | null; // Json?
  personalizedPlan?: unknown | null; // Json?
  adaptations?: unknown | null; // Json?
  restrictions: string[];
  preferences: string[];
  status: string; // NutritionStatus
  metadata?: unknown | null; // Json?
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  goals: string[];
  weeks: unknown; // Json
  [key: string]: unknown;
}

interface NutritionDayLogRecord {
  id: string;
  nutrition_plan_id: string;
  user_id: string;
  date: string;
  calories_consumed?: number;
  protein_consumed?: number;
  carbs_consumed?: number;
  fat_consumed?: number;
  meals?: unknown;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface NutritionAdherenceRecord {
  id: string;
  nutrition_plan_id: string;
  user_id: string;
  date: string;
  adherence_score?: number;
  [key: string]: unknown;
}

/**
 * Hook per sincronizzazione realtime della lista nutrition plans.
 *
 * Gestisce correttamente la struttura { plans: [...] } restituita da useNutritionPlans.
 *
 * @example
 * ```tsx
 * function NutritionList() {
 *   const { data } = useNutritionPlans();
 *   useNutritionPlansRealtime(); // Abilita realtime sync
 *   return <>{data.plans.map(...)}</>;
 * }
 * ```
 */
export function useNutritionPlansRealtime() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  // NOTA: useRealtimeListSync standard gestisce array T[].
  // Tuttavia, useNutritionPlans ritorna { plans: T[] }.
  // Qui dobbiamo usare un transform custom o useRealtimeSubscription se la struttura cache è diversa.
  // Dato che useRealtimeListSync assume che la cache SIA una lista, ma qui è un oggetto { plans: ... },
  // DOVREMMO mantenere la logica custom O adattare la cache.
  // MENTENIAMO la logica custom per ora ma pulita e con il logger standard,
  // perché cambiare la struttura della cache richiederebbe refactoring massiccio delle query.

  // Utilizziamo un approccio ibrido: direct setQueryData ma con la struttura corretta.

  const handleInsert = useCallback(
    (rawRecord: Record<string, unknown>) => {
      const record = rawRecord as NutritionPlanRecord;

      queryClient.setQueryData<{ plans: NutritionPlanRecord[] }>(
        nutritionKeys.lists(),
        (oldData) => {
          if (!oldData) return { plans: [record] };
          // Evita duplicati
          if (oldData.plans.some((item) => item.id === record.id)) return oldData;
          return { plans: [...oldData.plans, record] };
        }
      );
    },
    [queryClient]
  );

  const handleUpdate = useCallback(
    (rawRecord: Record<string, unknown>) => {
      const record = rawRecord as NutritionPlanRecord;

      queryClient.setQueryData<{ plans: NutritionPlanRecord[] }>(
        nutritionKeys.lists(),
        (oldData) => {
          if (!oldData) return { plans: [record] };
          return {
            plans: oldData.plans.map((item: any) => (item.id === record.id ? record : item)),
          };
        }
      );
    },
    [queryClient]
  );

  const handleDelete = useCallback(
    (rawRecord: Record<string, unknown>) => {
      const record = rawRecord as NutritionPlanRecord;

      queryClient.setQueryData<{ plans: NutritionPlanRecord[] }>(
        nutritionKeys.lists(),
        (oldData) => {
          if (!oldData) return { plans: [] };
          return { plans: oldData.plans.filter((item: any) => item.id !== record.id) };
        }
      );
    },
    [queryClient]
  );

  useRealtimeSubscription<NutritionPlanRecord>({
    table: 'nutrition_plans',
    // Il database usa "userId" (camelCase) non "user_id" (snake_case)
    filter: userId ? `userId=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo nutrition plan.
 *
 * @param planId - ID del piano da osservare
 *
 * @example
 * ```tsx
 * function NutritionDetail({ planId }) {
 *   const { data } = useNutritionPlan(planId);
 *   useNutritionPlanDetailRealtime(planId);
 *   return <>{data.name}</>;
 * }
 * ```
 */
export function useNutritionPlanDetailRealtime(planId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<NutritionPlanRecord>({
    table: 'nutrition_plans',
    recordId: planId!,
    queryKey: nutritionKeys.detail(planId!),
    queryClient,
    enabled: !!planId,
  });
}

/**
 * Hook per sincronizzazione realtime dei day logs di un piano.
 *
 * @param planId - ID del piano nutrizionale
 */
export function useNutritionDayLogsRealtime(planId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeSync<NutritionDayLogRecord>({
    table: 'nutrition_day_logs',
    queryKey: planId ? nutritionKeys.dayLogs(planId) : nutritionKeys.logs(),
    filter: planId ? `nutrition_plan_id=eq.${planId}` : userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onSynced: (_event, record) => {
      // Invalida anche il detail del piano correlato per aggiornare le statistiche
      if (record.nutrition_plan_id) {
        queryClient.invalidateQueries({
          queryKey: nutritionKeys.detail(record.nutrition_plan_id),
        });
      }
    },
  });
}

/**
 * Hook per sincronizzazione realtime di un singolo day log.
 *
 * @param logId - ID del day log da osservare
 */
export function useNutritionDayLogRealtime(logId: string | undefined | null) {
  const queryClient = useQueryClient();

  useRealtimeSyncSingle<NutritionDayLogRecord>({
    table: 'nutrition_day_logs',
    recordId: logId!,
    queryKey: nutritionKeys.log(logId!),
    queryClient,
    enabled: !!logId,
  });
}

/**
 * Hook per sincronizzazione realtime delle metriche di aderenza.
 *
 * @param planId - ID del piano per filtrare le metriche
 */
export function useNutritionAdherenceRealtime(planId?: string) {
  const userId = useAuthStore((state) => state.user?.id);

  useRealtimeSync<NutritionAdherenceRecord>({
    table: 'nutrition_adherence_metrics',
    queryKey: ['nutrition-adherence', planId],
    filter: planId ? `nutrition_plan_id=eq.${planId}` : userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
  });
}

/**
 * Hook combinato che abilita TUTTO il realtime per la nutrition.
 * Usa questo nella pagina /nutrition per abilitare tutte le sincronizzazioni.
 *
 * @example
 * ```tsx
 * function NutritionPage() {
 *   useAllNutritionRealtime();
 *   // ... rest of the component
 * }
 * ```
 */
export function useAllNutritionRealtime() {
  useNutritionPlansRealtime();
  useNutritionDayLogsRealtime();
}
