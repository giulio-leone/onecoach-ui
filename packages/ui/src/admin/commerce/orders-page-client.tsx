'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Badge, Button, Input, Select, StatCard, DatePicker } from '@giulio-leone/ui';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Clock, Download, XCircle } from 'lucide-react';
import { logger } from '@giulio-leone/lib-shared';
import { OrderDetailsModal } from './order-details-modal';

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
};

type Stats = {
  pending: number;
  succeeded: number;
  failed: number;
  refunded: number;
};

// Map values (used for API) to translation keys
const STATUS_OPTIONS = [
  { value: 'Tutti', labelKey: 'all' },
  { value: 'In attesa', labelKey: 'pending' },
  { value: 'Pagati', labelKey: 'succeeded' },
  { value: 'Falliti', labelKey: 'failed' },
  { value: 'Rimborsati', labelKey: 'refunded' },
];

const TYPE_OPTIONS = [
  { value: 'Tutti', labelKey: 'all' },
  { value: 'Abbonamento', labelKey: 'subscription' },
  { value: 'Crediti', labelKey: 'credits' },
  { value: 'Marketplace', labelKey: 'marketplace' },
];

export function OrdersPageClient() {
  const t = useTranslations('admin.commerce.orders');
  const tUi = useTranslations('ui.datePicker');
  const format = useFormatter();

  const [orders, setOrders] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Payment | null>(null);
  const [filters, setFilters] = useState({
    status: 'Tutti',
    type: 'Tutti',
    from: '',
    to: '',
    minAmount: '',
    maxAmount: '',
  });

  const formatAmount = (amount: number, currency: string) => {
    return format.number((amount || 0) / 100, {
      style: 'currency',
      currency: (currency || 'EUR').toUpperCase(),
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.status !== 'Tutti') query.set('status', filters.status);
      if (filters.type !== 'Tutti') query.set('type', filters.type);
      if (filters.from) query.set('from', filters.from);
      if (filters.to) query.set('to', filters.to);
      if (filters.minAmount) query.set('minAmount', filters.minAmount);
      if (filters.maxAmount) query.set('maxAmount', filters.maxAmount);

      const res = await fetch(`/api/admin/commerce/orders?${query.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Load failed');

      setOrders(json.orders);
      setStats(json.stats);
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('table.empty')); // Using 'table.empty' as generic error fallback or define 'loadingError'
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData is stable, runs once on mount
  }, []);

  const handleExport = async () => {
    try {
      const query = new URLSearchParams();
      // Add filters to export query
      if (filters.status !== 'Tutti') query.set('status', filters.status);
      const res = await fetch(`/api/admin/commerce/orders/export?${query.toString()}`);
      if (!res.ok) throw new Error('Export error');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString()}.csv`;
      a.click();
      toast.success(t('export.success'));
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('export.error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('subtitle')}</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t('filters.export')}
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t('stats.pending')}
            value={stats.pending}
            icon={Clock}
            color="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            label={t('stats.succeeded')}
            value={stats.succeeded}
            icon={CheckCircle2}
            color="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label={t('stats.failed')}
            value={stats.failed}
            icon={XCircle}
            color="text-red-600 dark:text-red-400"
          />
          <StatCard
            label={t('stats.refunded')}
            value={stats.refunded}
            icon={AlertCircle}
            color="text-secondary-600 dark:text-secondary-400"
          />
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">{t('filters.status')}</label>
            <Select
              value={filters.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              {STATUS_OPTIONS.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {t(`status.${opt.labelKey}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">{t('filters.type')}</label>
            <Select
              value={filters.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFilters({ ...filters, type: e.target.value })
              }
            >
              {TYPE_OPTIONS.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {t(`type.${opt.labelKey}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">{t('filters.from')}</label>
            <DatePicker
              value={filters.from ? new Date(filters.from) : undefined}
              onChange={(date: Date | undefined) =>
                setFilters({ ...filters, from: date ? date.toISOString().substring(0, 10) : '' })
              }
              translations={{
                selectDate: tUi('selectDate'),
                today: tUi('today'),
                previousMonth: tUi('previousMonth'),
                nextMonth: tUi('nextMonth'),
                weekdays: { short: tUi.raw('weekdays.short') as string[] },
                months: tUi.raw('months') as string[],
              }}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">{t('filters.to')}</label>
            <DatePicker
              value={filters.to ? new Date(filters.to) : undefined}
              onChange={(date: Date | undefined) =>
                setFilters({ ...filters, to: date ? date.toISOString().substring(0, 10) : '' })
              }
              translations={{
                selectDate: tUi('selectDate'),
                today: tUi('today'),
                previousMonth: tUi('previousMonth'),
                nextMonth: tUi('nextMonth'),
                weekdays: { short: tUi.raw('weekdays.short') as string[] },
                months: tUi.raw('months') as string[],
              }}
              minDate={filters.from ? new Date(filters.from) : undefined}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">{t('filters.min')}</label>
            <Input
              type="number"
              placeholder="0.00"
              value={filters.minAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={loadData}>
              {t('filters.refresh')}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t('table.id')}</th>
                <th className="px-4 py-3 font-medium">{t('table.user')}</th>
                <th className="px-4 py-3 font-medium">{t('table.amount')}</th>
                <th className="px-4 py-3 font-medium">{t('table.type')}</th>
                <th className="px-4 py-3 font-medium">{t('table.status')}</th>
                <th className="px-4 py-3 font-medium">{t('table.date')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {orders.map((order: any) => (
                <tr
                  key={order.id}
                  className="group hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {order.users?.name || t('table.user')}
                    </div>
                    <div className="text-xs text-neutral-500">{order.users?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {formatAmount(order.amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{order.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        order.status === 'succeeded'
                          ? 'success'
                          : order.status === 'pending'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {format.dateTime(new Date(order.createdAt), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                      {t('table.details')}
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    {t('table.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
