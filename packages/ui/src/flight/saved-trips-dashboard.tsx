'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MapPin,
  Calendar,
  ArrowRight,
  Plane,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
// import { useTranslations } from 'next-intl';
import { EmptyState, Card, Button, Badge } from '@giulio-leone/ui';
// We'll define the types locally for now if they aren't exported yet from lib-flight to avoid build errors
// or assume they are compatible with the API response
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface FlightSegment {
  departure: { local: string };
  arrival: { local: string };
  layovers?: unknown[];
  totalDurationInSeconds: number;
}

interface PriceHistoryEntry {
  priceChange: number;
}

interface SavedTrip {
  id: string;
  name?: string;
  departureDate: string;
  returnDate?: string;
  originCityCode: string;
  destinationCityCode: string;
  originCity: string;
  destinationCity: string;
  note?: string;
  outboundFlight: FlightSegment;
  returnFlight?: FlightSegment;
  totalPrice: number;
  priceHistory?: PriceHistoryEntry[];
  combinedDeepLink?: string;
  outboundDeepLink?: string;
}

interface DestinationGroup {
  destinationCityCode: string;
  destinationCity: string;
  tripCount: number;
  avgPrice: number;
  trips: SavedTrip[];
}

interface SavedTripsDashboardProps {
  userId: string;
  initialDestination?: string | null;
}

export function SavedTripsDashboard({ userId, initialDestination }: SavedTripsDashboardProps) {
  // const t = useTranslations('flight');
  const [groupedTrips, setGroupedTrips] = useState<DestinationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flight/trips/by-destination')
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) {
          let groups = data.groups;
          if (initialDestination) {
            groups = groups.filter(
              (g: DestinationGroup) => g.destinationCityCode === initialDestination
            );
          }
          setGroupedTrips(groups);
        }
      })
      .catch((err: unknown) => console.error('Failed to load trips for user ' + userId, err))
      .finally(() => setIsLoading(false));
  }, [userId, initialDestination]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i: any) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((j: any) => (
                <div
                  key={j}
                  className="h-64 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedTrips.length === 0) {
    return (
      <EmptyState
        title="Nessun viaggio salvato"
        description="Salva i tuoi viaggi preferiti per monitorare i prezzi e averli sempre a portata di mano."
        icon={Heart}
      />
    );
  }

  return (
    <div className="space-y-12">
      {groupedTrips.map((group: any) => (
        <section key={group.destinationCityCode} className="space-y-6">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 text-primary-500 ring-1 ring-white/20 backdrop-blur-md">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {group.destinationCity}
                </h2>
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Badge variant="outline" className="text-xs tracking-widest uppercase">
                    {group.destinationCityCode}
                  </Badge>
                  <span>•</span>
                  <span>{group.tripCount} viaggi salvati</span>
                  <span>•</span>
                  <span>Media: {group.avgPrice}€</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {group.trips.map((trip: SavedTrip) => (
                <SavedTripCard key={trip.id} trip={trip} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}

function SavedTripCard({ trip }: { trip: SavedTrip }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo viaggio?')) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/flight/trips/${trip.id}`, { method: 'DELETE' });
      setIsDeleted(true);
    } catch (error) {
      console.error('Failed to delete trip', error);
      setIsDeleting(false);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="glass-premium"
        className="group relative h-full overflow-hidden border-white/10 bg-white/5 p-0 transition-all hover:border-primary-500/30 hover:bg-white/10 dark:border-white/[0.08] dark:bg-neutral-900"
      >
        {/* Header Image / Pattern */}
        <div className="absolute inset-0 z-0 h-32 bg-gradient-to-b from-primary-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col p-6">
          {/* Top Row: Date & Actions */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(trip.departureDate), 'd MMM', { locale: it })}
                  {trip.returnDate &&
                    ` - ${format(new Date(trip.returnDate), 'd MMM', { locale: it })}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                <span>{trip.originCityCode}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{trip.destinationCityCode}</span>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
            >
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </button>
          </div>

          {/* Main Info */}
          <div className="mb-6 flex-1 space-y-4">
            <div>
              <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 dark:text-white">
                {trip.name || `${trip.originCity} → ${trip.destinationCity}`}
              </h3>
              {trip.note && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {trip.note}
                </p>
              )}
            </div>

            {/* Flight Segments Preview */}
            <div className="space-y-3 rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-200 dark:bg-neutral-800/50 dark:ring-white/5">
              <FlightSegmentPreview flight={trip.outboundFlight} />
              {trip.returnFlight && (
                <>
                  <div className="h-px bg-neutral-200 dark:bg-white/10" />
                  <FlightSegmentPreview flight={trip.returnFlight} isReturn />
                </>
              )}
            </div>
          </div>

          {/* Footer: Price & Action */}
          <div className="mt-auto flex items-end justify-between pt-4">
            <div>
              <p className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Prezzo Totale
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-neutral-900 dark:text-white">
                  {trip.totalPrice}€
                </span>
                {trip.priceHistory && trip.priceHistory.length > 0 && (
                  <PriceTrendBadge history={trip.priceHistory[0]!} />
                )}
              </div>
            </div>

            <Button
              size="sm"
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              onClick={() => window.open(trip.combinedDeepLink || trip.outboundDeepLink, '_blank')}
            >
              Prenota
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function FlightSegmentPreview({
  flight,
  isReturn = false,
}: {
  flight: FlightSegment;
  isReturn?: boolean;
}) {
  const time = (iso: string) => format(new Date(iso), 'HH:mm');

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${isReturn ? 'bg-orange-500/10 text-orange-500' : 'bg-primary-500/10 text-primary-500'}`}
        >
          <Plane className={`h-4 w-4 ${isReturn ? 'rotate-180' : ''}`} />
        </div>
        <div>
          <div className="font-semibold text-neutral-900 dark:text-neutral-200">
            {time(flight.departure.local)} - {time(flight.arrival.local)}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-500">
            {flight.layovers?.length ? `${flight.layovers.length} scali` : 'Diretto'}
          </div>
        </div>
      </div>
      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {Math.floor(flight.totalDurationInSeconds / 3600)}h{' '}
        {Math.floor((flight.totalDurationInSeconds % 3600) / 60)}m
      </div>
    </div>
  );
}

function PriceTrendBadge({ history }: { history: PriceHistoryEntry }) {
  if (!history || !history.priceChange) return null;

  const isUp = history.priceChange > 0;
  const isDown = history.priceChange < 0;

  return (
    <div
      className={`flex items-center gap-1 text-xs font-bold ${
        isDown ? 'text-green-500' : isUp ? 'text-red-500' : 'text-neutral-500'
      }`}
    >
      {isDown && <TrendingDown className="h-3 w-3" />}
      {isUp && <TrendingUp className="h-3 w-3" />}
      {!isDown && !isUp && <Minus className="h-3 w-3" />}
      {Math.abs(history.priceChange)}€
    </div>
  );
}
