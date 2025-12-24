/**
 * useVisualBuilderState Hook
 *
 * Generic state management hook for visual builders (Workout, Nutrition, etc.)
 * Handles week/day navigation, adding/removing items with proper index management.
 * Follows SOLID principles - Single Responsibility: navigation & structure state only.
 *
 * @example
 * const {
 *   selectedWeekIndex,
 *   selectedDayIndex,
 *   setSelectedWeekIndex,
 *   setSelectedDayIndex,
 *   addWeek,
 *   addDay,
 *   removeDay,
 *   removeWeek,
 *   currentWeek,
 *   currentDay,
 * } = useVisualBuilderState({ weeks: plan.weeks, onWeeksChange });
 */

import { useState, useCallback, useMemo } from 'react';

// Generic week/day interfaces - works for both Workout and Nutrition
export interface GenericDay {
  id?: string;
  dayNumber: number;
  dayName?: string;
  name?: string;
}

export interface GenericWeek<TDay extends GenericDay = GenericDay> {
  id?: string;
  weekNumber: number;
  days: TDay[];
  notes?: string;
  focus?: string;
}

export interface UseVisualBuilderStateOptions<
  TWeek extends GenericWeek<TDay>,
  TDay extends GenericDay,
> {
  /** Current weeks array */
  weeks: TWeek[] | undefined;
  /** Callback when weeks change */
  onWeeksChange: (weeks: TWeek[]) => void;
  /** Factory function to create a new empty week */
  createEmptyWeek: (weekNumber: number) => TWeek;
  /** Factory function to create a new empty day */
  createEmptyDay: (dayNumber: number) => TDay;
  /** Initial selected week index */
  initialWeekIndex?: number;
  /** Initial selected day index */
  initialDayIndex?: number;
}

export interface UseVisualBuilderStateReturn<
  TWeek extends GenericWeek<TDay>,
  TDay extends GenericDay,
> {
  // Selection state
  selectedWeekIndex: number;
  selectedDayIndex: number;
  setSelectedWeekIndex: (index: number) => void;
  setSelectedDayIndex: (index: number) => void;

  // Derived state
  currentWeek: TWeek | undefined;
  currentDay: TDay | undefined;
  weekCount: number;
  dayCount: number;

  // Actions
  addWeek: () => void;
  addDay: () => void;
  removeDay: (weekIndex: number, dayIndex: number) => void;
  removeWeek: (weekIndex: number) => void;
  selectWeek: (weekIndex: number) => void;
  selectDay: (dayIndex: number) => void;

  // Update helpers
  updateCurrentDay: (updatedDay: TDay) => void;
  updateCurrentWeek: (updatedWeek: TWeek) => void;
}

export function useVisualBuilderState<
  TWeek extends GenericWeek<TDay>,
  TDay extends GenericDay,
>({
  weeks,
  onWeeksChange,
  createEmptyWeek,
  createEmptyDay,
  initialWeekIndex = 0,
  initialDayIndex = 0,
}: UseVisualBuilderStateOptions<TWeek, TDay>): UseVisualBuilderStateReturn<TWeek, TDay> {
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(initialWeekIndex);
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex);

  // Derived state
  const currentWeek = useMemo(() => weeks?.[selectedWeekIndex], [weeks, selectedWeekIndex]);
  const currentDay = useMemo(
    () => currentWeek?.days?.[selectedDayIndex],
    [currentWeek, selectedDayIndex]
  );
  const weekCount = weeks?.length ?? 0;
  const dayCount = currentWeek?.days?.length ?? 0;

  // Add a new week
  const addWeek = useCallback(() => {
    const newWeekNumber = (weeks?.length || 0) + 1;
    const newWeek = createEmptyWeek(newWeekNumber);
    onWeeksChange([...(weeks || []), newWeek]);
    setSelectedWeekIndex(weeks?.length || 0);
    setSelectedDayIndex(0);
  }, [weeks, onWeeksChange, createEmptyWeek]);

  // Add a new day to current week
  const addDay = useCallback(() => {
    if (!weeks?.[selectedWeekIndex]) return;

    const newWeeks = [...weeks];
    const targetWeek = { ...newWeeks[selectedWeekIndex] };
    const newDayNumber = targetWeek.days.length + 1;
    const newDay = createEmptyDay(newDayNumber);

    targetWeek.days = [...targetWeek.days, newDay];
    newWeeks[selectedWeekIndex] = targetWeek as TWeek;

    onWeeksChange(newWeeks);
    setSelectedDayIndex(targetWeek.days.length - 1);
  }, [weeks, selectedWeekIndex, onWeeksChange, createEmptyDay]);

  // Remove a day
  const removeDay = useCallback(
    (weekIndex: number, dayIndex: number) => {
      if (!weeks?.[weekIndex]?.days) return;

      const newWeeks = [...weeks];
      const targetWeek = { ...newWeeks[weekIndex] };
      const newDays = [...targetWeek.days];
      newDays.splice(dayIndex, 1);

      // Re-index remaining days
      newDays.forEach((day, idx) => {
        day.dayNumber = idx + 1;
        // Update dayName if it follows the pattern "Giorno X"
        if (day.dayName?.startsWith('Giorno ')) {
          day.dayName = `Giorno ${idx + 1}`;
        }
        if (day.name?.startsWith('Giorno ')) {
          day.name = `Giorno ${idx + 1}`;
        }
      });

      targetWeek.days = newDays;
      newWeeks[weekIndex] = targetWeek as TWeek;
      onWeeksChange(newWeeks);

      // Adjust selection if needed
      if (selectedDayIndex >= newDays.length) {
        setSelectedDayIndex(Math.max(0, newDays.length - 1));
      }
    },
    [weeks, selectedDayIndex, onWeeksChange]
  );

  // Remove a week
  const removeWeek = useCallback(
    (weekIndex: number) => {
      if (!weeks || weeks.length <= 1) return; // Keep at least one week

      const newWeeks = [...weeks];
      newWeeks.splice(weekIndex, 1);

      // Re-index remaining weeks
      newWeeks.forEach((week, idx) => {
        week.weekNumber = idx + 1;
      });

      onWeeksChange(newWeeks);

      // Adjust selection if needed
      if (selectedWeekIndex >= newWeeks.length) {
        setSelectedWeekIndex(Math.max(0, newWeeks.length - 1));
        setSelectedDayIndex(0);
      }
    },
    [weeks, selectedWeekIndex, onWeeksChange]
  );

  // Select week with day reset
  const selectWeek = useCallback((weekIndex: number) => {
    setSelectedWeekIndex(weekIndex);
    setSelectedDayIndex(0);
  }, []);

  // Select day
  const selectDay = useCallback((dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
  }, []);

  // Update current day
  const updateCurrentDay = useCallback(
    (updatedDay: TDay) => {
      if (!weeks?.[selectedWeekIndex]?.days) return;

      const newWeeks = [...weeks];
      const targetWeek = { ...newWeeks[selectedWeekIndex] };
      const newDays = [...targetWeek.days];
      newDays[selectedDayIndex] = updatedDay;
      targetWeek.days = newDays;
      newWeeks[selectedWeekIndex] = targetWeek as TWeek;

      onWeeksChange(newWeeks);
    },
    [weeks, selectedWeekIndex, selectedDayIndex, onWeeksChange]
  );

  // Update current week
  const updateCurrentWeek = useCallback(
    (updatedWeek: TWeek) => {
      if (!weeks) return;

      const newWeeks = [...weeks];
      newWeeks[selectedWeekIndex] = updatedWeek;
      onWeeksChange(newWeeks);
    },
    [weeks, selectedWeekIndex, onWeeksChange]
  );

  return {
    // Selection state
    selectedWeekIndex,
    selectedDayIndex,
    setSelectedWeekIndex,
    setSelectedDayIndex,

    // Derived state
    currentWeek,
    currentDay,
    weekCount,
    dayCount,

    // Actions
    addWeek,
    addDay,
    removeDay,
    removeWeek,
    selectWeek,
    selectDay,

    // Update helpers
    updateCurrentDay,
    updateCurrentWeek,
  };
}
