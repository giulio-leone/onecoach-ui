'use client';

import { useState, useMemo } from 'react';
import { cn } from '@giulio-leone/lib-design-system';
import {
  Bell,
  Check,
  CheckCheck,
  Dumbbell,
  Flame,
  Inbox,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type:
    | 'adaptation_ready'
    | 'workout_reminder'
    | 'nutrition_alert'
    | 'pr_achieved'
    | 'deload_suggested'
    | 'goal_milestone'
    | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: { label: string; value: string };
  icon?: string;
}

export interface NotificationCenterProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  onMarkAllRead?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AppNotification['type'],
  { icon: React.ComponentType<{ className?: string }>; emoji: string; color: string }
> = {
  adaptation_ready: { icon: Zap, emoji: '⚡', color: 'text-amber-500' },
  workout_reminder: { icon: Dumbbell, emoji: '🏋️', color: 'text-primary-500' },
  nutrition_alert: { icon: Flame, emoji: '🍎', color: 'text-emerald-500' },
  pr_achieved: { icon: Trophy, emoji: '🏆', color: 'text-yellow-500' },
  deload_suggested: { icon: Check, emoji: '🔄', color: 'text-violet-500' },
  goal_milestone: { icon: Trophy, emoji: '🎯', color: 'text-rose-500' },
  system: { icon: Bell, emoji: '🔔', color: 'text-neutral-500' },
};

const PRIORITY_BORDER: Record<AppNotification['priority'], string> = {
  high: 'border-l-rose-500',
  medium: 'border-l-amber-400',
  low: 'border-l-transparent',
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'adesso';
  if (mins < 60) return `${mins} min fa`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'giorno' : 'giorni'} fa`;
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

type TimeGroup = 'today' | 'this_week' | 'earlier';

function groupByTime(notifications: AppNotification[]): Record<TimeGroup, AppNotification[]> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - now.getDay() * 86_400_000;

  const groups: Record<TimeGroup, AppNotification[]> = { today: [], this_week: [], earlier: [] };

  for (const n of notifications) {
    const t = new Date(n.timestamp).getTime();
    if (t >= startOfToday) groups.today.push(n);
    else if (t >= startOfWeek) groups.this_week.push(n);
    else groups.earlier.push(n);
  }

  return groups;
}

const GROUP_LABELS: Record<TimeGroup, string> = {
  today: 'Oggi',
  this_week: 'Questa settimana',
  earlier: 'Precedenti',
};

// ── Notification item ──────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onDismiss,
  onAction,
}: {
  notification: AppNotification;
  onDismiss: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative flex gap-3 border-l-[3px] px-4 py-3 transition-colors',
        PRIORITY_BORDER[notification.priority],
        notification.read
          ? 'bg-transparent'
          : 'bg-primary-50/50 dark:bg-primary-500/5',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          notification.read
            ? 'bg-neutral-100 dark:bg-neutral-800'
            : 'bg-white shadow-sm dark:bg-neutral-800',
        )}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-tight',
              notification.read
                ? 'font-medium text-neutral-600 dark:text-neutral-400'
                : 'font-semibold text-neutral-900 dark:text-white',
            )}
          >
            {notification.title}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(notification.id)}
            className="shrink-0 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">{relativeTime(notification.timestamp)}</span>
          {notification.action && onAction && (
            <button
              type="button"
              onClick={() => onAction(notification.id, notification.action!.value)}
              className="rounded-md bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold text-primary-600 transition-colors hover:bg-primary-500/20 dark:text-primary-400"
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary-500" />
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function NotificationCenter({
  notifications,
  onDismiss,
  onAction,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const groups = useMemo(() => groupByTime(notifications), [notifications]);

  const groupOrder: TimeGroup[] = ['today', 'this_week', 'earlier'];

  return (
    <div className="relative">
      {/* ── Bell trigger ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            className={cn(
              'absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xl dark:border-white/[0.08] dark:bg-neutral-900',
              'max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:mt-0 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                Notifiche
              </span>
              <div className="flex items-center gap-2">
                {onMarkAllRead && unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Segna tutto come letto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 sm:hidden dark:hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto max-sm:max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <Inbox className="h-6 w-6 text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Nessuna notifica
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Continua così! Torneremo quando ci sarà qualcosa di importante.
                  </p>
                </div>
              ) : (
                groupOrder.map((group) => {
                  const items = groups[group];
                  if (items.length === 0) return null;
                  return (
                    <div key={group}>
                      <p className="sticky top-0 z-10 bg-neutral-50/90 px-4 py-1.5 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase backdrop-blur-sm dark:bg-neutral-900/90">
                        {GROUP_LABELS[group]}
                      </p>
                      {items.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onDismiss={onDismiss}
                          onAction={onAction}
                        />
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
