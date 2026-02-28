/**
 * FoodCard
 *
 * Card responsiva per un alimento con azioni rapide.
 * Rifattorizzato: mobile-first, dark mode ottimizzata, touch-friendly
 */

'use client';

import { useTranslations } from 'next-intl';
import { Button, Checkbox, Text } from '@giulio-leone/ui';
import { UtensilsCrossed, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@giulio-leone/lib-design-system';
import { AdminDropdownMenu } from '../shared/admin-dropdown-menu';

export interface FoodCardProps {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function FoodCard({
  id,
  name,
  brand,
  imageUrl,
  isSelected,
  onSelect,
  onDetail,
  onEdit,
  onDelete,
}: FoodCardProps) {
  const t = useTranslations();
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 transition-colors',
        'border-t first:border-t-0',
        'border-neutral-200/60 dark:border-white/[0.06]',
        'bg-white hover:bg-neutral-50 dark:bg-zinc-950 dark:hover:bg-white/[0.06]/60'
      )}
    >
      {/* Checkbox */}
      {onSelect && <Checkbox checked={!!isSelected} onChange={() => onSelect(id)} />}

      {/* Image/Avatar */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
            'bg-neutral-100 dark:bg-white/[0.04]'
          )}
        >
          <UtensilsCrossed className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Text
          weight="semibold"
          className="truncate text-neutral-900 dark:text-neutral-100"
          size="sm"
        >
          {name}
        </Text>
        <Text className="mt-0.5 truncate text-neutral-600 dark:text-neutral-400" size="xs">
          {brand || 'Senza marca'}
        </Text>
      </div>

      {/* Actions - Desktop */}
      <div className="hidden gap-2 sm:flex">
        <Button variant="outline" size="sm" onClick={() => onDetail?.(id)} icon={Eye}>
          Dettagli
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit?.(id)} icon={Edit}>
          Modifica
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete?.(id)} icon={Trash2}>
          Elimina
        </Button>
      </div>

      {/* Actions - Mobile */}
      <div className="sm:hidden">
        <AdminDropdownMenu
          trigger={
            <Button
              variant="outline"
              className={cn(
                'h-auto min-h-[2.75rem] min-w-[2.75rem] rounded-lg p-2',
                'touch-manipulation bg-white text-neutral-600 hover:bg-neutral-50',
                'dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]'
              )}
              aria-label="Azioni"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          }
          items={[
            {
              id: 'detail',
              label: 'Dettagli',
              icon: Eye,
              onClick: () => onDetail?.(id),
            },
            {
              id: 'edit',
              label: t('common.actions.edit'),
              icon: Edit,
              onClick: () => onEdit?.(id),
            },
            {
              id: 'delete',
              label: t('common.actions.delete'),
              icon: Trash2,
              variant: 'danger',
              onClick: () => onDelete?.(id),
            },
          ]}
          align="right"
        />
      </div>
    </div>
  );
}
