'use client';

import { useTranslations } from 'next-intl';
/**
 * FoodPagination
 */

import { useCallback } from 'react';
import { Button } from '@onecoach/ui';

interface FoodPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function FoodPagination({ page, pageSize, total, onPageChange }: FoodPaginationProps) {
  const t = useTranslations('admin');

  const totalPages = Math.max(Math.ceil(total / Math.max(pageSize, 1)), 1);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Handler stabili per evitare problemi di re-render
  const handlePrev = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (canPrev) {
        onPageChange(page - 1);
      }
    },
    [canPrev, page, onPageChange]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (canNext) {
        onPageChange(page + 1);
      }
    },
    [canNext, page, onPageChange]
  );

  return (
    <div className="flex items-center justify-between py-3 text-sm text-neutral-600 dark:text-neutral-400">
      <div>
        Pagina {page} di {totalPages} ({total} {t('food_pagination.elementi')}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!canPrev} onClick={handlePrev} type="button">
          Indietro
        </Button>
        <Button variant="outline" size="sm" disabled={!canNext} onClick={handleNext} type="button">
          Avanti
        </Button>
      </div>
    </div>
  );
}
