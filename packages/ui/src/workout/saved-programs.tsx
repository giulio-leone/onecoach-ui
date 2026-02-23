/**
 * Saved Workout Programs Component
 *
 * Displays a list of user's saved workout programs
 * Con supporto per TRUE realtime sync via Supabase
 * Con GeneratingCard per mostrare generazioni AI in corso
 */

'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useWorkouts, useDeleteWorkout, useDuplicateWorkout } from '@giulio-leone/features/workout';
import { ErrorState } from '@giulio-leone/ui/components';
import { SelectionToolbar, useSupabaseContext } from '@giulio-leone/ui';
import { useUserActiveGenerations, type GenerationWithStatus } from '@giulio-leone/hooks';
import { DeployToClientsModal } from '@giulio-leone/ui/coach';
import { WorkoutCard } from './workout-card';
import { WorkoutGeneratingCard } from './workout-generating-card';
import { useTranslations } from 'next-intl';
import type { WorkoutProgram } from '@giulio-leone/types/workout';

export interface SavedWorkoutProgramsRef {
  refresh: () => void;
}

export const SavedWorkoutPrograms = forwardRef<SavedWorkoutProgramsRef>((_props, ref) => {
  const t = useTranslations('workouts.saved');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const { supabase } = useSupabaseContext();
  const { data, isLoading, error, refetch } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();
  const duplicateWorkout = useDuplicateWorkout();

  // Active AI generations tracking (SDK 4.0 durable mode)
  const { activeGenerations, isGenerating } = useUserActiveGenerations({
    supabase: supabase!,
    userId: session?.user?.id,
    workflowTypes: 'workout-generation',
    enableRealtime: !!supabase && !!session?.user?.id,
  });

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
      setSelectedIds(new Set(programs.map((p: WorkoutProgram) => p.id)));
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
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.error(err instanceof Error ? err.message : t('duplicateError'));
    }
  };

  const handleDelete = async (id: string) => {
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(t('deleteConfirm'));
    if (!confirmed) return;

    try {
      await deleteWorkout.mutateAsync(id);
      const { toast } = await import('sonner');
      toast.success(tCommon('success'));
    } catch (err: unknown) {
      const { dialog: errorDialog } = await import('@giulio-leone/lib-stores');
      await errorDialog.error(err instanceof Error ? err.message : t('deleteError'));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const { dialog } = await import('@giulio-leone/lib-stores');
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
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.error(err instanceof Error ? err.message : t('bulkDeleteError'));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-lg backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{t('title')}</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-lg backdrop-blur-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">{t('title')}</h2>
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
      <div className="space-y-6">
        {/* Active AI Generations even with empty programs */}
        {isGenerating && (
          <div className="space-y-3">
            {activeGenerations.map((gen: GenerationWithStatus) => (
              <WorkoutGeneratingCard key={gen.run_id} generation={gen} />
            ))}
          </div>
        )}

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-8 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
            <Plus className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{t('empty.title')}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-400">{t('empty.description')}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/workouts/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              {t('createManually')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active AI Generations (SDK 4.0 Durable Mode) */}
      {isGenerating && (
        <div className="space-y-3">
          {activeGenerations.map((gen: GenerationWithStatus) => (
            <WorkoutGeneratingCard key={gen.run_id} generation={gen} />
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program: WorkoutProgram) => {
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
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 p-6 transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-900/10"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors group-hover:bg-indigo-900/30 group-hover:text-indigo-400">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-semibold text-neutral-400 transition-colors group-hover:text-indigo-300">
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
        colorTheme="indigo"
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
