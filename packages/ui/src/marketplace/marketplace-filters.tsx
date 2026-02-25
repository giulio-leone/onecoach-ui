'use client';

import { useTranslations } from 'next-intl';
/**
 * Marketplace Filters Component
 *
 * Filters and search for marketplace plans
 * Following KISS principles
 */

import { Search } from 'lucide-react';
import { Input } from '../input';

export interface MarketplaceFilters {
  planType?: 'WORKOUT' | 'NUTRITION';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchQuery?: string;
  sortBy?: 'rating' | 'price' | 'recent' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

interface MarketplaceFiltersProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
}

export function MarketplaceFiltersComponent({ filters, onChange }: MarketplaceFiltersProps) {
  const t = useTranslations('common');

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 dark:bg-neutral-900">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-600" />
        <Input
          type="text"
          placeholder={t('common.marketplace_filters.search_plans')}
          value={filters.searchQuery || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ ...filters, searchQuery: e.target.value })
          }
          className="pl-10"
        />
      </div>

      {/* Plan Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('common.marketplace_filters.plan_type')}</label>
        <div className="flex gap-2">
          <button
            onClick={() =>
              onChange({
                ...filters,
                planType: undefined,
              })
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !filters.planType
                ? 'bg-orange-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() =>
              onChange({
                ...filters,
                planType: 'WORKOUT',
              })
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filters.planType === 'WORKOUT'
                ? 'bg-orange-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800'
            }`}
          >
            {t('common.marketplace_filters.workout')}
          </button>
          <button
            onClick={() =>
              onChange({
                ...filters,
                planType: 'NUTRITION',
              })
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filters.planType === 'NUTRITION'
                ? 'bg-orange-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800'
            }`}
          >
            {t('common.marketplace_filters.nutrition')}
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('common.marketplace_filters.price_range')}</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            min={0}
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('common.marketplace_filters.minimum_rating')}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onChange({
                  ...filters,
                  minRating: rating === filters.minRating ? undefined : rating,
                })
              }
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                filters.minRating === rating
                  ? 'bg-yellow-400 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800'
              }`}
            >
              {rating}★
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('common.marketplace_filters.sort_by')}</label>
        <select
          value={filters.sortBy || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange({
              ...filters,
              sortBy: e.target.value as MarketplaceFilters['sortBy'],
            })
          }
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">Default</option>
          <option value="rating">Rating</option>
          <option value="price">Price</option>
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          onChange({
            planType: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            minRating: undefined,
            searchQuery: '',
            sortBy: undefined,
            sortOrder: undefined,
          })
        }
        className="w-full rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:bg-neutral-800"
      >
        {t('common.marketplace_filters.clear_filters')}
      </button>
    </div>
  );
}
