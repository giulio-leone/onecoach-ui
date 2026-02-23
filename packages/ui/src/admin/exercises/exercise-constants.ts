'use client';

import { ExerciseApprovalStatus } from '@giulio-leone/types/database';

/**
 * Tipo per i filtri di stato
 */
export type FilterStatus = 'ALL' | ExerciseApprovalStatus;

/**
 * Filtri disponibili per lo stato di approvazione
 */
export const STATUS_FILTERS: Array<{ value: FilterStatus; label: string }> = [
  { value: 'ALL', label: 'Tutti' },
  { value: ExerciseApprovalStatus.DRAFT, label: 'Bozza' },
  { value: ExerciseApprovalStatus.PENDING, label: 'In attesa' },
  { value: ExerciseApprovalStatus.APPROVED, label: 'Approvati' },
  { value: ExerciseApprovalStatus.REJECTED, label: 'Rifiutati' },
];

/**
 * Stili per i badge di stato
 */
export const STATUS_BADGE_STYLES: Record<ExerciseApprovalStatus, string> = {
  [ExerciseApprovalStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  [ExerciseApprovalStatus.PENDING]:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [ExerciseApprovalStatus.APPROVED]:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [ExerciseApprovalStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

/**
 * Etichette per gli stati di approvazione
 */
export const STATUS_LABELS: Record<ExerciseApprovalStatus, string> = {
  [ExerciseApprovalStatus.DRAFT]: 'Bozza',
  [ExerciseApprovalStatus.PENDING]: 'In attesa',
  [ExerciseApprovalStatus.APPROVED]: 'Approvato',
  [ExerciseApprovalStatus.REJECTED]: 'Rifiutato',
};

/**
 * Breakpoints responsive (mobile-first approach)
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640, // sm in Tailwind
  desktop: 1024, // lg in Tailwind
} as const;

/**
 * Dimensione predefinita per la paginazione
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Tipo per i parametri di fetch
 */
export interface FetchParams {
  page?: number;
  search?: string;
  status?: FilterStatus;
  exerciseTypeId?: string;
  equipmentIds?: string[];
  bodyPartIds?: string[];
  muscleIds?: string[];
}

// SSOT: Rimuoviamo ExerciseListResponse - usa direttamente ExercisesResponse<LocalizedExercise> da @giulio-leone/lib-api
// Questo file non esporta più ExerciseListResponse per evitare duplicazioni
// Usa direttamente: ExercisesResponse<LocalizedExercise> & { page: number; pageSize: number; total: number; }
