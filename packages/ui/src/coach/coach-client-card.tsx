/**
 * Coach Client Card Component
 *
 * Display card for a single client
 */
'use client';
import { Avatar, Badge, Card, Heading, Text } from '@giulio-leone/ui';
import { formatDistanceToNow } from 'date-fns';
import type { Locale } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Clock, CreditCard, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

import type { CoachClient } from '@giulio-leone/lib-api/queries/coach.queries';

interface CoachClientCardProps {
  client: CoachClient;
}

const dateFnsLocales: Record<string, Locale> = { it, en: enUS };

export function CoachClientCard({ client }: CoachClientCardProps) {
  const t = useTranslations('coach.clients.card');
  const locale = useLocale();
  const dateLocale = dateFnsLocales[locale] || enUS;

  const lastActiveText = client.lastActive
    ? formatDistanceToNow(new Date(client.lastActive), { addSuffix: true, locale: dateLocale })
    : t('never');

  const displayName = client.name || t('userFallback');
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/coach/clients/${client.id}`}>
      <Card
        variant="hover"
        className="hover:border-primary/50 h-full overflow-hidden transition-all hover:shadow-md"
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div className="space-y-4">
            {/* Header with Avatar and Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={client.image || undefined}
                  alt={displayName}
                  fallback={initials}
                  size="md"
                  bordered
                />
                <div>
                  <Heading
                    level={3}
                    size="md"
                    weight="semibold"
                    className="line-clamp-1 text-neutral-900 dark:text-neutral-100"
                  >
                    {displayName}
                  </Heading>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" />
                    <Text size="xs" className="text-neutral-500">
                      {lastActiveText}
                    </Text>
                  </div>
                </div>
              </div>
              <Badge
                variant="success"
                className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                {t('active')}
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-zinc-950">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span>{t('programs')}</span>
                </div>
                <div className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {client.programsPurchased}
                </div>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-zinc-950">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{t('spent')}</span>
                </div>
                <div className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  €{(client.totalSpent || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Recent Programs */}
            {client.purchases && client.purchases.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
                  {t('purchasedPrograms')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {client.purchases
                    .slice(0, 2)
                    .map((purchase: CoachClient['purchases'][number]) => (
                      <Badge key={purchase.id} variant="neutral" className="max-w-[140px] truncate">
                        {purchase.planTitle}
                      </Badge>
                    ))}
                  {client.purchases.length > 2 && (
                    <Badge variant="outline" className="text-neutral-500">
                      +{client.purchases.length - 2} {t('others')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
