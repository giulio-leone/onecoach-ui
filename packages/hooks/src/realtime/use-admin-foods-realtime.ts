'use client';

/**
 * Admin Foods Realtime Hook
 *
 * Hook per sincronizzazione realtime dei food items nell'admin panel.
 * Aggiorna direttamente il cache React Query invece di invalidare.
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@giulio-leone/lib-stores';
// Importa le query keys da lib-api per garantire corrispondenza esatta
import { foodKeys } from '@giulio-leone/lib-api';
import type { FoodsResponse, Food } from '@giulio-leone/lib-api';

import { logger } from '@giulio-leone/lib-shared';
// Tipo per FoodItem dal database (struttura reale)
interface FoodItemRecord {
  id: string;
  name: string;
  brand_id?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  serving_size?: number | null;
  serving_unit?: string | null;
  barcode?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: unknown;
}

interface FoodCategory {
  id: string;
  name: string;
  description?: string | null;
  [key: string]: unknown;
}

// Re-export per compatibilità
export const adminFoodKeys = foodKeys;
const foodCategoryKey = ['food_categories'] as const;

/**
 * Hook per sincronizzare la lista food items in admin
 * Usa le stesse query keys di useFoods per garantire sincronizzazione corretta
 */
export function useAdminFoodsRealtime() {
  const queryClient = useQueryClient();

  const handleInsert = useCallback(
    (rawRecord: Record<string, unknown>) => {
      const record = rawRecord as FoodItemRecord;
      // Trasforma il record del database in formato Food
      const food: Food = {
        id: record.id,
        name: record.name,
        servingSize: record.serving_size ?? 100,
        unit: record.serving_unit ?? 'g',
        macrosPer100g: {
          calories: record.calories ?? 0,
          protein: record.protein ?? 0,
          carbs: record.carbs ?? 0,
          fats: record.fat ?? 0,
          fiber: record.fiber ?? undefined,
        },
        barcode: record.barcode ?? undefined,
        brand: record.brand_id ? { id: record.brand_id, name: record.brand_id } : undefined,
      };

      // Aggiorna tutte le query che corrispondono a foodKeys.lists()
      queryClient.setQueriesData<FoodsResponse>(
        { queryKey: foodKeys.lists(), exact: false },
        (oldData) => {
          if (!oldData) return { data: [food], total: 1 };
          // Evita duplicati
          if (oldData.data.some((item) => item.id === food.id)) return oldData;
          return {
            ...oldData,
            data: [...oldData.data, food],
            total: (oldData.total ?? oldData.data.length) + 1,
          };
        }
      );
      logger.warn(`[Realtime] Food item INSERT:`, food.id);
    },
    [queryClient]
  );

  const handleUpdate = useCallback(
    (rawRecord: Record<string, unknown>) => {
      const record = rawRecord as FoodItemRecord;
      // Trasforma il record del database in formato Food
      const food: Food = {
        id: record.id,
        name: record.name,
        servingSize: record.serving_size ?? 100,
        unit: record.serving_unit ?? 'g',
        macrosPer100g: {
          calories: record.calories ?? 0,
          protein: record.protein ?? 0,
          carbs: record.carbs ?? 0,
          fats: record.fat ?? 0,
          fiber: record.fiber ?? undefined,
        },
        barcode: record.barcode ?? undefined,
        brand: record.brand_id ? { id: record.brand_id, name: record.brand_id } : undefined,
      };

      // Aggiorna tutte le query che corrispondono a foodKeys.lists()
      queryClient.setQueriesData<FoodsResponse>(
        { queryKey: foodKeys.lists(), exact: false },
        (oldData) => {
          if (!oldData) return { data: [food], total: 1 };
          return {
            ...oldData,
            data: oldData.data.map((item) => (item.id === food.id ? food : item)),
          };
        }
      );
      logger.warn(`[Realtime] Food item UPDATE:`, food.id);
    },
    [queryClient]
  );

  const handleDelete = useCallback(
    (rawRecord: Record<string, unknown>) => {
      const record = rawRecord as FoodItemRecord;

      // Aggiorna tutte le query che corrispondono a foodKeys.lists()
      queryClient.setQueriesData<FoodsResponse>(
        { queryKey: foodKeys.lists(), exact: false },
        (oldData) => {
          if (!oldData) return { data: [], total: 0 };
          const newData = oldData.data.filter((item) => item.id !== record.id);
          return {
            ...oldData,
            data: newData,
            total: Math.max(0, (oldData.total ?? oldData.data.length) - 1),
          };
        }
      );
      logger.warn(`[Realtime] Food item DELETE:`, record.id);
    },
    [queryClient]
  );

  useRealtimeSubscription<FoodItemRecord>({
    table: 'food_items',
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onError: (error) => {
      logger.error('[Realtime] Food items error:', error);
    },
  });
}

/**
 * Hook per sincronizzare le categorie food
 */
export function useAdminFoodCategoriesRealtime() {
  const queryClient = useQueryClient();

  useRealtimeSubscription<FoodCategory>({
    table: 'food_categories',
    onInsert: () => {
      queryClient.invalidateQueries({ queryKey: foodCategoryKey });
    },
    onUpdate: () => {
      queryClient.invalidateQueries({ queryKey: foodCategoryKey });
    },
    onDelete: () => {
      queryClient.invalidateQueries({ queryKey: foodCategoryKey });
    },
  });
}

/**
 * Hook combinato per tutto il Realtime admin foods
 */
export function useAllAdminFoodsRealtime() {
  useAdminFoodsRealtime();
  useAdminFoodCategoriesRealtime();
}
