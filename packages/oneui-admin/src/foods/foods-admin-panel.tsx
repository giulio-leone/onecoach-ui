/**
 * Foods Admin Panel
 *
 * Pannello admin per gestione alimenti - Refactored
 * Uses new Catalog Design System components.
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Sparkles, Edit, Trash2 } from 'lucide-react';
import {
  CatalogHeader,
  CatalogGrid,
  ResourceCard,
  GlassToolbar,
  GlassTable,
  Combobox,
  type GlassTableColumn,
} from '@giulio-leone/ui';
import {
  useFoods,
  useBatchFoodOperations,
  useFoodFilters,
  useFoodSelection,
} from '@giulio-leone/features-food/hooks';
import { FoodFormModal } from './food-form-modal';
import { FoodImportModal } from './food-import-modal';
import { FoodScanModal } from './food-scan-modal';
import { FoodAiEditModal } from './food-ai-edit-modal';
import { FoodAiModal } from './food-ai-modal';
import { FoodDetailDrawer } from '@giulio-leone/ui-nutrition';
import { FoodPagination } from './food-pagination';
import { FoodBulkActions } from './food-bulk-actions';
import { sanitizeImageUrl } from '@giulio-leone/lib-shared';
import type { Food, FoodsResponse, FoodListParams } from '@giulio-leone/lib-api';
import { useAllAdminFoodsRealtime } from '@giulio-leone/hooks';

interface FoodsAdminPanelProps {
  initialData?: FoodsResponse | null;
}

export function FoodsAdminPanel({ initialData = null }: FoodsAdminPanelProps) {
  const t = useTranslations();
  // Abilita Realtime sync per alimenti admin
  useAllAdminFoodsRealtime();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list (table)
  const isFirstRender = useRef(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showAiEditModal, setShowAiEditModal] = useState(false);
  const [aiEditFoodId, setAiEditFoodId] = useState<string | null>(null);
  const [detailFoodId, setDetailFoodId] = useState<string | null>(null);
  const [editFoodId, setEditFoodId] = useState<string | null>(null);

  const { filters, setFilters: setLocalFilters, debounced, reset: _reset } = useFoodFilters();
  const [macroDominant, setMacroDominant] = useState<FoodListParams['macroDominant'] | ''>(''); // Local state for macro filter
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Local state for sort order

  const batchOperations = useBatchFoodOperations();

  // Determine sortBy based on macroDominant
  const sortBy = useMemo(() => {
    if (macroDominant === 'protein') return 'protein';
    if (macroDominant === 'carbs') return 'carbs';
    if (macroDominant === 'fats') return 'fats';
    return 'updatedAt';
  }, [macroDominant]);

  // Query params memoizzati
  const queryParams: FoodListParams = useMemo(
    () => ({
      page,
      pageSize,
      search: debounced.search,
      brandId: debounced.brandId,
      categoryIds: debounced.categoryIds,
      barcode: debounced.barcode,
      macroDominant: macroDominant || undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      pageSize,
      debounced.search,
      debounced.brandId,
      debounced.categoryIds,
      debounced.barcode,
      macroDominant,
      sortBy,
      sortOrder,
    ]
  );

  // Reset pagina quando cambiano i filtri (skip first render to avoid setState during render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debounced.search,
    debounced.brandId,
    debounced.categoryIds,
    debounced.barcode,
    macroDominant,
    sortOrder,
  ]);

  const hasActiveFilters =
    debounced.search !== '' ||
    debounced.brandId !== '' ||
    (debounced.categoryIds?.length ?? 0) > 0 ||
    debounced.barcode !== '' ||
    macroDominant !== '';

  const shouldUseInitialData = page === 1 && !hasActiveFilters && initialData !== null;

  const {
    data: foodsResponse,
    isLoading,
    refetch,
  } = useFoods(queryParams, shouldUseInitialData ? initialData : undefined);

  const items = useMemo(() => foodsResponse?.data || [], [foodsResponse?.data]);
  const total = foodsResponse?.total ?? 0;

  const selection = useFoodSelection(items);

  const handleDelete = async (_id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo alimento?')) return;
    await batchOperations.mutateAsync({ action: 'delete', ids: [_id] });
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Stats for Header
  const stats = useMemo(
    () => [
      { label: 'Totale', value: total },
      { label: 'Con Brand', value: items.filter((i: any) => i.brand || i.metadata?.brand).length },
      { label: 'Con Immagine', value: items.filter((i: any) => i.imageUrl).length },
    ],
    [total, items]
  );

  const macroOptions = [
    { label: 'Tutti i Macros', value: '' },
    { label: 'Proteine', value: 'protein' },
    { label: 'Carboidrati', value: 'carbs' },
    { label: 'Grassi', value: 'fats' },
  ];

  const sortOptions = [
    { label: 'Decrescente (Alto -> Basso)', value: 'desc' },
    { label: 'Crescente (Basso -> Alto)', value: 'asc' },
  ];

  // Table Columns
  const columns: GlassTableColumn<Food>[] = [
    {
      header: 'Alimento',
      cell: (item: any) => {
        const brandName = item.brand?.name || item.metadata?.brand;
        const sanitizedUrl = item.imageUrl ? sanitizeImageUrl(item.imageUrl) : null;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {sanitizedUrl && (
                <Image
                  src={sanitizedUrl}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <div className="font-medium text-neutral-900 dark:text-white">{item.name}</div>
              <div className="text-xs text-neutral-500">{brandName || 'Generico'}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Calorie (100g)',
      cell: (item: any) => (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {item.macrosPer100g?.calories} kcal
        </span>
      ),
    },
    {
      header: 'Macros',
      cell: (item: any) => (
        <div className="flex gap-2 text-xs text-neutral-500">
          <span className="text-blue-600 dark:text-blue-400">
            {t('admin.foods_admin_panel.p')}
            {item.macrosPer100g?.protein}g
          </span>
          <span className="text-amber-600 dark:text-amber-400">
            {t('admin.foods_admin_panel.c')}
            {item.macrosPer100g?.carbs}g
          </span>
          <span className="text-red-600 dark:text-red-400">
            {t('admin.foods_admin_panel.f')}
            {item.macrosPer100g?.fats}g
          </span>
        </div>
      ),
    },
    {
      header: 'Categoria',
      cell: (item: any) => (
        <div className="flex flex-wrap gap-1">
          {item.categories?.map((c: { id: string; name: string }) => (
            <span
              key={c.id}
              className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {c.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Azioni',
      className: 'text-right',
      cell: (item: any) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              setEditFoodId(item.id);
            }}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              setAiEditFoodId(item.id);
              setShowAiEditModal(true);
            }}
            className="rounded p-1 text-purple-500 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/30"
          >
            <Sparkles size={16} />
          </button>
          <button
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            className="rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      {/* Header */}
      <CatalogHeader
        title={t('admin.foods_admin_panel.catalogo_alimenti')}
        description={t('admin.foods_admin_panel.gestisci_il_database_centralizzato_degli')}
        stats={stats}
        onAdd={() => setShowCreateModal(true)}
        addLabel="Nuovo Alimento"
      />

      {/* New Glass Toolbar */}
      <GlassToolbar
        searchQuery={filters.search || ''}
        onSearchChange={(value) =>
          setLocalFilters((prev: typeof filters) => ({ ...prev, search: value }))
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        <Combobox
          options={macroOptions}
          value={macroDominant}
          onChange={(val) => {
            const nextValue =
              typeof val === 'string' ? (val as FoodListParams['macroDominant'] | '') : '';
            setMacroDominant(nextValue);
          }}
          placeholder={t('admin.foods_admin_panel.filtra_per_macro')}
          className="w-[180px]"
        />
        {macroDominant && (
          <Combobox
            options={sortOptions}
            value={sortOrder}
            onChange={(val) => {
              if (typeof val === 'string') {
                setSortOrder(val as 'asc' | 'desc');
              }
            }}
            placeholder="Ordinamento"
            className="w-[200px]"
          />
        )}
      </GlassToolbar>

      {/* Bulk Actions */}
      {selection.count > 0 && (
        <FoodBulkActions
          selectedCount={selection.count}
          totalCount={total}
          isAllSelected={selection.isAllSelected}
          onSelectAll={selection.toggleSelectAll}
          selectedIds={Array.from(selection.selectedIds)}
          onSuccess={() => {
            selection.clear();
            refetch();
          }}
        />
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <GlassTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item: any) => item.id}
          onRowClick={(item: any) => setDetailFoodId(item.id)}
          className="mb-8"
          selectedIds={selection.selectedIds}
          onSelectRow={selection.toggleSelect}
          onSelectAll={selection.toggleSelectAll}
          isAllSelected={selection.isAllSelected}
        />
      ) : (
        <CatalogGrid
          isLoading={isLoading}
          emptyState={
            <div className="text-center text-neutral-500">
              {t('admin.foods_admin_panel.nessun_alimento_trovato')}
            </div>
          }
        >
          {items.map((item: any) => {
            const brandName = item.brand?.name || item.metadata?.brand;
            const sanitizedUrl = item.imageUrl ? sanitizeImageUrl(item.imageUrl) : null;
            const badges: string[] = [];
            if (item.metadata?.category) badges.push(item.metadata.category);
            if (item.categories && item.categories.length > 0) {
              badges.push(...item.categories.map((c: any) => c.name));
            }

            const itemStats: { label: string; value: string }[] = [];
            if (item.macrosPer100g.calories) {
              itemStats.push({ label: 'Kcal', value: `${item.macrosPer100g.calories}` });
            }
            if (item.macrosPer100g.protein) {
              itemStats.push({ label: 'Prot', value: `${item.macrosPer100g.protein}g` });
            }

            return (
              <ResourceCard
                key={item.id}
                title={item.name}
                subtitle={brandName || 'Generico'}
                imageSrc={sanitizedUrl}
                badges={badges}
                stats={itemStats}
                onClick={() => setDetailFoodId(item.id)}
                isSelected={selection.isSelected(item.id)}
                onSelect={() => selection.toggleSelect(item.id)}
                actions={[
                  {
                    label: t('common.actions.edit'),
                    icon: <Edit size={16} />,
                    onClick: () => setEditFoodId(item.id),
                  },
                  {
                    label: 'AI Edit',
                    icon: <Sparkles size={16} />,
                    onClick: () => {
                      setAiEditFoodId(item.id);
                      setShowAiEditModal(true);
                    },
                  },
                  {
                    label: t('common.actions.delete'),
                    icon: <Trash2 size={16} />,
                    onClick: () => handleDelete(item.id),
                    variant: 'destructive',
                  },
                ]}
              />
            );
          })}
        </CatalogGrid>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-8">
          <FoodPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals & Drawers */}
      {showCreateModal && (
        <FoodFormModal
          isOpen={showCreateModal}
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      {editFoodId && (
        <FoodFormModal
          isOpen={!!editFoodId}
          mode="edit"
          foodId={editFoodId}
          onClose={() => setEditFoodId(null)}
          onSuccess={() => {
            setEditFoodId(null);
            refetch();
          }}
        />
      )}

      {showImportModal && (
        <FoodImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            setShowImportModal(false);
            refetch();
          }}
        />
      )}

      {showScanModal && (
        <FoodScanModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          onAdded={() => {
            setShowScanModal(false);
            refetch();
          }}
        />
      )}

      {showAiModal && (
        <FoodAiModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onSuccess={async (_message) => {
            setShowAiModal(false);
            await refetch();
          }}
        />
      )}

      {showAiEditModal && aiEditFoodId && (
        <FoodAiEditModal
          isOpen={showAiEditModal}
          foodId={aiEditFoodId}
          currentFoodName={items.find((f: any) => f.id === aiEditFoodId)?.name}
          onClose={() => {
            setShowAiEditModal(false);
            setAiEditFoodId(null);
          }}
          onSuccess={() => {
            setShowAiEditModal(false);
            setAiEditFoodId(null);
            refetch();
          }}
        />
      )}

      {detailFoodId && (
        <FoodDetailDrawer
          foodItemId={detailFoodId}
          isOpen={!!detailFoodId}
          onClose={() => setDetailFoodId(null)}
          onEdit={() => {
            setEditFoodId(detailFoodId);
            setDetailFoodId(null);
          }}
        />
      )}
    </div>
  );
}
