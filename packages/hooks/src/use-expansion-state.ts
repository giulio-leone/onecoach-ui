'use client';

/**
 * useExpansionState Hook
 *
 * Hook per gestire lo stato di espansione di settimane, giorni e pasti
 */

import { useState, useCallback } from 'react';

export function useExpansionState(initialWeeks: Set<number> = new Set([1])) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(initialWeeks);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const toggleWeek = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  }, []);

  const toggleDay = useCallback((dayKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  }, []);

  const toggleMeal = useCallback((mealKey: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealKey)) {
        next.delete(mealKey);
      } else {
        next.add(mealKey);
      }
      return next;
    });
  }, []);

  const expandWeek = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.add(weekNumber);
      return next;
    });
  }, []);

  const expandDay = useCallback((dayKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.add(dayKey);
      return next;
    });
  }, []);

  const expandMeal = useCallback((mealKey: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      next.add(mealKey);
      return next;
    });
  }, []);

  const collapseWeek = useCallback((weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.delete(weekNumber);
      return next;
    });
  }, []);

  const collapseDay = useCallback((dayKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.delete(dayKey);
      return next;
    });
  }, []);

  const collapseMeal = useCallback((mealKey: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      next.delete(mealKey);
      return next;
    });
  }, []);

  return {
    expandedWeeks,
    expandedDays,
    expandedMeals,
    toggleWeek,
    toggleDay,
    toggleMeal,
    expandWeek,
    expandDay,
    expandMeal,
    collapseWeek,
    collapseDay,
    collapseMeal,
    setExpandedWeeks,
    setExpandedDays,
    setExpandedMeals,
  };
}
