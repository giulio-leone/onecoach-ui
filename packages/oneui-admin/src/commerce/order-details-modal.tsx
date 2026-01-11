'use client';
import { Badge, Button, Modal, ModalFooter } from '@onecoach/ui';
import { toast } from 'sonner';
import { CreditCard, User } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';

type Payment = {
  id: string;
  status: string;
  type: string;
  amount: number;
  currency: string;
  createdAt: string;
  stripePaymentId?: string | null;
  stripePaymentIntentId?: string | null;
  metadata?: Record<string, unknown> | null;
  users?: { id: string; email: string; name: string | null };
  subscriptions?: { id: string; plan: string; status: string } | null;
};

interface OrderDetailsModalProps {
  order: Payment;
  onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const t = useTranslations('admin.commerce.orders');
  const tAdmin = useTranslations('admin');
  const format = useFormatter();

  const formatAmount = (amount: number, currency: string) => {
    return format.number((amount || 0) / 100, {
      style: 'currency',
      currency: (currency || 'EUR').toUpperCase(),
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={t('details.title')}>
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{order.status}</Badge>
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {format.dateTime(new Date(order.createdAt), {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
            <CreditCard className="h-5 w-5" />
            {formatAmount(order.amount, order.currency)}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('table.type')}: {order.type}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {t('table.user')}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <User className="h-4 w-4" />
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">
                {order.users?.name || t('table.user')}
              </p>
              <p className="text-xs text-neutral-500">{order.users?.email}</p>
            </div>
          </div>
        </div>
        {order.subscriptions && (
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {t('details.subscription')}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {t('details.plan')}: {order.subscriptions.plan} · {t('table.status')}:{' '}
              {order.subscriptions.status}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {t('details.stripe')}
          </p>
          <div className="mt-2 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
            {order.stripePaymentId && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('details.paymentId')}:</span>
                <span className="font-mono">{order.stripePaymentId}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(order.stripePaymentId || '');
                    toast.success(tAdmin('details.copied'));
                  }}
                >
                  {t('details.copy')}
                </Button>
              </div>
            )}
            {order.stripePaymentIntentId && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('details.intentId')}:</span>
                <span className="font-mono">{order.stripePaymentIntentId}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(order.stripePaymentIntentId || '');
                    toast.success(tAdmin('details.copied'));
                  }}
                >
                  {t('details.copy')}
                </Button>
              </div>
            )}
            {!order.stripePaymentId && !order.stripePaymentIntentId && (
              <p className="text-neutral-500">{t('details.noStripe')}</p>
            )}
          </div>
        </div>
        {order.metadata && (
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {t('details.metadata')}
            </p>
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-neutral-900/70 p-3 text-xs text-green-100">
              {JSON.stringify(order.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          {t('details.close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
