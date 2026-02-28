'use client';

import { useTranslations } from 'next-intl';
/**
 * FoodBulkActions
 *
 * Componente per operazioni CRUD in bulk su alimenti selezionati
 */

import { useState } from 'react';
import { Button, Checkbox } from '@giulio-leone/ui';
import { Trash2, Edit, X } from 'lucide-react';
import { useBatchFoodOperations } from '@giulio-leone/features/food/hooks';

interface FoodBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function FoodBulkActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  selectedIds,
  onSuccess,
}: FoodBulkActionsProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const batchOperations = useBatchFoodOperations();

  const handleDelete = async () => {
    if (selectedCount === 0) return;
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(
      `Eliminare ${selectedCount} elemento${selectedCount > 1 ? 'i' : ''} selezionato${selectedCount > 1 ? 'i' : ''}?`
    );
    if (!confirmed) return;

    try {
      await batchOperations.mutateAsync({
        action: 'delete',
        ids: selectedIds,
      });
      onSuccess();
    } catch (error: unknown) {
      const { dialog: dialogUtil } = await import('@giulio-leone/lib-stores');
      await dialogUtil.alert(
        error instanceof Error ? error.message : "Errore durante l'eliminazione"
      );
    }
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    try {
      await batchOperations.mutateAsync({
        action: 'update',
        ids: selectedIds,
        data,
      });
      setShowUpdateModal(false);
      onSuccess();
    } catch (error: unknown) {
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.alert(error instanceof Error ? error.message : "Errore durante l'aggiornamento");
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100">
        {/* Selezione */}
        <div className="flex items-center gap-3">
          <Checkbox checked={isAllSelected} onChange={onSelectAll} />
          <span className="text-sm font-medium">
            Selezionati {selectedCount} su {totalCount}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdateModal(true)}
            disabled={batchOperations.isPending}
          >
            <Edit className="mr-2 h-4 w-4" /> Aggiorna
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={batchOperations.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Elimina
          </Button>
        </div>
      </div>

      {showUpdateModal && (
        <FoodBulkUpdateModal
          selectedCount={selectedCount}
          onUpdate={handleUpdate}
          onClose={() => setShowUpdateModal(false)}
        />
      )}
    </>
  );
}

interface FoodBulkUpdateModalProps {
  selectedCount: number;
  onUpdate: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

function FoodBulkUpdateModal({ selectedCount, onUpdate, onClose }: FoodBulkUpdateModalProps) {
  const t = useTranslations('admin');
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) {
      onClose();
      return;
    }
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Aggiorna {selectedCount} elemento{selectedCount > 1 ? 'i' : ''}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-white/[0.06]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.food_bulk_actions.brand_opzionale')}
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-white/[0.04]"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, brand: e.target.value || undefined }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('admin.food_bulk_actions.categoria_opzionale')}
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-white/[0.04]"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  metadata: {
                    ...((prev.metadata as Record<string, unknown>) || {}),
                    category: e.target.value || undefined,
                  },
                }))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">Aggiorna</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
