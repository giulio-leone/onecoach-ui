'use client';

import { Heart, Trash2, MapPin, Calendar, Users, Plane, ArrowRight } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { Card } from '@giulio-leone/ui';
import { useState } from 'react';
import Link from 'next/link';

interface FlightSearch {
  id: string;
  userId: string;
  name: string | null;
  flyFrom: string[];
  flyTo: string[];
  departureDate: Date;
  returnDate: Date | null;
  tripType: string;
  passengers: number;
  cabinClass: string;
  resultsCount: number;
  lowestPrice: number | null;
  hasDeal: boolean;
  dealSavings: number | null;
  dealStrategy: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightSearchCardProps {
  search: FlightSearch;
  /** URL to navigate when clicking the card */
  href?: string;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  className?: string;
}

export function FlightSearchCard({
  search,
  href,
  onDelete,
  onToggleFavorite,
  className,
}: FlightSearchCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  };

  const handleDelete = async () => {
    if (isDeleting || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(search.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite || !onToggleFavorite) return;
    setIsTogglingFavorite(true);
    try {
      await onToggleFavorite(search.id, !search.isFavorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const cabinClassLabel: Record<string, string> = {
    economy: 'Economy',
    premium_economy: 'Premium Economy',
    business: 'Business',
    first: 'First',
  };

  return (
    <Card
      variant="glass"
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden p-4 transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-all',
            search.isFavorite
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'bg-white/50 text-neutral-400 hover:bg-white/80 hover:text-red-500 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]',
            isTogglingFavorite && 'animate-pulse'
          )}
          aria-label={search.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn('h-4 w-4', search.isFavorite && 'fill-current')} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-neutral-400 transition-all hover:bg-red-500/10 hover:text-red-500 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]',
            isDeleting && 'animate-pulse'
          )}
          aria-label="Delete search"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 pr-20">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
          <Plane className="h-5 w-5 text-primary-500" />
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
            <MapPin className="h-3 w-3 text-primary-500" />
            {search.flyFrom.join(', ')}
          </span>
          <span className="flex items-center gap-2 text-sm text-neutral-500">
            <MapPin className="h-3 w-3 text-neutral-400" />
            {search.flyTo.join(', ')}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDate(search.departureDate)}
            {search.returnDate && ` - ${formatDate(search.returnDate)}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>
            {search.passengers} {search.passengers === 1 ? 'passenger' : 'passengers'}
          </span>
        </div>
        <span className="text-neutral-400">
          {cabinClassLabel[search.cabinClass] || search.cabinClass}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">{search.resultsCount} results</span>
          {search.lowestPrice && (
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              €{search.lowestPrice}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {search.hasDeal && search.dealSavings && (
            <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-bold text-green-500">
              Save €{search.dealSavings}
            </span>
          )}
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 rounded-full bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
            >
              View
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
