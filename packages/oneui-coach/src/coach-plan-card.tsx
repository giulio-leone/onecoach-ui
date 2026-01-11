'use client';

import { useTranslations } from 'next-intl';
/**
 * Coach Plan Card Component
 *
 * Display card for coach's plan in repository
 */
import { Link } from 'app/navigation';
import { Button, Card } from '@onecoach/ui';
import { Star, Eye, Edit, Trash2, EyeOff, ExternalLink } from 'lucide-react';
import type { MarketplacePlanType } from '@onecoach/types/client';
export interface CoachPlanCardProps {
  id: string;
  title: string;
  description: string;
  planType: MarketplacePlanType;
  coverImage?: string | null;
  price: number;
  currency: string;
  isPublished: boolean;
  totalPurchases: number;
  averageRating: number | null;
  totalReviews: number;
  createdAt: Date | string;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onDelete?: (id: string) => void;
}
export function CoachPlanCard({
  id,
  title,
  description,
  planType,
  coverImage,
  price,
  currency,
  isPublished,
  totalPurchases,
  averageRating,
  totalReviews,
  onPublish,
  onUnpublish,
  onDelete,
}: CoachPlanCardProps) {
  const t = useTranslations('coach');

  const handlePublish = () => {
    if (isPublished && onUnpublish) {
      onUnpublish(id);
    } else if (!isPublished && onPublish) {
      onPublish(id);
    }
  };
  const handleDelete = async () => {
    if (onDelete) {
      const { dialog } = await import('@onecoach/lib-stores');
      const confirmed = await dialog.confirm('Sei sicuro di voler eliminare questo piano?');
      if (confirmed) {
        onDelete(id);
      }
    }
  };
  return (
    <Card variant="hover" className="overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <span className="text-4xl">{planType === 'WORKOUT' ? '💪' : '🍎'}</span>
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {isPublished ? (
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
              Pubblicato
            </span>
          ) : (
            <span className="rounded-full bg-neutral-500 px-3 py-1 text-xs font-medium text-white">
              Bozza
            </span>
          )}
        </div>
        {/* Plan Type Badge */}
        <div className="absolute top-2 left-2 rounded-full bg-white px-2 py-1 text-xs font-medium dark:bg-neutral-900/90">
          {planType === 'WORKOUT' ? '🏋️ Workout' : '🥗 Nutrition'}
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 border-t border-neutral-100 pt-3">
          {/* Rating */}
          {averageRating && totalReviews > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">
                ({totalReviews})
              </span>
            </div>
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-600">
              {t('coach_plan_card.no_reviews_yet')}
            </span>
          )}
          {/* Purchases */}
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-500">
            <span className="text-xs">{totalPurchases} vendite</span>
          </div>
          {/* Price */}
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-orange-600">
              {currency === 'EUR' ? '€' : '$'}
              {price.toFixed(2)}
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/marketplace/plans/${id}`} className="flex-1">
            <Button variant="outline" size="sm" icon={ExternalLink} fullWidth>
              Vedi
            </Button>
          </Link>
          <Link
            href={`/${planType === 'WORKOUT' ? 'workouts' : 'nutrition'}/${planType === 'WORKOUT' ? id : id}/edit`}
            className="flex-1"
          >
            <Button variant="secondary" size="sm" icon={Edit} fullWidth>
              Modifica
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            icon={isPublished ? EyeOff : Eye}
            onClick={handlePublish}
            className="flex-1"
          >
            {isPublished ? 'Nascondi' : 'Pubblica'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            className="flex-1"
          >
            Elimina
          </Button>
        </div>
      </div>
    </Card>
  );
}
