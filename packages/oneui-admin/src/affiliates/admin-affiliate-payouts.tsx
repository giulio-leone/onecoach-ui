'use client';

import { useTranslations } from 'next-intl';
/**
 * Admin Affiliate Payouts Component
 *
 * Gestione payout e rewards - Refactored
 * Uses Catalog Design System
 */

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { CatalogToolbar, CatalogGrid, ResourceCard, type FilterOption } from '@giulio-leone/ui';


interface AdminAffiliatePayoutsProps {
  rewards: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
    credits: number;
    level: number;
    createdAt: Date;
    pendingUntil: Date | null;
    affiliate: {
      id: string;
      name: string;
      email: string;
    };
    referredUser?: {
      name: string;
      email: string;
    };
  }>;
  pendingAmount: number;
  totalAmount: number;
}

export function AdminAffiliatePayouts({
  rewards,
  pendingAmount: _pendingAmount, // Unused in this view if handled by parent stats, but kept for interface compat
  totalAmount: _totalAmount,
}: AdminAffiliatePayoutsProps) {
  const t = useTranslations('admin');

  const [filter, setFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REGISTRATION_CREDIT':
        return 'Crediti Registrazione';
      case 'SUBSCRIPTION_COMMISSION':
        return 'Commissione Abbonamento';
      case 'BONUS':
        return 'Bonus Speciale';
      default:
        return type;
    }
  };

  const filteredRewards = rewards.filter((reward) => {
    if (filter !== 'ALL' && reward.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        reward.affiliate.name.toLowerCase().includes(query) ||
        reward.affiliate.email.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const filterOptions: FilterOption[] = [
    { label: 'Tutti', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Cleared', value: 'CLEARED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('admin.admin_affiliate_payouts.payout_rewards')}
        </h3>
      </div>

      <CatalogToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterOptions={filterOptions}
        activeFilters={filter !== 'ALL' ? [filter] : []}
        onFilterChange={(value) => setFilter(value)}
        className="sticky top-0 z-10"
      />

      <CatalogGrid
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-500">
              {t('admin.admin_affiliate_payouts.nessuna_reward_trovata')}
            </p>
          </div>
        }
      >
        {filteredRewards.map((reward) => {
          const stats = [];
          if (reward.amount > 0) {
            stats.push({ label: 'Importo', value: formatCurrency(reward.amount) });
          }
          if (reward.credits > 0) {
            stats.push({ label: 'Crediti', value: reward.credits });
          }

          const badges = [];
          if (reward.pendingUntil && new Date(reward.pendingUntil) > new Date()) {
            badges.push(`Pending fino al ${new Date(reward.pendingUntil).toLocaleDateString()}`);
          }

          return (
            <ResourceCard
              key={reward.id}
              title={getTypeLabel(reward.type)}
              subtitle={`${reward.affiliate.name} • Livello ${reward.level}`}
              imageSrc={null} // No image for transaction
              status={reward.status.toLowerCase()}
              stats={stats}
              badges={badges}
              actions={[
                {
                  label: 'Dettagli',
                  icon: <Eye size={16} />,
                  onClick: () => {
                    /* TODO: View Details Modal */
                  },
                },
              ]}
            />
          );
        })}
      </CatalogGrid>
    </div>
  );
}
