'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  ModalFooter,
  Select,
  StatCard,
  Switch,
} from '@giulio-leone/ui';
import { toast } from 'sonner';
import { Activity, BarChart3, Check, Flame, Trash2 } from 'lucide-react';
import { logger } from '@giulio-leone/lib-shared';

type Settings = {
  oneClickEnabled: boolean;
  linkEnabled: boolean;
  applePayEnabled: boolean;
  googlePayEnabled: boolean;
  savePaymentMethodDefault: boolean;
  autofillEnabled: boolean;
  currency: string;
  cartExpirationHours: number;
  abandonedCartReminder: boolean;
  reminderDelayHours: number;
};

type Offer = {
  id: string;
  name: string;
  type: 'CROSS_SELL' | 'UPSELL';
  placement: 'CART' | 'CHECKOUT' | 'POST_PURCHASE';
  priority: number;
  isActive: boolean;
  ctaLabel?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  layout?: unknown;
};

type Metrics = {
  counts: { totalCarts: number; completed: number; abandoned: number; active: number };
  conversionRate: number;
  abandonmentRate: number;
  averageCartValue: number;
  revenue: { total: number; byDay: Array<{ date: string; amount: number }> };
  periodDays: number;
};

const defaultOffer: Partial<Offer> = {
  type: 'UPSELL',
  placement: 'CHECKOUT',
  priority: 100,
  isActive: true,
};

export function CheckoutSettingsPageClient() {
  const t = useTranslations('admin.commerce.checkout');
  const tCommon = useTranslations('common');
  const format = useFormatter();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>(defaultOffer);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const formatEuro = useCallback(
    (amount: number | null | undefined) => {
      return format.number(amount ?? 0, {
        style: 'currency',
        currency: 'EUR',
      });
    },
    [format]
  );

  const formatEuroFromCents = useCallback(
    (amount: number | null | undefined) => {
      return format.number((amount ?? 0) / 100, {
        style: 'currency',
        currency: 'EUR',
      });
    },
    [format]
  );

  const loadAll = async () => {
    try {
      const [settingsRes, offersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/checkout/settings'),
        fetch('/api/admin/checkout/offers'),
        fetch('/api/admin/checkout/analytics'),
      ]);
      const [settingsJson, offersJson, metricsJson] = await Promise.all([
        settingsRes.json(),
        offersRes.json(),
        metricsRes.json(),
      ]);
      if (settingsRes.ok) setSettings(settingsJson as Settings);
      if (offersRes.ok) setOffers(offersJson as Offer[]);
      if (metricsRes.ok) setMetrics(metricsJson as Metrics);
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('settings.error'));
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadAll is stable, runs once on mount
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    if (!settings.currency || settings.currency.length !== 3) {
      toast.error(t('settings.currencyError'));
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/checkout/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Settings save failed');
      toast.success(t('settings.success'));
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('settings.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const createOffer = async () => {
    try {
      if (!newOffer.name) {
        toast.error(t('offers.validationName'));
        return;
      }
      const res = await fetch('/api/admin/checkout/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      });
      if (!res.ok) throw new Error('Offer creation failed');
      toast.success(t('offers.successCreate'));
      setNewOffer(defaultOffer);
      await loadAll();
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('offers.errorCreate'));
    }
  };

  const toggleOffer = async (offer: Offer) => {
    try {
      const res = await fetch(`/api/admin/checkout/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (!res.ok) throw new Error('Offer update failed');
      await loadAll();
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('offers.errorUpdate'));
    }
  };

  const deleteOffer = async (offer: Offer) => {
    const { dialog } = await import('@giulio-leone/lib-stores');
    const confirmed = await dialog.confirm(t('offers.deleteConfirm', { name: offer.name }));
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/checkout/offers/${offer.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Offer deletion failed');
      toast.success(t('offers.successDelete'));
      await loadAll();
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('offers.errorDelete'));
    }
  };

  const saveEditOffer = async () => {
    if (!editingOffer) return;
    try {
      const res = await fetch(`/api/admin/checkout/offers/${editingOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOffer),
      });
      if (!res.ok) throw new Error('Offer update failed');
      toast.success(t('offers.successUpdate'));
      setEditingOffer(null);
      await loadAll();
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(t('offers.errorUpdate'));
    }
  };

  const metricsCards = useMemo(() => {
    if (!metrics) return null;
    return [
      {
        id: 'conversion',
        label: t('metrics.conversion'),
        value: `${(metrics.conversionRate * 100).toFixed(1)}%`,
        icon: Check,
        color: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        id: 'abandon',
        label: t('metrics.abandonment'),
        value: `${(metrics.abandonmentRate * 100).toFixed(1)}%`,
        icon: Flame,
        color: 'text-amber-600 dark:text-amber-400',
      },
      {
        id: 'acv',
        label: t('metrics.acv'),
        value: formatEuro(metrics.averageCartValue),
        icon: BarChart3,
        color: 'text-primary-600 dark:text-primary-400',
      },
      {
        id: 'revenue',
        label: t('metrics.revenue', { days: metrics.periodDays }),
        value: formatEuroFromCents(metrics.revenue.total),
        icon: Activity,
        color: 'text-secondary-600 dark:text-secondary-400',
      },
    ];
  }, [metrics, t, formatEuro, formatEuroFromCents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('subtitle')}</p>
      </div>
      {metricsCards && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricsCards.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      )}
      <Card variant="glass" className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('settings.title')}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('settings.subtitle')}
            </p>
          </div>
          <Button onClick={saveSettings} disabled={isSaving || !settings}>
            {isSaving ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
        {!settings && <p className="text-sm text-neutral-500">{t('settings.loading')}</p>}
        {settings && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <ToggleRow
                label={t('settings.oneClick')}
                checked={settings.oneClickEnabled}
                onChange={(checked: boolean) =>
                  setSettings({ ...settings, oneClickEnabled: checked })
                }
              />
              <ToggleRow
                label={t('settings.stripeLink')}
                checked={settings.linkEnabled}
                onChange={(checked: boolean) => setSettings({ ...settings, linkEnabled: checked })}
              />
              <ToggleRow
                label={t('settings.applePay')}
                checked={settings.applePayEnabled}
                onChange={(checked: boolean) =>
                  setSettings({ ...settings, applePayEnabled: checked })
                }
              />
              <ToggleRow
                label={t('settings.googlePay')}
                checked={settings.googlePayEnabled}
                onChange={(checked: boolean) =>
                  setSettings({ ...settings, googlePayEnabled: checked })
                }
              />
            </div>
            <div className="space-y-3">
              <ToggleRow
                label={t('settings.saveDefault')}
                checked={settings.savePaymentMethodDefault}
                onChange={(checked: boolean) =>
                  setSettings({ ...settings, savePaymentMethodDefault: checked })
                }
              />
              <ToggleRow
                label={t('settings.autofill')}
                checked={settings.autofillEnabled}
                onChange={(checked: boolean) =>
                  setSettings({ ...settings, autofillEnabled: checked })
                }
              />
              <ToggleRow
                label={t('settings.reminders')}
                checked={settings.abandonedCartReminder}
                onChange={(checked: boolean) =>
                  setSettings({ ...settings, abandonedCartReminder: checked })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {t('settings.currency')}
                  </p>
                  <Input
                    value={settings.currency}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    maxLength={3}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {t('settings.expiration')}
                  </p>
                  <Input
                    type="number"
                    value={settings.cartExpirationHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({ ...settings, cartExpirationHours: Number(e.target.value || 0) })
                    }
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {t('settings.reminderDelay')}
                  </p>
                  <Input
                    type="number"
                    value={settings.reminderDelayHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({ ...settings, reminderDelayHours: Number(e.target.value || 0) })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Card variant="glass" className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('offers.newTitle')}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('offers.newSubtitle')}
            </p>
          </div>
          <Button onClick={createOffer}>{t('offers.create')}</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder={t('offers.placeholderTitle')}
            value={newOffer.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewOffer({ ...newOffer, name: e.target.value })
            }
          />
          <Input
            placeholder={t('offers.placeholderCTA')}
            value={newOffer.ctaLabel || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewOffer({ ...newOffer, ctaLabel: e.target.value })
            }
          />
          <Select
            value={(newOffer.type as string) || 'UPSELL'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNewOffer({ ...newOffer, type: e.target.value as Offer['type'] })
            }
          >
            <option value="UPSELL">{t('offers.type.upsell')}</option>
            <option value="CROSS_SELL">{t('offers.type.crossSell')}</option>
          </Select>
          <Select
            value={(newOffer.placement as string) || 'CHECKOUT'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setNewOffer({ ...newOffer, placement: e.target.value as Offer['placement'] })
            }
          >
            <option value="CHECKOUT">{t('offers.placement.checkout')}</option>
            <option value="CART">{t('offers.placement.cart')}</option>
            <option value="POST_PURCHASE">{t('offers.placement.postPurchase')}</option>
          </Select>
          <Input
            type="number"
            placeholder={t('offers.placeholderPriority')}
            value={newOffer.priority ?? 100}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewOffer({ ...newOffer, priority: Number(e.target.value || 100) })
            }
          />
        </div>
      </Card>
      <Card variant="glass" className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t('offers.title')}
          </h2>
          <Button variant="ghost" onClick={loadAll}>
            {t('offers.reload')}
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-lg border border-neutral-200/60 p-3 dark:border-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{offer.name}</p>
                  <p className="text-xs text-neutral-500">
                    {offer.type} · {offer.placement}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {tCommon('priority')}:{offer.priority}
                  </p>
                  {offer.ctaLabel && (
                    <p className="text-xs text-neutral-500">
                      {t('offers.cta', { label: offer.ctaLabel })}
                    </p>
                  )}
                </div>
                <Badge>{offer.isActive ? t('offers.active') : t('offers.inactive')}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => toggleOffer(offer)}>
                  {offer.isActive ? t('offers.deactivate') : t('offers.activate')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingOffer(offer)}>
                  {t('offers.edit')}
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteOffer(offer)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  {t('offers.delete')}
                </Button>
              </div>
            </div>
          ))}
          {offers.length === 0 && <p className="text-sm text-neutral-500">{t('offers.empty')}</p>}
        </div>
      </Card>
      {editingOffer && (
        <Modal isOpen onClose={() => setEditingOffer(null)} title={t('offers.modalTitle')}>
          <div className="space-y-3">
            <Input
              value={editingOffer.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingOffer({ ...editingOffer, name: e.target.value })
              }
            />
            <Input
              value={editingOffer.ctaLabel || ''}
              placeholder={t('offers.placeholderCTA')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingOffer({ ...editingOffer, ctaLabel: e.target.value })
              }
            />
            <Input
              type="number"
              value={editingOffer.priority}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingOffer({ ...editingOffer, priority: Number(e.target.value || 0) })
              }
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setEditingOffer(null)}>
              {t('offers.cancel')}
            </Button>
            <Button onClick={saveEditOffer}>{tCommon('save')}</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200/60 px-3 py-2 dark:border-white/[0.06]">
      <p className="text-sm text-neutral-800 dark:text-neutral-200">{label}</p>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
