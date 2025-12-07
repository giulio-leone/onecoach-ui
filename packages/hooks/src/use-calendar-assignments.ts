/**
 * useCalendarAssignments Hook
 *
 * Custom hook for managing calendar assignments (DRY principle).
 * Handles fetching, creating, updating, and deleting assignments.
 */

'use client';

import { useState, useCallback } from 'react';
import type { CalendarPlanType } from '@prisma/client';
import type { CalendarAssignment, RecurrenceRule } from '@onecoach/lib-core';

interface UseCalendarAssignmentsOptions {
  startDate: string;
  endDate: string;
  planType?: CalendarPlanType;
  autoFetch?: boolean;
}

interface CreateAssignmentData {
  date?: string;
  startDate?: string;
  endDate?: string;
  planType: CalendarPlanType;
  planId: string;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
}

export function useCalendarAssignments(options: UseCalendarAssignmentsOptions) {
  const [assignments, setAssignments] = useState<CalendarAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch assignments for the specified date range
   */
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: options.startDate,
        endDate: options.endDate,
        ...(options.planType && { planType: options.planType }),
      });

      const response = await fetch(`/api/calendar/assignments?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assignments';
      setError(message);
      console.error('Calendar assignment error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.startDate, options.endDate, options.planType]);

  /**
   * Create a new assignment (single date or range)
   */
  const createAssignment = useCallback(
    async (data: CreateAssignmentData): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/calendar/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create assignment');
        }

        // Refresh assignments
        await fetchAssignments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create assignment';
        setError(message);
        console.error('Calendar assignment error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAssignments]
  );

  /**
   * Update an existing assignment
   */
  const updateAssignment = useCallback(
    async (
      id: string,
      data: Partial<Omit<CreateAssignmentData, 'startDate' | 'endDate'>>
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/calendar/assignments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update assignment');
        }

        // Refresh assignments
        await fetchAssignments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update assignment';
        setError(message);
        console.error('Calendar assignment error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAssignments]
  );

  /**
   * Delete an assignment
   */
  const deleteAssignment = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/calendar/assignments/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete assignment');
        }

        // Refresh assignments
        await fetchAssignments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete assignment';
        setError(message);
        console.error('Calendar assignment error:', err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAssignments]
  );

  /**
   * Get assignments for a specific date
   */
  const getAssignmentsForDate = useCallback(
    (date: Date): CalendarAssignment[] => {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      return assignments.filter((assignment: any) => {
        const assignmentDate = new Date(assignment.date);
        assignmentDate.setHours(0, 0, 0, 0);
        return assignmentDate.getTime() === targetDate.getTime();
      });
    },
    [assignments]
  );

  /**
   * Check if a date has assignments
   */
  const hasAssignments = useCallback(
    (date: Date, type?: CalendarPlanType): boolean => {
      const dateAssignments = getAssignmentsForDate(date);
      if (!type) return dateAssignments.length > 0;
      return dateAssignments.some((a) => a.planType === type);
    },
    [getAssignmentsForDate]
  );

  return {
    assignments,
    isLoading,
    error,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForDate,
    hasAssignments,
  };
}
