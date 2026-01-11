'use client';

import { useTranslations } from 'next-intl';
/**
 * ExercisePagination Component
 *
 * Componente per paginazione esercizi.
 * Responsabile solo della UI paginazione (principio SRP).
 */

import { useCallback } from 'react';
import { Button } from '@onecoach/ui';

interface ExercisePaginationProps {
  page: number;
  pageSize?: number; // Optional to maintain compatibility if pageSize is not passed
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Componente paginazione responsive
 */
export function ExercisePagination({
  page,
  pageSize = 20,
  totalPages: _totalPages, // Ignored in favor of calculation if needed, or used directly
  total,
  onPageChange,
  isLoading = false,
}: ExercisePaginationProps) {
  const t = useTranslations('admin');

  // Use passed totalPages or calculate it
  const totalPages =
    _totalPages > 0 ? _totalPages : Math.max(Math.ceil(total / Math.max(pageSize, 1)), 1);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Handler stabili per evitare problemi di re-render
  const handlePrev = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (canPrev && !isLoading) {
        onPageChange(page - 1);
      }
    },
    [canPrev, page, onPageChange, isLoading]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (canNext && !isLoading) {
        onPageChange(page + 1);
      }
    },
    [canNext, page, onPageChange, isLoading]
  );

  return (
    <div className="flex items-center justify-between py-3 text-sm text-neutral-600 dark:text-neutral-400">
      <div>
        Pagina {page} di {totalPages} ({total} {t('admin.exercise_pagination.esercizi')}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev || isLoading}
          onClick={handlePrev}
          type="button"
        >
          Indietro
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext || isLoading}
          onClick={handleNext}
          type="button"
        >
          Avanti
        </Button>
      </div>
    </div>
  );
}
