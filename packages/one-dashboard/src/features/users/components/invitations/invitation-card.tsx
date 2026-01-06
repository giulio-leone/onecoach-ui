import { Badge, Button, Card } from '@onecoach/ui';
import { Copy, Trash2, Calendar, User, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useFormatter } from 'next-intl';

interface Invitation {
  id: string;
  code: string;
  type: 'ONE_TIME' | 'MULTI_USE';
  status: 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  createdBy: {
    name: string | null;
    email: string;
  };
}

interface InvitationCardProps {
  invitation: Invitation;
  onRevoke: (id: string) => void;
}

export function InvitationCard({ invitation, onRevoke }: InvitationCardProps) {
  const t = useTranslations('admin.users.invitations');
  const format = useFormatter();

  const copyToClipboard = (text: string) => {
    const t = useTranslations('admin');
    navigator.clipboard.writeText(text);
    toast.success(t('copySuccess'));
  };

  const getStatusColor = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'USED':
        return 'neutral';
      case 'REVOKED':
        return 'error';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-base font-bold tracking-wider break-all sm:text-lg">
                {invitation.code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => copyToClipboard(invitation.code)}
                aria-label={t('copy')}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">{t('copy')}</span>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Badge variant="neutral" className="h-5 px-1.5 text-[10px] font-medium">
                {invitation.type === 'ONE_TIME'
                  ? t('filters.types.oneTime')
                  : t('filters.types.multiUse')}
              </Badge>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                {t('usage', { used: invitation.usedCount, max: invitation.maxUses })}
              </span>
            </div>
          </div>
          <Badge variant={getStatusColor(invitation.status)} className="self-start sm:self-auto">
            {t(`filters.status.${invitation.status.toLowerCase()}`)}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-3 w-3" />
              {t('expires')}
            </span>
            <p className="font-medium break-words">
              {invitation.expiresAt
                ? format.dateTime(new Date(invitation.expiresAt), {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : t('never')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <User className="h-3 w-3" />
              {t('createdBy')}
            </span>
            <p className="truncate font-medium" title={invitation.createdBy.email}>
              {invitation.createdBy.name || invitation.createdBy.email.split('@')[0]}
            </p>
          </div>
        </div>
        {invitation.status === 'ACTIVE' && (
          <div className="mt-4 flex justify-end border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2 sm:px-3"
              onClick={() => onRevoke(invitation.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              {t('revoke')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
