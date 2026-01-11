/**
 * Saved Workout Programs Component
 *
 * Displays a list of user's saved workout programs
 * Con supporto per TRUE realtime sync via Supabase
 */

'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { darkModeClasses, cn } from '@onecoach/lib-design-system';
import { useWorkouts, useDeleteWorkout, useDuplicateWorkout } from '@onecoach/features/workout';
import { ErrorState } from '@onecoach/ui/components';
import { WorkoutCard } from './workout-card';
import { useWorkoutsListRealtime } from '@/hooks/use-workouts-realtime';
import { SelectionToolbar } from '@/components/ui/selection-toolbar';
import { DeployToClientsModal } from '@/components/coach/deploy-to-clients-modal';
import { useTranslations } from 'next-intl';

export interface SavedWorkoutProgramsRef {
  refresh: () => void;
}

export const SavedWorkoutPrograms = forwardRef<SavedWorkoutProgramsRef>((_props, ref) => {
  const t = useTranslations('workouts.saved');
  const tCommon = useTranslations('common');
  const { data, isLoading, error, refetch } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();
  const duplicateWorkout = useDuplicateWorkout();

  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deployModal, setDeployModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const programs = data?.programs || [];
  const selectionMode = selectedIds.size > 0;
  // Assuming coach can deploy. In a real app check user role.
  const canDeploy = true;

  // Enable realtime updates
  useWorkoutsListRealtime();

  useImperativeHandle(ref, () => ({
    refresh: refetch,
  }));

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === programs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(programs.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDeploy = (id: string, name: string) => {
    setDeployModal({ isOpen: true, id, name });
  };

  const closeDeployModal = () => {
    setDeployModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateWorkout.mutateAsync(id);
      const { toast } = await import('sonner');
      toast.success(t('duplicateSuccess'));
    } catch (err: unknown) {
      const { dialog } = await import('@onecoach/lib-stores');
      await dialog.error(err instanceof Error ? err.message : t('duplicateError'));
    }
  };

  const handleDelete = async (id: string) => {
    const { dialog } = await import('@onecoach/lib-stores');
    const confirmed = await dialog.confirm(t('deleteConfirm'));
    if (!confirmed) return;

    try {
      await deleteWorkout.mutateAsync(id);
      const { toast } = await import('sonner');
      toast.success(tCommon('success'));
    } catch (err: unknown) {
      const { dialog: errorDialog } = await import('@onecoach/lib-stores');
      await errorDialog.error(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const { dialog } = await import('@onecoach/lib-stores');
    const confirmed = await dialog.confirm(t('bulkDeleteConfirm', { count: selectedIds.size }));
    if (!confirmed) return;

    try {
      // Using Promise.all for bulk delete as a simple implementation if no bulk API exists
      // Or use deleteWorkout.mutateAsync in parallel
      const deletePromises = Array.from(selectedIds).map((id) => deleteWorkout.mutateAsync(id));
      await Promise.all(deletePromises);

      const { toast } = await import('sonner');
      toast.success(tCommon('success'));
      clearSelection();
    } catch (err: unknown) {
      const { dialog } = await import('@onecoach/lib-stores');
      await dialog.error(err instanceof Error ? err.message : t('bulkDeleteError'));
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'overflow-x-hidden rounded-xl border p-4 shadow-sm sm:p-6',
          darkModeClasses.card.base
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={cn('text-lg font-semibold sm:text-xl', darkModeClasses.text.primary)}>
            {t('title')}
          </h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'overflow-x-hidden rounded-xl border p-4 shadow-sm sm:p-6',
          darkModeClasses.card.base
        )}
      >
        <h2 className={cn('mb-4 text-lg font-semibold sm:text-xl', darkModeClasses.text.primary)}>
          {t('title')}
        </h2>
        <ErrorState
          error={error instanceof Error ? error : new Error(t('loadError'))}
          title={tCommon('ui.errorTitle')}
          description={tCommon('ui.errorDescription')}
        />
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div
        className={cn(
          'overflow-x-hidden rounded-xl border p-8 text-center shadow-sm',
          darkModeClasses.card.base
        )}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Plus className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('empty.title')}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {t('empty.description')}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/workouts/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t('createManually')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => {
          const isSelected = selectedIds.has(program.id);
          return (
            <WorkoutCard
              key={program.id}
              program={program}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onDeploy={canDeploy ? handleDeploy : undefined}
              onToggleSelect={toggleSelect}
              isSelected={isSelected}
              selectionMode={selectionMode}
            />
          );
        })}

        {/* Add New Card (Visual Placeholder) */}
        <Link
          href="/workouts/create"
          className={cn(
            'group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-200',
            'border-neutral-200 hover:border-blue-500 hover:bg-blue-50/50',
            'dark:border-neutral-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10'
          )}
        >
          <div
            className={cn(
              'mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors',
              'bg-neutral-100 text-neutral-400 group-hover:bg-blue-100 group-hover:text-blue-600',
              'dark:bg-neutral-800 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400'
            )}
          >
            <Plus className="h-6 w-6" />
          </div>
          <span
            className={cn(
              'font-semibold transition-colors',
              'text-neutral-600 group-hover:text-blue-700',
              'dark:text-neutral-400 dark:group-hover:text-blue-300'
            )}
          >
            {t('createNew')}
          </span>
        </Link>
      </div>

      {/* Floating Selection Toolbar */}
      <SelectionToolbar
        selectedCount={selectedIds.size}
        totalCount={programs.length}
        allSelected={selectedIds.size === programs.length && programs.length > 0}
        onToggleSelectAll={toggleSelectAll}
        onDeleteSelected={handleBulkDelete}
        onCancel={clearSelection}
        colorTheme="blue"
      />

      {/* Deploy Modal */}
      <DeployToClientsModal
        isOpen={deployModal.isOpen}
        onClose={closeDeployModal}
        templateId={deployModal.id}
        templateName={deployModal.name}
        type="workout"
      />
    </div>
  );
});

SavedWorkoutPrograms.displayName = 'SavedWorkoutPrograms';
