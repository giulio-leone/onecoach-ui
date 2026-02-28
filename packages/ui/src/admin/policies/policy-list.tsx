/**
 * Policy List Component
 *
 * Lista delle policy con azioni CRUD - Refactored
 * Uses Catalog Design System
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Edit2, Trash2, History, FileText } from 'lucide-react';
import { PolicyFormModal } from './policy-form-modal';
import { PolicyHistoryModal } from './policy-history-modal';
import type { PolicyWithCreator } from '@giulio-leone/lib-core/policy.service';
import { formatDate } from '@giulio-leone/lib-shared';
import {
  CatalogHeader,
  CatalogToolbar,
  CatalogGrid,
  ResourceCard,
  type FilterOption,
} from '@giulio-leone/ui';

interface PolicyListProps {
  policies: PolicyWithCreator[];
  stats: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
}

export function PolicyList({ policies: initialPolicies, stats }: PolicyListProps) {
  const t = useTranslations();
  const [policies, setPolicies] = useState(initialPolicies);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithCreator | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyPolicyId, setHistoryPolicyId] = useState<string | null>(null);

  // Filtra policy
  const filteredPolicies = policies.filter((policy: any) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || policy.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa policy?')) return;

    try {
      const response = await fetch(`/api/admin/policies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore durante l'eliminazione");
      }

      // Rimuovi la policy dalla lista
      setPolicies(policies.filter((p: any) => p.id !== id));
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Errore durante l'eliminazione della policy");
    }
  };

  const handleEdit = (policy: PolicyWithCreator) => {
    setSelectedPolicy(policy);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPolicy(null);
    setIsFormModalOpen(true);
  };

  const handleFormClose = (updatedPolicy?: PolicyWithCreator) => {
    setIsFormModalOpen(false);
    setSelectedPolicy(null);

    if (updatedPolicy) {
      // Aggiorna la lista
      setPolicies((prev) => {
        const index = prev.findIndex((p) => p.id === updatedPolicy.id);
        if (index >= 0) {
          // Update esistente
          const newPolicies = [...prev];
          newPolicies[index] = updatedPolicy;
          return newPolicies;
        } else {
          // Nuova policy
          return [updatedPolicy, ...prev];
        }
      });
    }
  };

  const handleViewHistory = (policyId: string) => {
    setHistoryPolicyId(policyId);
    setIsHistoryModalOpen(true);
  };

  const filterOptions: FilterOption[] = [
    { label: 'Tutti', value: 'ALL' },
    { label: 'Pubblicate', value: 'PUBLISHED' },
    { label: 'Bozze', value: 'DRAFT' },
    { label: 'Archiviate', value: 'ARCHIVED' },
  ];

  const headerStats = [
    { label: 'Totale', value: stats.total },
    { label: 'Pubblicate', value: stats.published },
    { label: 'Bozze', value: stats.draft },
  ];

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      {/* Header */}
      <CatalogHeader
        title={t('admin.policy_list.gestione_policy')}
        description={t('admin.policy_list.gestisci_le_policy_del_sito_privacy_term')}
        stats={headerStats}
        onAdd={handleCreate}
        addLabel="Nuova Policy"
      />

      {/* Toolbar */}
      <CatalogToolbar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterOptions={filterOptions}
        activeFilters={filterStatus !== 'ALL' ? [filterStatus] : []}
        onFilterChange={(value) => setFilterStatus(value)}
      />

      {/* Content */}
      <CatalogGrid
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-neutral-300" />
            <p className="text-neutral-500">{t('admin.policy_list.nessuna_policy_trovata')}</p>
          </div>
        }
      >
        {filteredPolicies.map((policy: any) => (
          <ResourceCard
            key={policy.id}
            title={policy.title}
            subtitle={`/${policy.slug}`}
            imageSrc={null}
            status={policy.status.toLowerCase()}
            badges={[policy.type]}
            stats={[
              { label: 'Versione', value: `v${policy.version}` },
              { label: 'Aggiornato', value: formatDate(policy.updatedAt) },
            ]}
            actions={[
              {
                label: t('common.actions.edit'),
                icon: <Edit2 size={16} />,
                onClick: () => handleEdit(policy),
              },
              {
                label: 'Storico',
                icon: <History size={16} />,
                onClick: () => handleViewHistory(policy.id),
              },
              {
                label: t('common.actions.delete'),
                icon: <Trash2 size={16} />,
                onClick: () => handleDelete(policy.id),
                variant: 'destructive',
              },
            ]}
          />
        ))}
      </CatalogGrid>

      {/* Modals */}
      <PolicyFormModal isOpen={isFormModalOpen} policy={selectedPolicy} onClose={handleFormClose} />

      {isHistoryModalOpen && historyPolicyId && (
        <PolicyHistoryModal
          policyId={historyPolicyId}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryPolicyId(null);
          }}
        />
      )}
    </div>
  );
}
