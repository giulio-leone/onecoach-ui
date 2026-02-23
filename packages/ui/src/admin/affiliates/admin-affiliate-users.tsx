'use client';

import { useTranslations } from 'next-intl';
/**
 * Admin Affiliate Users Component
 *
 * Lista top affiliati con ricerca e filtri - Refactored
 * Uses Catalog Design System
 */

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useRouter } from '@giulio-leone/ui';
import { CatalogToolbar, CatalogGrid, ResourceCard } from '@giulio-leone/ui';

interface AdminAffiliateUsersProps {
  affiliates: Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    code: string;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    joinedAt: Date;
  }>;
}

type Affiliate = AdminAffiliateUsersProps['affiliates'][number];

export function AdminAffiliateUsers({ affiliates }: AdminAffiliateUsersProps) {
  const t = useTranslations('admin');

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'referrals' | 'earnings' | 'joined'>('referrals');
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredAndSortedAffiliates = affiliates
    .filter(
      (affiliate: Affiliate) =>
        affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Affiliate, b: Affiliate) => {
      switch (sortBy) {
        case 'referrals':
          return b.totalReferrals - a.totalReferrals;
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        case 'joined':
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default:
          return 0;
      }
    });

  const getTopPerformerBadge = (index: number) => {
    if (index === 0) return 'Top Performer';
    if (index === 1) return '2° Posto';
    if (index === 2) return '3° Posto';
    return null;
  };

  // Sorting options for Toolbar
  // Since Toolbar filters are usually pills, we can use them for sorting here or just use a simple dropdown if toolbar doesn't support sort yet.
  // CatalogToolbar supports `filterOptions`. We can repurpose it for sort or add a sort dropdown later.
  // For now, let's assume standard toolbar search.

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {t('admin.admin_affiliate_users.top_affiliati')}
        </h3>
        {/* Simple Sort Dropdown (could be integrated into Toolbar later) */}
        <select
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortBy(e.target.value as 'referrals' | 'earnings' | 'joined')
          }
          className="rounded-lg border-none bg-neutral-100 py-1.5 text-sm font-medium text-neutral-600 focus:ring-0 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <option value="referrals">{t('admin.admin_affiliate_users.per_referral')}</option>
          <option value="earnings">{t('admin.admin_affiliate_users.per_guadagni')}</option>
          <option value="joined">{t('admin.admin_affiliate_users.per_data')}</option>
        </select>
      </div>

      <CatalogToolbar
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        // Hide filters for now as we used custom sort select above
        filterOptions={[]}
        className="sticky top-0 z-10"
      />

      <CatalogGrid
        emptyState={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-500">
              {t('admin.admin_affiliate_users.nessun_affiliato_trovato')}
            </p>
          </div>
        }
      >
        {filteredAndSortedAffiliates.slice(0, 10).map((affiliate, index) => {
          const rankBadge = getTopPerformerBadge(index);
          const badges = rankBadge ? [rankBadge] : [];
          badges.push(`Codice: ${affiliate.code}`);

          const stats = [
            { label: 'Referral', value: affiliate.totalReferrals },
            { label: 'Attivi', value: affiliate.activeReferrals },
            { label: 'Guadagni', value: formatCurrency(affiliate.totalEarnings) },
          ];

          return (
            <ResourceCard
              key={affiliate.id}
              title={affiliate.name}
              subtitle={affiliate.email}
              imageSrc={null} // Placeholder will be used
              badges={badges}
              stats={stats}
              onClick={() => router.push(`/admin/users/${affiliate.userId}`)}
              actions={[
                {
                  label: 'Profilo Utente',
                  icon: <ExternalLink size={16} />,
                  onClick: () => router.push(`/admin/users/${affiliate.userId}`),
                },
              ]}
            />
          );
        })}
      </CatalogGrid>
    </div>
  );
}
