'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Badge, Button, Select, StatCard, DatePicker } from '@giulio-leone/ui';
import { toast } from 'sonner';
import { Activity, Clock, ShoppingCart, XCircle } from 'lucide-react';
import { logger, formatCurrency } from '@giulio-leone/lib-shared';
import { CartDetailsModal } from './cart-details-modal';

type Cart = {
  id: string;
  status: string;
  currency: string;
  subtotal: number;
  total: number;
  itemCount: number;
  updatedAt: string;
  user?: { id: string; email: string; name: string | null };
};

type Stats = {
  active: number;
  abandoned: number;
  completed: number;
};

// Values used for API filters. Labels are translation keys.
// Original values: 'Tutti', 'Attivi', 'Checkout', 'Completati', 'Abbandonati', 'Scaduti'
const STATUS_OPTIONS = [
  { value: 'Tutti', labelKey: 'all' },
  { value: 'Attivi', labelKey: 'active' },
  { value: 'Checkout', labelKey: 'checkout' },
  { value: 'Completati', labelKey: 'completed' },
  { value: 'Abbandonati', labelKey: 'abandoned' },
  { value: 'Scaduti', labelKey: 'expired' },
];

export function CartsPageClient() {
  const t = useTranslations('admin.commerce.carts');
  const tUi = useTranslations('ui.datePicker');
  const format = useFormatter();

  const [carts, setCarts] = useState<Cart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'Tutti',
    from: '',
    to: '',
  });


  const loadData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.status !== 'Tutti') query.set('status', filters.status);
      if (filters.from) query.set('from', filters.from);
      if (filters.to) query.set('to', filters.to);

      const res = await fetch(`/api/admin/commerce/carts?${query.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Load failed');

      setCarts(json.carts);
      setStats(json.stats);
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('table.empty')); // Fallback error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData is stable, t is used inside
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('subtitle')}</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t('stats.active')}
            value={stats.active}
            icon={ShoppingCart}
            color="text-primary-600 dark:text-primary-400"
          />
          <StatCard
            label={t('stats.abandoned')}
            value={stats.abandoned}
            icon={XCircle}
            color="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label={t('stats.completed')}
            value={stats.completed}
            icon={Activity}
            color="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      )}

      <div className="rounded-lg border border-neutral-200/60 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-950">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
          <div className="flex items-end lg:col-span-2">
            <Button className="w-full" onClick={loadData}>
              {t('filters.refresh')}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200/60 dark:border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-zinc-950 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t('table.user')}</th>
                <th className="px-4 py-3 font-medium">{t('table.total')}</th>
                <th className="px-4 py-3 font-medium">{t('table.items')}</th>
                <th className="px-4 py-3 font-medium">{t('table.status')}</th>
                <th className="px-4 py-3 font-medium">{t('table.lastSeen')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-white/[0.06]">
              {carts.map((cart: any) => (
                <tr
                  key={cart.id}
                  className="group hover:bg-neutral-50 dark:hover:bg-white/[0.06]/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {cart.user?.email || t('table.user')}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(cart.total, cart.currency)}
                  </td>
                  <td className="px-4 py-3">{cart.itemCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{cart.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format.relativeTime(new Date(cart.updatedAt))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedCartId(cart.id)}>
                      {t('table.details')}
                    </Button>
                  </td>
                </tr>
              ))}
              {carts.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    {t('table.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CartDetailsModal
        cartId={selectedCartId || ''}
        open={!!selectedCartId}
        onClose={() => setSelectedCartId(null)}
        onUpdated={loadData}
      />
    </div>
  );
}
