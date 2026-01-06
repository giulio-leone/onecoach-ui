/**
 * Flight Search Card Component
 *
 * Thin wrapper around ProgramCard for flight search history display.
 * Follows DRY principle by using shared ProgramCard abstraction.
 */

'use client';

import { Plane, Calendar, Users, Eye, Trash2, Star, StarOff, MapPin } from 'lucide-react';
import { ProgramCard, type ProgramCardAction } from '@onecoach/ui';
import type { FlightSearch } from '@prisma/client';
import { useTranslations, useFormatter } from 'next-intl';

interface FlightSearchCardProps {
  search: FlightSearch;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  className?: string;
}

export function FlightSearchCard({
  search,
  onDelete,
  onToggleFavorite,
  className,
}: FlightSearchCardProps) {
  const t = useTranslations('flight.card');
  const format = useFormatter();

  // Build route string
  const routeFrom = search.flyFrom.join(', ');
  const routeTo = search.flyTo.join(', ');
  const routeDisplay = `${routeFrom} → ${routeTo}`;

  // Format date
  const dateStr = format.dateTime(new Date(search.departureDate), {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // Date for URL (keep hardcoded format or use consistent util?)
  // Keeping as is for URL parameter logic usually requires specific format (e.g. DD/MM/YYYY)
  const dateForUrl = new Date(search.departureDate).toLocaleDateString('en-GB'); // dd/mm/yyyy

  // Build actions array
  const actions: ProgramCardAction[] = [
    {
      icon: <Eye className="h-4 w-4" />,
      title: t('actions.view'),
      colorOnHover: 'blue',
      href: `/flight/search?from=${search.flyFrom.join(',')}&to=${search.flyTo.join(',')}&date=${dateForUrl}`,
    },
  ];

  if (onToggleFavorite) {
    actions.push({
      icon: search.isFavorite ? (
        <StarOff className="h-3.5 w-3.5" />
      ) : (
        <Star className="h-3.5 w-3.5" />
      ),
      title: search.isFavorite ? t('actions.unfavorite') : t('actions.favorite'),
      colorOnHover: 'blue',
      onClick: () => onToggleFavorite(search.id, !search.isFavorite),
    });
  }

  if (onDelete) {
    actions.push({
      icon: <Trash2 className="h-3.5 w-3.5" />,
      title: t('actions.delete'),
      colorOnHover: 'rose',
      onClick: () => onDelete(search.id),
    });
  }

  // Build description
  const description = search.name
    ? search.name
    : `${t('passengers', { count: search.passengers })} • ${t(`cabinClass.${search.cabinClass}`) || search.cabinClass}`;

  // Build stats
  const stats = [
    {
      icon: <Calendar className="h-3.5 w-3.5" />,
      label: t('stats.date'),
      value: dateStr,
    },
    {
      icon: <Users className="h-3.5 w-3.5" />,
      label: t('stats.pax'),
      value: String(search.passengers),
    },
  ];

  // Add price stat if available
  if (search.lowestPrice) {
    stats.push({
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: t('stats.from'),
      value: `€${search.lowestPrice}`,
    });
  }

  return (
    <ProgramCard
      id={search.id}
      name={routeDisplay}
      description={description}
      href={`/flight/search?from=${search.flyFrom.join(',')}&to=${search.flyTo.join(',')}&date=${dateForUrl}`}
      badge={t(`tripType.${search.tripType}`) || search.tripType}
      icon={<Plane className="h-6 w-6" />}
      colorTheme={search.hasDeal ? 'emerald' : 'blue'}
      stats={stats}
      actions={actions}
      className={className}
      // Show deal indicator
      {...(search.hasDeal &&
        search.dealSavings && {
          badgeVariant: 'success' as const,
          badge: `🔥 -€${search.dealSavings}`,
        })}
    />
  );
}

export default FlightSearchCard;
