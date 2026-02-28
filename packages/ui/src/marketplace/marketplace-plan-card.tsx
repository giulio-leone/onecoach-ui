'use client';

import { useTranslations } from 'next-intl';
/**
 * Marketplace Plan Card Component
 *
 * Display card for marketplace plans with KISS principles
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Users, CheckCircle2 } from 'lucide-react';
import { Card } from '@giulio-leone/ui';

export interface MarketplacePlanCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  coverImage?: string | null;
  planType: 'WORKOUT' | 'NUTRITION';
  totalPurchases: number;
  averageRating?: number | null;
  totalReviews: number;
  coach: {
    userId?: string;
    name: string | null;
    image: string | null;
    coach_profile?: {
      verificationStatus: string;
    } | null;
  };
}

export function MarketplacePlanCard({ plan }: { plan: MarketplacePlanCardProps }) {
  const t = useTranslations('common');

  const router = useRouter();
  const isVerified = plan.coach.coach_profile?.verificationStatus === 'APPROVED';

  const handleCoachClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (plan.coach.userId) {
      router.push(`/coach/${plan.coach.userId}`);
    }
  };

  return (
    <Link href={`/marketplace/plans/${plan.id}`}>
      <Card className="h-full cursor-pointer overflow-hidden transition-shadow duration-200 hover:shadow-lg">
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-neutral-100 dark:bg-white/[0.04]">
          {plan.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plan.coverImage} alt={plan.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
              <span className="text-4xl">{plan.planType === 'WORKOUT' ? '💪' : '🍎'}</span>
            </div>
          )}

          {/* Plan Type Badge */}
          <div className="absolute top-2 right-2 rounded-full bg-white px-2 py-1 text-xs font-medium dark:bg-neutral-900/90">
            {plan.planType === 'WORKOUT' ? '🏋️ Workout' : '🥗 Nutrition'}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 min-h-[56px] text-lg font-semibold">{plan.title}</h3>

          {/* Description */}
          <p className="line-clamp-2 min-h-[40px] text-sm text-neutral-600 dark:text-neutral-400">
            {plan.description}
          </p>

          {/* Coach Info */}
          {plan.coach.userId ? (
            <div
              onClick={handleCoachClick}
              className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
            >
              {plan.coach.image ? (
                <Image
                  src={plan.coach.image}
                  alt={plan.coach.name || 'Coach'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs dark:bg-neutral-700">
                  {plan.coach.name?.charAt(0) || 'C'}
                </div>
              )}
              <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                {plan.coach.name || 'Coach'}
                {isVerified && <CheckCircle2 className="h-4 w-4 text-primary-500" />}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {plan.coach.image ? (
                <Image
                  src={plan.coach.image}
                  alt={plan.coach.name || 'Coach'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs dark:bg-neutral-700">
                  {plan.coach.name?.charAt(0) || 'C'}
                </div>
              )}
              <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                {plan.coach.name || 'Coach'}
                {isVerified && <CheckCircle2 className="h-4 w-4 text-primary-500" />}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-4">
              {/* Rating */}
              {plan.averageRating && plan.totalReviews > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{plan.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    ({plan.totalReviews})
                  </span>
                </div>
              ) : (
                <span className="text-xs text-neutral-400 dark:text-neutral-600">
                  {t('common.marketplace_plan_card.no_reviews_yet')}
                </span>
              )}

              {/* Purchases */}
              <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-500">
                <Users className="h-4 w-4" />
                <span className="text-xs">{plan.totalPurchases}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {plan.currency === 'EUR' ? '€' : '$'}
                {typeof plan.price === 'number'
                  ? plan.price.toFixed(2)
                  : Number(plan.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
