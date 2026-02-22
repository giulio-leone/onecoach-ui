'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  type Flight,
  type FlightSearchResponse,
  type FlightDirection,
  groupFlightsByRoute,
} from '@giulio-leone/lib-shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plane, PlaneLanding, PlaneTakeoff, SearchX, ArrowRight, Heart } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Button, Card, EmptyState } from '@giulio-leone/ui';
import { FlightCard } from './flight-card';
import { RouteGroup } from './route-group';
import {
  SmartAnalysisPanel,
  type FlightAnalysis,
  type FlightRecommendation,
} from './smart-analysis-panel';
import { AgentEventList, useAdminMode, type ProgressField } from '@giulio-leone/one-agent-hooks';

export type { FlightSearchResponse };

export interface FlightResultsProps {
  results: FlightSearchResponse | null;
  isSearching: boolean;
  onReset: () => void;
  /** AI-powered flight analysis (from SmartSearchService) */
  analysis?: FlightAnalysis;
  /** AI recommendation for best flight option */
  recommendation?: FlightRecommendation;
  /** Alternative recommendations */
  alternatives?: FlightRecommendation[];
  /** v4.1: Streaming progress (0-100) */
  progress?: number;
  /** v4.1: Streaming user message */
  userMessage?: string;
  /** v4.1: Streaming events */
  events?: ProgressField[];
}

// Hook to manage saved trips
function useSavedTrips() {
  const [savedTripIds, setSavedTripIds] = useState<Set<string>>(new Set());

  // Load saved trips on mount
  useEffect(() => {
    fetch('/api/flight/trips')
      .then((res) => res.json())
      .then((data) => {
        if (data.trips) {
          // We track saved trips by ID, but for duplicate checking we might need more smarts.
          // For now, just tracking IDs of newly saved trips in this session + loaded ones.
          setSavedTripIds(new Set(data.trips.map((t: any) => t.id)));
        }
      })
      .catch(() => {});
  }, []);

  const saveTrip = useCallback(async (tripData: any) => {
    try {
      const res = await fetch('/api/flight/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });

      if (!res.ok) throw new Error('Failed to save');

      const data = await res.json();
      if (data.trip?.id) {
        setSavedTripIds((prev) => {
          const next = new Set(prev);
          next.add(data.trip.id);
          return next;
        });
        return data.trip.id;
      }
    } catch (error) {
      console.error('Failed to save trip', error);
      // We could add toast notification here if UI library supports it
    }
  }, []);

  return { savedTripIds, saveTrip };
}

export function FlightResults({
  results,
  isSearching,
  onReset,
  analysis,
  recommendation,
  alternatives,
  progress = 0,
  userMessage,
  events = [],
}: FlightResultsProps) {
  const t = useTranslations('flight');
  const [activeTab, setActiveTab] = useState<FlightDirection>('outbound');
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const { saveTrip } = useSavedTrips();
  const [isSaving, setIsSaving] = useState(false);
  const { isAdmin, toggle: toggleAdminMode } = useAdminMode();

  const handleSaveSelectedTrip = async () => {
    if (!selectedOutbound) return;

    setIsSaving(true);
    try {
      // Construct payload
      // If we have AI analysis, use it. If not, we might need a fallback or it's optional?
      // The schema requires aiAnalysis and aiRecommendation.
      // If saving a manual selection, we use the global analysis context,
      // and construct a "User Selected" recommendation object.

      const manualRecommendation = {
        outboundFlightId: selectedOutbound.id!,
        returnFlightId: selectedReturn?.id,
        totalPrice: selectedOutbound.price + (selectedReturn?.price || 0),
        strategy: 'most_convenient', // Fallback strategy label
        confidence: 1.0, // User selected it manually
        reasoning: 'User selected combination',
        deepLink: undefined, // Will be generated from flights
      };

      await saveTrip({
        name: `${selectedOutbound.cityTo} Trip`,
        outboundFlight: selectedOutbound,
        returnFlight: selectedReturn || undefined,
        aiAnalysis: analysis || {
          marketSummary: 'Manual selection',
          priceAnalysis: { avgOutboundPrice: 0, isPriceGood: true, priceTrend: 'stable' },
          routeAnalysis: {},
          scheduleAnalysis: { hasGoodDirectOptions: true, bestTimeToFly: 'N/A' },
          keyInsights: ['User selected trip'],
        },
        aiRecommendation: recommendation && !selectedReturn ? recommendation : manualRecommendation,
        combinedDeepLink: undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRecommendation = async (rec: FlightRecommendation) => {
    // Find the flights corresponding to the recommendation
    // This assumes recommendation has IDs that match flights in the results
    // If we can't find them, we can't save the full flight object.
    // However, usually the recommendation object passed to API (SaveTrip) expects full objects.
    // If the recommendation only has IDs, we need to look them up.

    // Helper to find flight by ID
    const findFlight = (id: string, list: any[]) => list.find((f) => f.id === id);

    // Search in all results
    const outboundList =
      results?.tripType === 'round-trip' ? results.outbound : results?.flights || [];
    const returnList = results?.tripType === 'round-trip' ? results.return : [];

    const outboundF = findFlight(rec.outboundFlightId, outboundList as any[]);
    const returnF = rec.returnFlightId
      ? findFlight(rec.returnFlightId, returnList as any[])
      : undefined;

    if (outboundF) {
      await saveTrip({
        outboundFlight: outboundF,
        returnFlight: returnF,
        aiAnalysis: analysis!,
        aiRecommendation: rec,
      });
    }
  };

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        {/* Animated plane icon with progress ring */}
        <div className="relative">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-blue-500/20 dark:text-blue-400/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progress) / 100}
              className="text-blue-500 transition-all duration-300 ease-out dark:text-blue-400"
            />
          </svg>
          <Plane className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse text-blue-500 dark:text-blue-400" />
        </div>

        {/* Progress percentage */}
        <div className="text-center">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(progress)}%
          </span>
        </div>

        {/* User message */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            {userMessage || t('wizard.steps.tripType.title')}...
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t('cta.description').split('.')[0]}
          </p>
        </div>

        {/* Streaming events timeline */}
        {events.length > 0 && (
          <AgentEventList
            events={events}
            isAdmin={isAdmin}
            onToggleAdmin={toggleAdminMode}
            maxVisible={5}
            compact
          />
        )}
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

  // One-way results with route grouping
  if (results.tripType === 'one-way') {
    const flights = results.flights as Flight[];
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

        {/* AI Analysis Panel - shown when SmartSearch data is available */}
        {analysis && recommendation && (
          <SmartAnalysisPanel
            analysis={analysis}
            recommendation={recommendation}
            alternatives={alternatives}
            onSave={handleSaveRecommendation}
          />
        )}

        {hasMultipleRoutes ? (
          // Grouped by route
          <div className="flex flex-col gap-4">
            {routeGroups.map((group, index) => (
              <RouteGroup key={group.routeKey} group={group} defaultExpanded={index === 0} />
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
                  <FlightCard flight={flight} showFavoriteButton={false} />
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

  // Round-trip results
  const outbound = results.outbound as Flight[];
  const returnFlights = results.return as Flight[];
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

      {/* AI Analysis Panel - shown when SmartSearch data is available */}
      {analysis && recommendation && (
        <SmartAnalysisPanel
          analysis={analysis}
          recommendation={recommendation}
          alternatives={alternatives}
        />
      )}

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
          <p className="mb-4 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
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
                        showFavoriteButton={false}
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
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    disabled={!canBook || isSaving}
                    onClick={handleSaveSelectedTrip}
                    className="h-auto rounded-xl border border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <Heart className={cn('mr-2 h-4 w-4', isSaving && 'animate-pulse')} />
                    {t('results.saveTrip') || 'Save'}
                  </Button>
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
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 p-4 dark:border-neutral-700">
        <p className="text-sm text-neutral-400">{label}</p>
      </div>
    );
  return (
    <div className="relative rounded-xl border border-white/20 bg-white/50 p-4 dark:bg-neutral-800/80">
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
