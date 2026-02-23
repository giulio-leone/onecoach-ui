'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plane } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from '@giulio-leone/ui';
import { useTranslations } from 'next-intl';
import { FlightCard } from './flight-card';
import type { Flight, RouteGroup as RouteGroupType, FlightDirection } from '@giulio-leone/lib-shared';

export interface RouteGroupProps {
  group: RouteGroupType;
  defaultExpanded?: boolean;
  showDirectionBadge?: boolean;
  direction?: FlightDirection;
  onFavoriteToggle?: (flight: Flight, isFavorite: boolean) => void;
  favoriteIds?: Set<string>;
}

export function RouteGroup({
  group,
  defaultExpanded = false,
  showDirectionBadge = false,
  direction,
  onFavoriteToggle,
  favoriteIds = new Set(),
}: RouteGroupProps) {
  const t = useTranslations('flight');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card
      variant="glass-premium"
      className={cn(
        'overflow-hidden transition-all duration-300',
        'border border-white/20 dark:border-white/10',
        isExpanded && 'ring-2 ring-blue-500/20'
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <Plane className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {group.cityFrom} <span className="text-blue-500">→</span> {group.cityTo}
            </h3>
            <p className="text-sm text-neutral-500">
              {group.flyFrom} - {group.flyTo} •{' '}
              {t('results.routeGroupCount', { count: group.flights.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium text-neutral-500 uppercase">
              {t('results.lowestFrom', { price: group.lowestPrice })}
            </p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              €{group.lowestPrice}
            </p>
          </div>
          <div
            className={cn(
              'rounded-full bg-neutral-100 p-2 transition-transform dark:bg-neutral-800',
              isExpanded && 'rotate-180'
            )}
          >
            <ChevronDown className="h-5 w-5 text-neutral-500" />
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="border-t border-white/10 p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {group.flights.map((flight, index) => (
                  <motion.div
                    key={flight.id || `flight-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FlightCard
                      flight={flight as Flight}
                      showDirectionBadge={showDirectionBadge}
                      direction={direction}
                      showFavoriteButton
                      isFavorite={favoriteIds.has(flight.id ?? '')}
                      onFavoriteToggle={onFavoriteToggle}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
