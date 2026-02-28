'use client';

import { Button, Checkbox } from '@giulio-leone/ui';
import { cn } from '@giulio-leone/lib-design-system';
import { ShieldCheck, ShieldX, Trash2 } from 'lucide-react';

interface ExerciseBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

/**
 * Componente azioni batch responsive
 * Dark mode ottimizzata
 */
export function ExerciseBulkActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onApprove,
  onReject,
  onDelete,
  isLoading = false,
}: ExerciseBulkActionsProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        'rounded-xl border p-4',
        'border-neutral-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-950'
      )}
    >
      {/* Selezione */}
      <div className="flex items-center gap-3">
        <Checkbox checked={isAllSelected} onChange={onSelectAll} />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          Selezionati {selectedCount} su {totalCount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={<ShieldCheck />}
          onClick={onApprove}
          disabled={!hasSelection || isLoading}
        >
          Approva
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<ShieldX />}
          onClick={onReject}
          disabled={!hasSelection || isLoading}
        >
          Rifiuta
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 />}
          onClick={onDelete}
          disabled={!hasSelection || isLoading}
        >
          Elimina
        </Button>
      </div>
    </div>
  );
}
