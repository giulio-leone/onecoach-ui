/**
 * Coach Clients List Component
 *
 * Display list of coach's clients with search and filters
 */

'use client';

import { useState } from 'react';
import { Input, Select, Heading, Text } from '@giulio-leone/ui';
import { CoachClientCard } from './coach-client-card';
import { useCoachClients } from '@giulio-leone/features/coach/hooks';
import { LoadingState, ErrorState } from '@giulio-leone/ui/components';
// ... imports ...
import { useTranslations } from 'next-intl';
import { Search, Users } from 'lucide-react';

export function CoachClientsList() {
  const t = useTranslations('coach.clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'programsPurchased' | 'lastActive'>(
    'lastActive'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filters = {
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, error } = useCoachClients(filters);

  if (isLoading) {
    return <LoadingState message={t('loading')} size="md" />;
  }

  if (error) {
    return (
      <ErrorState
        error={error instanceof Error ? error : new Error(t('errorLoading'))}
        title={t('errorLoading')}
      />
    );
  }

  if (!data || data.clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
        <Heading level={3} size="lg" weight="semibold" className="mb-2">{t('empty.title')}</Heading>
        <Text className="text-neutral-500 dark:text-neutral-400">{t('empty.description')}</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sort By */}
        <Select
          value={sortBy}
          onValueChange={(value: string) =>
            setSortBy(value as 'name' | 'totalSpent' | 'programsPurchased' | 'lastActive')
          }
        >
          <option value="lastActive">{t('sort.lastActive')}</option>
          <option value="name">{t('sort.name')}</option>
          <option value="totalSpent">{t('sort.totalSpent')}</option>
          <option value="programsPurchased">{t('sort.programsPurchased')}</option>
        </Select>

        {/* Sort Order */}
        <Select
          value={sortOrder}
          onValueChange={(value: string) => setSortOrder(value as 'asc' | 'desc')}
        >
          <option value="desc">{t('sort.desc')}</option>
          <option value="asc">{t('sort.asc')}</option>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {t('resultsCount', { count: data.total })}
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.clients.map((client) => (
          <CoachClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}
