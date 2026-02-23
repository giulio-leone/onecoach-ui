/**
 * ExercisesAdminPanel
 *
 * Pannello di amministrazione per gli esercizi.
 * Implementa design Glassmorphism e gestione stato ottimizzata.
 * Mirroring struttura FoodsAdminPanel per coerenza UX/DX.
 */

'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Button,
  CatalogGrid,
  CatalogHeader,
  GlassTable,
  GlassToolbar,
  ResourceCard,
  type GlassTableColumn,
  Select,
} from '@giulio-leone/ui';
import { Edit, Trash2, Sparkles, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  useExerciseFilters,
  useExercises,
  useDeleteExercise,
  useBatchExerciseOperations,
} from '@giulio-leone/features/exercise/hooks';
import type { ExercisesResponse } from '@giulio-leone/lib-api-client';
import type { LocalizedExercise } from '@giulio-leone/lib-exercise';
import type { AdminExercise } from './types';

import { ExercisePagination } from './exercise-pagination';
import { ExerciseBulkActions } from './exercise-bulk-actions';
import { ExerciseFormModal } from './exercise-form-modal';
import { ExerciseFilters } from './exercise-filters';
import { ExerciseDetailDrawer } from './exercise-detail-drawer';
import { type FilterStatus } from './exercise-constants';

import { logger } from '@giulio-leone/lib-shared';

interface ExercisesAdminPanelProps {
  initialData: ExercisesResponse;
  locale: string;
}

export function ExercisesAdminPanel({ initialData, locale }: ExercisesAdminPanelProps) {
  const t = useTranslations('admin.exercises');
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');

  // State
  const { filters, setFilters, debounced, isActive, reset } = useExerciseFilters();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [detailExerciseId, setDetailExerciseId] = useState<string | null>(null); // For Drawer
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false); // Toggle advanced filters

  // Mutations
  const deleteExercise = useDeleteExercise();
  const batchOperations = useBatchExerciseOperations();

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Derived Query Params
  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 20,
      search: debounced.search,
      locale,
      approvalStatus: debounced.approvalStatus !== 'ALL' ? debounced.approvalStatus : undefined,
      muscleIds: debounced.muscleIds,
      exerciseTypeId: debounced.exerciseTypeId,
      bodyPartIds: debounced.bodyPartIds,
      equipmentIds: debounced.equipmentIds,
      includeTranslations: true,
      includeUnapproved: true, // Admin sees unapproved by default
    }),
    [page, debounced, locale]
  );

  // Data Query
  const { data, isLoading, refetch } = useExercises(queryParams);
  const exercises = (data?.data ?? initialData.data) as AdminExercise[];
  const total = data?.total ?? initialData.total ?? 0;

  // Selection Logic
  const handleSelectAll = () => {
    if (selectedIds.length === exercises.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(exercises.map((e) => e.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Actions
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(tAdmin('deleteConfirm'))) return;

    try {
      await deleteExercise.mutateAsync(id);
      if (selectedIds.includes(id)) {
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      }
      if (detailExerciseId === id) setDetailExerciseId(null);
      refetch(); // Refresh list
    } catch (error) {
      logger.error(tCommon('errors.deleteFailed'), error);
      alert(tCommon('errors.deleteFailed'));
    }
  };

  const handleEdit = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingExerciseId(id);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Stats for Header
  const stats = useMemo(
    () => [
      { label: t('stats.total'), value: total },
      {
        label: t('stats.approved'),
        value: exercises.filter((i) => i.approvalStatus === 'APPROVED').length,
      },
      {
        label: t('stats.pending'),
        value: exercises.filter((i) => i.approvalStatus === 'PENDING').length,
      },
    ],
    [total, exercises, t]
  );

  // Table Columns
  const columns: GlassTableColumn<AdminExercise>[] = [
    {
      header: t('columns.name'),
      cell: (item: AdminExercise) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.name}</span>
          {/* Show thumbnail if available for premium feel */}
          {item.gifUrl && (
            <span className="text-[10px] text-neutral-400">
              {t('admin.exercise_admin_panel.gif_available')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('columns.muscles'),
      cell: (item: AdminExercise) =>
        item.muscles
          ?.slice(0, 3)
          .map((m) => m.name)
          .join(', ') + (item.muscles && item.muscles.length > 3 ? '...' : '') || '-',
    },
    {
      header: t('columns.status'),
      cell: (item: AdminExercise) => {
        const status = item.approvalStatus || 'UNKNOWN';
        const colorClass =
          status === 'APPROVED'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

        const label =
          status === 'APPROVED' || status === 'PENDING' || status === 'REJECTED'
            ? t(`status.${status}`)
            : status;

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: t('columns.date'),
      cell: (item: AdminExercise) => new Date(item.createdAt || Date.now()).toLocaleDateString(),
    },
    {
      header: t('columns.actions'),
      className: 'text-right',
      cell: (item: AdminExercise) => (
        <div className="flex justify-end gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setDetailExerciseId(item.id);
            }}
            aria-label={t('actions.view')}
          >
            <Eye size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={(e: React.MouseEvent) => handleEdit(item.id, e)}
            aria-label={t('actions.edit')}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="icon-sm"
            variant="danger"
            onClick={(e: React.MouseEvent) => handleDelete(item.id, e)}
            aria-label={t('actions.delete')}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in space-y-6 pb-20 duration-500">
      {/* Header */}
      <CatalogHeader
        title={t('title')}
        description={t('description')}
        stats={stats}
        onAdd={() => setShowCreateModal(true)}
        addLabel={t('newExercise')}
      />

      {/* Toolbar & Filters */}
      <div className="sticky top-4 z-30 space-y-4">
        {/* Advanced Filters Toggable Area or Standard */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-4 fade-in relative z-50 duration-200">
            <ExerciseFilters
              statusFilter={(filters.approvalStatus || 'ALL') as FilterStatus}
              onStatusChange={(v: typeof filters.approvalStatus) =>
                setFilters((prev) => ({ ...prev, approvalStatus: v }))
              }
              onTypeChange={(id) => setFilters((prev) => ({ ...prev, exerciseTypeId: id }))}
              onEquipmentsChange={(ids) => setFilters((prev) => ({ ...prev, equipmentIds: ids }))}
              onBodyPartsChange={(ids) => setFilters((prev) => ({ ...prev, bodyPartIds: ids }))}
              muscleIds={filters.muscleIds}
              onMusclesChange={({ primary, secondary }) => {
                const allMuscles = [...primary, ...secondary];
                setFilters((prev) => ({
                  ...prev,
                  muscleIds: allMuscles.length ? allMuscles : undefined,
                }));
              }}
              onReset={reset}
            />
          </div>
        )}

        <GlassToolbar
          searchQuery={filters.search || ''}
          onSearchChange={(v: string) => setFilters((prev) => ({ ...prev, search: v }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          className="shadow-lg backdrop-blur-md"
        >
          {/* Integrated Status Filter for Quick Access - matching FoodsAdminPanel macro selector style */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.approvalStatus || 'ALL'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters((prev) => ({
                  ...prev,
                  approvalStatus: e.target.value as FilterStatus,
                }))
              }
              className="h-9 w-[150px] rounded-lg border-neutral-200 bg-white/50 text-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-black/50"
            >
              <option value="ALL">{t('status.ALL')}</option>
              <option value="APPROVED">{t('status.APPROVED')}</option>
              <option value="PENDING">{t('status.PENDING')}</option>
              <option value="REJECTED">{t('status.REJECTED')}</option>
            </Select>

            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t('filters')}
            </Button>
          </div>
        </GlassToolbar>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="animate-in slide-in-from-top-2">
            <ExerciseBulkActions
              selectedCount={selectedIds.length}
              totalCount={total || 0}
              isAllSelected={selectedIds.length === exercises.length && exercises.length > 0}
              onSelectAll={handleSelectAll}
              onApprove={async () => {
                await batchOperations.mutateAsync({ action: 'approve', ids: selectedIds });
                setSelectedIds([]);
                refetch();
              }}
              onReject={async () => {
                await batchOperations.mutateAsync({ action: 'reject', ids: selectedIds });
                setSelectedIds([]);
                refetch();
              }}
              onDelete={async () => {
                if (!confirm(tAdmin('bulkDeleteConfirm', { count: selectedIds.length }))) return;
                await batchOperations.mutateAsync({ action: 'delete', ids: selectedIds });
                setSelectedIds([]);
                refetch();
              }}
              isLoading={batchOperations.isPending}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        }
      >
        <div className="relative min-h-[400px]">
          {viewMode === 'list' ? (
            <GlassTable
              data={exercises}
              columns={columns}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onSelectRow={(id) => handleSelectOne(String(id))}
              onSelectAll={handleSelectAll}
              isAllSelected={selectedIds.length === exercises.length && exercises.length > 0}
              keyExtractor={(item: AdminExercise) => item.id}
              onRowClick={(item: AdminExercise) => setDetailExerciseId(item.id)}
            />
          ) : (
            <CatalogGrid>
              {exercises.map((exercise) => (
                <ResourceCard
                  key={exercise.id}
                  title={exercise.name}
                  subtitle={
                    exercise.muscles
                      ?.slice(0, 3)
                      .map((m) => m.name)
                      .join(', ') || t('empty')
                  }
                  imageSrc={exercise.gifUrl || exercise.thumbnailUrl || undefined}
                  stats={[
                    {
                      label: t('columns.status'),
                      value: exercise.approvalStatus
                        ? t(`status.${exercise.approvalStatus}`)
                        : 'Unknown',
                    },
                  ]}
                  actions={[
                    {
                      label: t('actions.edit'),
                      onClick: () => setEditingExerciseId(exercise.id),
                      icon: <Edit size={16} />,
                    },
                    {
                      label: t('actions.delete'),
                      onClick: () => handleDelete(exercise.id),
                      icon: <Trash2 size={16} />,
                      variant: 'destructive',
                    },
                  ]}
                  isSelected={selectedIds.includes(exercise.id)}
                  onSelect={() => handleSelectOne(exercise.id)}
                  onClick={() => setDetailExerciseId(exercise.id)}
                />
              ))}
            </CatalogGrid>
          )}

          {/* Empty State */}
          {!isLoading && exercises.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/50">
              <p className="text-neutral-500">{t('empty')}</p>
              {isActive && (
                <Button variant="ghost" onClick={reset}>
                  {t('resetFilters')}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="sticky bottom-4 z-30">
          <div className="rounded-2xl border border-white/20 bg-white/80 p-2 shadow-lg backdrop-blur-xl dark:bg-neutral-900/80">
            <ExercisePagination
              page={page}
              total={total || 0}
              totalPages={0} // let component calculate
              onPageChange={setPage}
            />
          </div>
        </div>
      </Suspense>

      {/* Modals & Drawers */}
      {showCreateModal && (
        <ExerciseFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          mode="create"
          onSuccess={handleRefresh}
        />
      )}

      {editingExerciseId && (
        <ExerciseFormModal
          isOpen={!!editingExerciseId}
          onClose={() => setEditingExerciseId(null)}
          exerciseId={editingExerciseId}
          mode="edit"
          onSuccess={handleRefresh}
        />
      )}

      {detailExerciseId && (
        <ExerciseDetailDrawer
          isOpen={!!detailExerciseId}
          exercise={exercises.find((e) => e.id === detailExerciseId) as LocalizedExercise}
          onClose={() => setDetailExerciseId(null)}
          onEdit={() => {
            setDetailExerciseId(null);
            setEditingExerciseId(detailExerciseId);
          }}
          onDelete={() => {
            handleDelete(detailExerciseId);
          }}
          onApprove={() => {
            /* TODO: Implement quick approval */
          }}
        />
      )}
    </div>
  );
}
