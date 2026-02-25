'use client';
import { useEffect, useState } from 'react';
import { Badge } from '../../badge';
import { Button } from '../../button';
import { Modal, ModalFooter } from '../../dialog';
import { Select } from '../../select';
import { Textarea } from '../../textarea';
import { toast } from 'sonner';
import { Clock, TicketPercent, User } from 'lucide-react';
import { logger, formatCurrency } from '@giulio-leone/lib-shared';
import { useTranslations, useFormatter } from 'next-intl';

type CartItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: string | number;
  currency: string;
  itemType: string;
  description?: string | null;
};

type CartDetail = {
  id: string;
  status: string;
  currency: string;
  subtotal: string | number;
  discountTotal: string | number;
  total: string | number;
  promoCode?: string | null;
  referralCode?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
  cart_items: CartItem[];
  user?: { id: string; email: string; name: string | null };
};

type Event = {
  id: string;
  type: string;
  createdAt: string;
  metadata?: unknown;
};

const STATUS_OPTIONS = ['ACTIVE', 'CHECKOUT_IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED'];

interface CartDetailsModalProps {
  cartId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function CartDetailsModal({ cartId, open, onClose, onUpdated }: CartDetailsModalProps) {
  const t = useTranslations('admin.commerce.carts');
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const format = useFormatter();

  const [cart, setCart] = useState<CartDetail | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');


  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/carts/${cartId}`);
        const json = (await res.json()) as {
          cart?: CartDetail;
          events?: Event[];
          error?: string;
        };
        if (!res.ok) throw new Error(json?.error || tAdmin('details.loadError'));
        if (!json.cart) throw new Error(tAdmin('details.notFound'));
        setCart(json.cart);
        setEvents(json.events || []);
        setStatus(json.cart.status);
        const meta = (json.cart.metadata as Record<string, unknown>) || {};
        setNote((meta.adminNote as string) || '');
      } catch (err) {
        logger.error((err as Error).message);
        toast.error(tAdmin('details.loadError'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [cartId, open, tAdmin]);

  const handleUpdate = async () => {
    if (!cart) return;
    try {
      const res = await fetch(`/api/admin/carts/${cart.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || tAdmin('details.updateError'));
      }
      toast.success(tAdmin('details.updateSuccess'));
      onUpdated();
      onClose();
    } catch (err) {
      logger.error((err as Error).message);
      toast.error(tAdmin('details.updateError'));
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={t('details.title')}>
      <div className="space-y-4">
        {loading && <p className="text-sm text-neutral-500">{tCommon('loading')}</p>}
        {!loading && cart && (
          <>
            <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{cart.status}</Badge>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <User className="h-4 w-4" />
                  {cart.user?.email || 'N/D'}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <Clock className="h-4 w-4" />
                  {format.dateTime(new Date(cart.createdAt), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
              <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-200">
                <p>
                  {t('details.subtotal')}:{' '}
                  <strong>{formatCurrency(cart.subtotal, cart.currency)}</strong>
                </p>
                <p>
                  {t('details.discount')}:{' '}
                  <strong>{formatCurrency(cart.discountTotal, cart.currency)}</strong>
                </p>
                <p>
                  {t('details.total')}: <strong>{formatCurrency(cart.total, cart.currency)}</strong>
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                  {cart.promoCode && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
                      <TicketPercent className="h-3 w-3" />
                      Promo {cart.promoCode}
                    </span>
                  )}
                  {cart.referralCode && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
                      Referral {cart.referralCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  {t('details.items')}
                </p>
                <span className="text-xs text-neutral-500">
                  {cart.cart_items.length} {t('details.rows')}
                </span>
              </div>
              <div className="space-y-2">
                {cart.cart_items.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-neutral-100 p-2 text-sm dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </p>
                        <p className="text-xs text-neutral-500">{item.itemType}</p>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {item.quantity} × {formatCurrency(item.unitPrice, item.currency)}
                      </div>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-xs text-neutral-500">{item.description}</p>
                    )}
                  </div>
                ))}
                {cart.cart_items.length === 0 && (
                  <p className="text-xs text-neutral-500">{t('details.noItems')}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {t('details.adminNote')}
              </label>
              <Textarea
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                placeholder={t('details.adminNotePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {t('filters.status')}
              </label>
              <Select
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {t('details.recentEvents')}
              </p>
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-neutral-100 p-2 text-xs dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{event.type}</span>
                      <span className="text-neutral-500">
                        {format.dateTime(new Date(event.createdAt), {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-xs text-neutral-500">{t('details.noEvents')}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          {t('details.close')}
        </Button>
        <Button onClick={handleUpdate} disabled={loading || !cart}>
          {t('details.save')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
