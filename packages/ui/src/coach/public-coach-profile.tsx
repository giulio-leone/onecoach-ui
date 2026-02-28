'use client';

import { useTranslations } from 'next-intl';
/**
 * Public Coach Profile Component
 *
 * Display public coach profile information
 */

import { Card, Heading, Text } from '@giulio-leone/ui';
import { CheckCircle2, Linkedin, Instagram, Globe } from 'lucide-react';

export interface PublicCoachProfileData {
  id: string;
  userId: string;
  bio: string | null;
  credentials: string | null;
  coachingStyle: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  verificationStatus: string;
  totalSales: number;
  averageRating: number | null;
  totalReviews: number;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface PublicCoachProfileProps {
  profile: PublicCoachProfileData;
}

export function PublicCoachProfile({ profile }: PublicCoachProfileProps) {
  const t = useTranslations('coach');

  const isVerified = profile.verificationStatus === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative">
            {profile.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                alt={profile.user.name || 'Coach'}
                className="h-[120px] w-[120px] rounded-full"
              />
            ) : (
              <div className="flex h-30 w-30 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-4xl font-bold text-white">
                {profile.user.name?.[0]?.toUpperCase() || 'C'}
              </div>
            )}
            {isVerified && (
              <div className="absolute right-0 bottom-0 rounded-full bg-white p-1 dark:bg-zinc-950">
                <CheckCircle2 className="h-6 w-6 text-primary-500" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <Heading level={1} size="2xl" weight="bold">
                {profile.user.name || 'Coach'}
              </Heading>
              {isVerified && (
                <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
                  Verificato
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              {profile.totalSales > 0 && (
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {profile.totalSales}
                  </span>{' '}
                  vendite
                </div>
              )}
              {profile.averageRating && (
                <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {profile.averageRating.toFixed(1)}
                  </span>
                  <span>⭐</span>
                  <span>
                    ({profile.totalReviews} {t('coach.public_coach_profile.recensioni')}
                  </span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(profile.linkedinUrl || profile.instagramUrl || profile.websiteUrl) && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/[0.1] dark:bg-neutral-800/50 dark:bg-zinc-950 dark:text-neutral-300"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/[0.1] dark:bg-neutral-800/50 dark:bg-zinc-950 dark:text-neutral-300"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/[0.1] dark:bg-neutral-800/50 dark:bg-zinc-950 dark:text-neutral-300"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bio */}
      {profile.bio && (
        <Card>
          <Heading level={2} size="lg" weight="semibold" className="mb-3">
            Biografia
          </Heading>
          <Text className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
            {profile.bio}
          </Text>
        </Card>
      )}

      {/* Credentials */}
      {profile.credentials && (
        <Card>
          <Heading level={2} size="lg" weight="semibold" className="mb-3">
            Credenziali
          </Heading>
          <Text className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
            {profile.credentials}
          </Text>
        </Card>
      )}

      {/* Coaching Style */}
      {profile.coachingStyle && (
        <Card>
          <Heading level={2} size="lg" weight="semibold" className="mb-3">
            {t('coach.public_coach_profile.stile_di_coaching')}
          </Heading>
          <Text className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
            {profile.coachingStyle}
          </Text>
        </Card>
      )}
    </div>
  );
}
