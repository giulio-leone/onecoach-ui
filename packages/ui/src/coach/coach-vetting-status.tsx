'use client';

import { useTranslations } from 'next-intl';
/**
 * Coach Vetting Status Component
 *
 * Display vetting request status
 */
import { Badge, Card, Heading, Text } from '@giulio-leone/ui';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { coach_vetting_requests } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export interface CoachVettingStatusProps {
  vettingRequest: coach_vetting_requests | null;
}
export function CoachVettingStatus({ vettingRequest }: CoachVettingStatusProps) {
  const t = useTranslations('coach');

  if (!vettingRequest) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-neutral-400" />
          <div>
            <Heading level={3} size="sm" weight="semibold">
              {t('coach_vetting_status.nessuna_richiesta_di_verifica')}
            </Heading>
            <Text size="sm" className="text-neutral-600 dark:text-neutral-400">
              {t('coach_vetting_status.invia_una_richiesta_per_verificare_il_tu')}
            </Text>
          </div>
        </div>
      </Card>
    );
  }
  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: 'In Attesa',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      description: 'La tua richiesta è in fase di revisione',
    },
    APPROVED: {
      icon: CheckCircle2,
      label: 'Approvata',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      description: 'Il tuo account è stato verificato',
    },
    REJECTED: {
      icon: XCircle,
      label: 'Rifiutata',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      description: 'La richiesta è stata rifiutata',
    },
  };
  const config = statusConfig[vettingRequest.status];
  const StatusIcon = config.icon;
  const submittedDate = vettingRequest.submittedAt
    ? formatDistanceToNow(new Date(vettingRequest.submittedAt), {
        addSuffix: true,
        locale: it,
      })
    : null;
  const reviewedDate = vettingRequest.reviewedAt
    ? formatDistanceToNow(new Date(vettingRequest.reviewedAt), {
        addSuffix: true,
        locale: it,
      })
    : null;
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${config.color.split(' ')[1]}`} />
            <div>
              <Heading level={3} size="sm" weight="semibold">{t('coach_vetting_status.stato_verifica')}</Heading>
              <Text size="sm" className="text-neutral-600 dark:text-neutral-400">{config.description}</Text>
            </div>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
        {/* Dates */}
        <div className="space-y-2 border-t border-neutral-100 pt-4 dark:border-white/[0.08]">
          {submittedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {t('coach_vetting_status.inviata')}
              </span>
              <span className="font-medium">{submittedDate}</span>
            </div>
          )}
          {reviewedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {t('coach_vetting_status.revisionata')}
              </span>
              <span className="font-medium">{reviewedDate}</span>
            </div>
          )}
        </div>
        {/* Review Notes */}
        {vettingRequest.reviewNotes && (
          <div className="rounded-lg border border-neutral-200/60 bg-neutral-50 p-4 dark:border-white/[0.08] dark:bg-neutral-800/50">
            <Heading level={4} size="sm" weight="medium" className="mb-2">
              {t('coach_vetting_status.note_di_revisione')}
            </Heading>
            <Text size="sm" className="text-neutral-700 dark:text-neutral-300">
              {vettingRequest.reviewNotes}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
