/**
 * Saved Nutrition Plans Component
 *
 * Displays a list of user's saved nutrition plans
 * Refactored to match SavedWorkoutPrograms structure (DRY)
 * Con GeneratingCard per mostrare generazioni AI in corso
 */

'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
  useNutritionPlans,
  useDeleteNutritionPlan,
  useDuplicateNutritionPlan,
} from '@giulio-leone/features/nutrition';
import { SelectionToolbar, useSupabaseContext } from '@giulio-leone/ui';
import { DeployToClientsModal } from '@giulio-leone/ui/coach';
import { useSession } from 'next-auth/react';
import { ErrorState } from '@giulio-leone/ui/components';
import { useUserActiveGenerations } from '@giulio-leone/hooks';
import { useTranslations } from 'next-intl';
import { NutritionPlanCard } from '@giulio-leone/ui/nutrition';
import { NutritionGeneratingCard } from './nutrition-generating-card';
import type { NutritionPlan } from '@giulio-leone/types/nutrition';

export interface SavedNutritionPlansRef {
  refresh: () => void;
}

export const SavedNutritionPlans = forwardRef<SavedNutritionPlansRef>((_props, ref) => {
  const t = useTranslations('nutrition.saved');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();
  const { supabase } = useSupabaseContext();
  const { data, isLoading, error, refetch } = useNutritionPlans();
  const deletePlan = useDeleteNutritionPlan();
  const duplicatePlan = useDuplicateNutritionPlan();
  const plans = data || [];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  // Active AI generations tracking (SDK 4.0 durable mode)
  const { activeGenerations, isGenerating } = useUserActiveGenerations({
    supabase: supabase!,
    userId: session?.user?.id,
    workflowTypes: 'nutrition-generation',
    enableRealtime: !!supabase && !!session?.user?.id,
  });

  // Session and role check for deploy capability
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const canDeploy = ['COACH', 'ADMIN', 'SUPER_ADMIN'].includes(userRole || '');

  // Deploy modal state
  const [deployModal, setDeployModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const handleDeploy = (id: string, name: string) => {
    setDeployModal({ isOpen: true, id, name });
  };

  const closeDeployModal = () => {
    setDeployModal({ isOpen: false, id: '', name: '' });
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePlan.mutateAsync(id);
      const { toast } = await import('sonner');
      toast.success(t('duplicateSuccess'));
    } catch (err: unknown) {
      const { dialog } = await import('@giulio-leone/lib-stores');
      await dialog.error(err instanceof Error ? err.message : t('duplicateError'));
    }
  };

  // Expose refresh method via ref
  useImperativeHandle(ref, () => ({
    refresh: () => refetch(),
  }));

  const handleDelete = async (id: string) => {
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(t('deleteConfirm'));
    if (!confirmed) return;

    try {
      await deletePlan.mutateAsync(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      await Promise.all(Array.from(selectedIds).map((id: any) => deletePlan.mutateAsync(id as string)));
      await refetch();
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const { dialog: errDialog } = await import('@giulio-leone/lib-stores');
      await errDialog.error(err instanceof Error ? err.message : t('bulkDeleteError'));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === plans.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(plans.map((p: { id: string }) => p.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Loading state - matches SavedWorkoutPrograms style
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i: any) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-neutral-800" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error instanceof Error ? error : new Error(t('loadError'))}
        title={tCommon('ui.errorTitle')}
        description={tCommon('ui.errorDescription')}
      />
    );
  }

  // Empty state - matches SavedWorkoutPrograms style
  if (plans.length === 0) {
    return (
      <div className="space-y-6">
        {/* Active AI Generations even with empty plans */}
        {isGenerating && (
          <div className="space-y-3">
            {activeGenerations.map((gen: any) => (
              <NutritionGeneratingCard key={gen.run_id} generation={gen} />
            ))}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/nutrition/create"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-900/10"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors group-hover:bg-emerald-900/30 group-hover:text-emerald-400">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-semibold text-neutral-400 transition-colors group-hover:text-emerald-300">
              {t('createNew')}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active AI Generations (SDK 4.0 Durable Mode) */}
      {isGenerating && (
        <div className="space-y-3">
          {activeGenerations.map((gen: any) => (
            <NutritionGeneratingCard key={gen.run_id} generation={gen} />
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan: NutritionPlan) => {
          const isSelected = selectedIds.has(plan.id);
          return (
            <NutritionPlanCard
              key={plan.id}
              plan={plan}
              isSelected={isSelected}
              selectionMode={selectionMode}
              onToggleSelect={toggleSelect}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onDeploy={canDeploy ? handleDeploy : undefined}
            />
          );
        })}

        {/* Add New Card (Visual Placeholder) - matches workouts style */}
        <Link
          href="/nutrition/create"
          className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-900/10"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors group-hover:bg-emerald-900/30 group-hover:text-emerald-400">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-semibold text-neutral-400 transition-colors group-hover:text-emerald-300">
            {t('createNew')}
          </span>
        </Link>
      </div>

      {/* Floating Selection Toolbar */}
      <SelectionToolbar
        selectedCount={selectedIds.size}
        totalCount={plans.length}
        allSelected={selectedIds.size === plans.length && plans.length > 0}
        onToggleSelectAll={toggleSelectAll}
        onDeleteSelected={handleBulkDelete}
        onCancel={clearSelection}
        isDeleting={deletePlan.isPending}
        colorTheme="emerald"
      />

      {/* Deploy Modal */}
      <DeployToClientsModal
        isOpen={deployModal.isOpen}
        onClose={closeDeployModal}
        templateId={deployModal.id}
        templateName={deployModal.name}
        type="nutrition"
      />
    </div>
  );
});

SavedNutritionPlans.displayName = 'SavedNutritionPlans';
