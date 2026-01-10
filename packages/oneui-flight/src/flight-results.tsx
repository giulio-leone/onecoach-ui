'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  type Flight, 
  type FlightSearchResponse, 
  type FlightDirection,
  groupFlightsByRoute,
} from '@onecoach/lib-shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plane, PlaneLanding, PlaneTakeoff, SearchX, ArrowRight } from 'lucide-react';
import { cn } from '@onecoach/lib-design-system';
import { Button, Card, EmptyState } from '@onecoach/ui';
import { FlightCard } from './flight-card';
import { RouteGroup } from './route-group';

export type { FlightSearchResponse };



export interface FlightResultsProps {
  results: FlightSearchResponse | null;
  isSearching: boolean;
  onReset: () => void;
}

// Hook per gestire i preferiti
function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Carica preferiti all'avvio
  useEffect(() => {
    fetch('/api/flight/favorites')
      .then((res) => res.json())
      .then((data) => {
        if (data.favorites) {
          const ids = new Set<string>(data.favorites.map((f: { id: string }) => f.id));
          setFavoriteIds(ids);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = useCallback(async (flight: Flight, shouldBeFavorite: boolean) => {
    const flightId = flight.id ?? `${flight.flyFrom}-${flight.flyTo}-${flight.departure.local}`;

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      shouldBeFavorite ? next.add(flightId) : next.delete(flightId);
      return next;
    });

    try {
      if (shouldBeFavorite) {
        await fetch('/api/flight/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flyFrom: flight.flyFrom,
            flyTo: flight.flyTo,
            cityFrom: flight.cityFrom,
            cityTo: flight.cityTo,
            departureDate: flight.departure.local,
            arrivalDate: flight.arrival.local,
            price: flight.price,
            deepLink: flight.deepLink,
            duration: flight.totalDurationInSeconds,
            layovers: flight.layovers?.length ?? 0,
          }),
        });
      } else {
        await fetch(`/api/flight/favorites?id=${flightId}`, { method: 'DELETE' });
      }
    } catch {
      // Rollback on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        shouldBeFavorite ? next.delete(flightId) : next.add(flightId);
        return next;
      });
    }
  }, []);

  return { favoriteIds, toggleFavorite };
}

export function FlightResults({ results, isSearching, onReset }: FlightResultsProps) {
  const t = useTranslations('flight');
  const [activeTab, setActiveTab] = useState<FlightDirection>('outbound');
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const { favoriteIds, toggleFavorite } = useFavorites();

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <Plane className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-pulse text-blue-500" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            {t('wizard.steps.tripType.title')}...
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{t('cta.description').split('.')[0]}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center py-12">
        <EmptyState
          title={t('savedSearches.empty.title')}
          description={t('savedSearches.empty.description')}
          icon={SearchX}
        />
        <Button variant="outline" onClick={onReset} className="mt-4">
          {t('results.modifySearch')}
        </Button>
      </div>
    );
  }

  // One-way results with route grouping - add defensive check
  if (results.tripType === 'one-way') {
    const flights = (results.flights ?? []) as Flight[];
    const routeGroups = groupFlightsByRoute(flights);
    const hasMultipleRoutes = routeGroups.length > 1;

    if (flights.length === 0) {
      return (
        <div className="flex flex-col items-center py-12">
          <EmptyState
            title={t('results.noOutbound')}
            description={t('savedSearches.empty.description')}
            icon={SearchX}
          />
          <Button variant="outline" onClick={onReset} className="mt-4">
            {t('results.modifySearch')}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
              {t('results.searchResults')}
            </h2>
            <p className="text-sm text-neutral-500">
              {t('results.flightsFound', { count: flights.length })}
            </p>
          </div>
          <Button variant="ghost" onClick={onReset} className="font-bold text-blue-500">
            {t('results.modifySearch')}
          </Button>
        </div>

        {hasMultipleRoutes ? (
          // Grouped by route
          <div className="flex flex-col gap-4">
            {routeGroups.map((group, index) => (
              <RouteGroup
                key={group.routeKey}
                group={group}
                defaultExpanded={index === 0}
                onFavoriteToggle={toggleFavorite}
                favoriteIds={favoriteIds}
              />
            ))}
          </div>
        ) : (
          // Simple grid for single route
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {flights.map((flight, index) => (
                <motion.div
                  key={flight.id || `flight-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <FlightCard
                    flight={flight}
                    showFavoriteButton
                    isFavorite={favoriteIds.has(flight.id ?? '')}
                    onFavoriteToggle={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            * {t('results.disclaimer')}
          </p>
        </div>
      </div>
    );
  }

  // Round-trip results - add defensive checks for undefined arrays
  const outbound = (results.outbound ?? []) as Flight[];
  const returnFlights = (results.return ?? []) as Flight[];
  const outboundGroups = groupFlightsByRoute(outbound);
  const returnGroups = groupFlightsByRoute(returnFlights);
  const hasMultipleOutboundRoutes = outboundGroups.length > 1;
  const hasMultipleReturnRoutes = returnGroups.length > 1;
  const totalFlights = outbound.length + returnFlights.length;

  if (totalFlights === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <EmptyState
          title={t('savedSearches.empty.title')}
          description={t('savedSearches.empty.description')}
          icon={SearchX}
        />
        <Button variant="outline" onClick={onReset} className="mt-4">
          {t('results.modifySearch')}
        </Button>
      </div>
    );
  }

  const handleFlightSelect = (flight: Flight) => {
    if (activeTab === 'outbound') {
      setSelectedOutbound(flight);
      if (returnFlights.length > 0) setTimeout(() => setActiveTab('return'), 300);
    } else {
      setSelectedReturn(flight);
    }
  };

  const totalPrice = (selectedOutbound?.price ?? 0) + (selectedReturn?.price ?? 0);
  const canBook = selectedOutbound && selectedReturn;

  const handleBookTrip = () => {
    if (selectedOutbound?.deepLink)
      window.open(selectedOutbound.deepLink, '_blank', 'noopener,noreferrer');
  };

  const currentGroups = activeTab === 'outbound' ? outboundGroups : returnGroups;
  const hasMultipleRoutes =
    activeTab === 'outbound' ? hasMultipleOutboundRoutes : hasMultipleReturnRoutes;

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
            {t('results.searchResults')}
          </h2>
          <p className="text-sm text-neutral-500">
            {t('results.flightsFound', { count: totalFlights })}
          </p>
        </div>
        <Button variant="ghost" onClick={onReset} className="font-bold text-blue-500">
          {t('results.modifySearch')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-neutral-100 p-1.5 dark:bg-neutral-800/50">
        <TabButton
          active={activeTab === 'outbound'}
          onClick={() => setActiveTab('outbound')}
          icon={<PlaneTakeoff className="h-4 w-4" />}
          label={t('results.outboundFlights')}
          count={outbound.length}
          hasSelection={!!selectedOutbound}
        />
        <TabButton
          active={activeTab === 'return'}
          onClick={() => setActiveTab('return')}
          icon={<PlaneLanding className="h-4 w-4" />}
          label={t('results.returnFlights')}
          count={returnFlights.length}
          hasSelection={!!selectedReturn}
        />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'outbound' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'outbound' ? 20 : -20 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="mb-4 text-center text-sm font-medium text-neutral-500">
            {activeTab === 'outbound' ? t('results.selectOutbound') : t('results.selectReturn')}
          </p>

          {hasMultipleRoutes ? (
            <div className="flex flex-col gap-4">
              {currentGroups.map((group, index) => (
                <RouteGroup
                  key={group.routeKey}
                  group={group}
                  defaultExpanded={index === 0}
                  showDirectionBadge
                  direction={activeTab}
                  onFavoriteToggle={toggleFavorite}
                  favoriteIds={favoriteIds}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {(activeTab === 'outbound' ? outbound : returnFlights).map((flight, index) => {
                const isSelected =
                  activeTab === 'outbound'
                    ? selectedOutbound?.id === flight.id
                    : selectedReturn?.id === flight.id;
                return (
                  <motion.div
                    key={flight.id || `flight-${index}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.03, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative"
                  >
                    <div
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        isSelected &&
                          'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900'
                      )}
                      onClick={() => handleFlightSelect(flight)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFlightSelect(flight)}
                      role="button"
                      tabIndex={0}
                    >
                      <FlightCard
                        flight={flight}
                        className={cn(isSelected && 'border-blue-500')}
                        showDirectionBadge
                        direction={activeTab}
                        showFavoriteButton
                        isFavorite={favoriteIds.has(flight.id ?? '')}
                        onFavoriteToggle={toggleFavorite}
                      />
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {(activeTab === 'outbound' ? outbound : returnFlights).length === 0 && (
            <div className="py-12 text-center">
              <SearchX className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-sm font-medium text-neutral-500">
                {activeTab === 'outbound' ? t('results.noOutbound') : t('results.noReturn')}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Selection Summary */}
      <AnimatePresence>
        {(selectedOutbound || selectedReturn) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card
              variant="glass-premium"
              className="mt-4 border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-6"
            >
              <h3 className="mb-4 text-lg font-black text-neutral-900 dark:text-white">
                {t('results.selectedFlights')}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectionCard
                  label={t('results.outboundFlights')}
                  flight={selectedOutbound}
                  onClear={() => setSelectedOutbound(null)}
                />
                <SelectionCard
                  label={t('results.returnFlights')}
                  flight={selectedReturn}
                  onClear={() => setSelectedReturn(null)}
                />
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                    {t('results.totalPrice')}
                  </p>
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    €{totalPrice}
                  </p>
                </div>
                <Button
                  disabled={!canBook}
                  onClick={handleBookTrip}
                  className={cn(
                    'rounded-xl px-8 py-3 text-sm font-black tracking-widest uppercase transition-all',
                    canBook
                      ? 'bg-blue-600 text-white shadow-lg hover:-translate-y-0.5 hover:bg-blue-500'
                      : 'cursor-not-allowed bg-neutral-300 text-neutral-500'
                  )}
                >
                  {t('results.bookTrip')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          * {t('results.disclaimer')}
        </p>
      </div>
    </div>
  );
}

// Sub-components
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  hasSelection: boolean;
}
function TabButton({ active, onClick, icon, label, count, hasSelection }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all',
        active
          ? 'bg-white text-blue-600 shadow-lg dark:bg-neutral-700 dark:text-blue-400'
          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
      )}
    >
      {icon}
      <span>{label}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-bold',
          active
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700'
        )}
      >
        {count}
      </span>
      {hasSelection && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  );
}

interface SelectionCardProps {
  label: string;
  flight: Flight | null;
  onClear: () => void;
}
function SelectionCard({ label, flight, onClear }: SelectionCardProps) {
  if (!flight)
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 p-4 dark:border-neutral-600">
        <p className="text-sm text-neutral-400">{label}</p>
      </div>
    );
  return (
    <div className="relative rounded-xl border border-white/20 bg-white/50 p-4 dark:bg-neutral-800/50">
      <button
        onClick={onClear}
        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
        aria-label="Clear"
      >
        ×
      </button>
      <p className="mb-2 text-[10px] font-bold tracking-wider text-blue-500 uppercase">{label}</p>
      <div className="flex items-center gap-2">
        <span className="font-bold text-neutral-900 dark:text-white">{flight.cityFrom}</span>
        <ArrowRight className="h-4 w-4 text-neutral-400" />
        <span className="font-bold text-neutral-900 dark:text-white">{flight.cityTo}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {new Date(flight.departure.local).toLocaleDateString()}
        </span>
        <span className="text-lg font-black text-blue-600 dark:text-blue-400">€{flight.price}</span>
      </div>
    </div>
  );
}
