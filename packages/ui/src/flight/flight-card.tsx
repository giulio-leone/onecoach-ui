'use client';

import { useState } from 'react';
import { Clock, ArrowRight, PlaneTakeoff, PlaneLanding, Flame, Heart } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from '@giulio-leone/ui';
import { useTranslations } from 'next-intl';
import type { Flight, FlightDirection } from '@giulio-leone/lib-shared';

export type { Flight, FlightDirection };

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  className?: string;
  showDirectionBadge?: boolean;
  direction?: FlightDirection;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (flight: Flight, isFavorite: boolean) => void;
}

export function FlightCard({
  flight,
  onSelect: _onSelect,
  className,
  showDirectionBadge = false,
  direction,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteToggle,
}: FlightCardProps) {
  const tFlight = useTranslations('flight');
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const departureDate = new Date(flight.departure.local);
  const arrivalDate = new Date(flight.arrival.local);
  const hasLayovers = flight.layovers && flight.layovers.length > 0;
  const layoverCount = flight.layovers?.length ?? 0;
  const flightDirection = direction ?? flight.direction;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTogglingFavorite || !onFavoriteToggle) return;

    setIsTogglingFavorite(true);
    try {
      await onFavoriteToggle(flight, !isFavorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Card
      variant="glass-premium"
      className={cn(
        'group relative flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl',
        'border border-white/20 dark:border-white/10',
        className
      )}
    >
      {/* Favorite Button */}
      {showFavoriteButton && (
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className={cn(
            'absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all',
            isFavorite
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'bg-white/50 text-neutral-400 hover:bg-white/80 hover:text-red-500 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]',
            isTogglingFavorite && 'animate-pulse'
          )}
          aria-label={
            isFavorite ? tFlight('card.actions.unfavorite') : tFlight('card.actions.favorite')
          }
        >
          <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
        </button>
      )}

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        {/* Direction Badge */}
        {showDirectionBadge && flightDirection && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase shadow-sm',
                flightDirection === 'outbound'
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-400'
              )}
            >
              {flightDirection === 'outbound' ? (
                <PlaneTakeoff className="h-3 w-3" />
              ) : (
                <PlaneLanding className="h-3 w-3" />
              )}
              {tFlight(
                flightDirection === 'outbound' ? 'results.outboundBadge' : 'results.returnBadge'
              )}
            </div>
          </div>
        )}

        {/* Deal Badge */}
        {flight.isDeal && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
              <Flame className="h-3 w-3" />
              DEAL
            </div>
            {flight.savingsAmount && flight.savingsAmount > 0 && (
              <span className="text-sm font-bold text-green-500">
                {tFlight('results.savings', { amount: flight.savingsAmount })}
              </span>
            )}
            {flight.dealStrategy === 'one-way-combo' && (
              <span className="text-[10px] font-medium text-neutral-400">
                {tFlight('results.separateFlights')}
              </span>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatTime(departureDate)}
              </span>
              <span className="text-xs font-bold tracking-widest text-primary-600 uppercase dark:text-primary-400">
                {flight.cityFrom}
              </span>
              <span className="text-xs font-bold text-neutral-400">{flight.flyFrom}</span>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-xs font-bold text-neutral-500">
                <Clock className="h-3 w-3" />
                {formatDuration(flight.totalDurationInSeconds)}
              </div>
              <div className="relative h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-600">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-3 w-3 text-neutral-400" />
                </div>
              </div>
              <span className="text-xs font-bold text-neutral-400">
                {hasLayovers
                  ? `${layoverCount} ${layoverCount === 1 ? 'stop' : 'stops'}`
                  : tFlight('results.direct')}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {formatTime(arrivalDate)}
              </span>
              <span className="text-xs font-bold tracking-widest text-primary-600 uppercase dark:text-primary-400">
                {flight.cityTo}
              </span>
              <span className="text-xs font-bold text-neutral-400">{flight.flyTo}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-500">
            <span>{formatDate(departureDate)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              {tFlight('results.price')}
            </span>
            <span className="text-3xl font-black tracking-tight text-primary-600 dark:text-primary-400">
              €{flight.price}
            </span>
          </div>
          <a
            href={flight.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'rounded-xl px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-200',
              'bg-primary-600 text-white shadow-lg hover:-translate-y-0.5 hover:bg-primary-500 hover:shadow-xl'
            )}
          >
            {tFlight('results.bookNow')}
          </a>
        </div>
      </div>
    </Card>
  );
}
