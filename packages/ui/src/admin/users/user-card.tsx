'use client';

import { useState } from 'react';
import { Button } from '../../button';
import { Card } from '../../card';
import {
  User,
  Edit,
  Ban,
  CheckCircle,
  Coins,
  Trash2,
  MoreVertical,
  Crown,
  Shield,
  Mail,
  Calendar,
  Dumbbell,
  Utensils,
} from 'lucide-react';
import type { UserWithCounts } from '@giulio-leone/types/prisma-helpers';
import { cn } from '@giulio-leone/lib-design-system';
import { useTranslations, useFormatter } from 'next-intl';

interface UserCardProps {
  user: UserWithCounts;
  onEdit: (user: UserWithCounts) => void;
  onManageCredits: (user: UserWithCounts) => void;
  onSuspend: (user: UserWithCounts) => void;
  onActivate: (user: UserWithCounts) => void;
  onDelete: (user: UserWithCounts) => void;
  currentUserRole: string;
}

const roleConfig: Record<string, { color: string; icon: typeof User }> = {
  USER: {
    color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    icon: User,
  },
  COACH: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Dumbbell,
  },
  ADMIN: {
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    icon: Shield,
  },
  SUPER_ADMIN: {
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: Crown,
  },
};

const statusConfig: Record<string, { color: string }> = {
  ACTIVE: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  SUSPENDED: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  PENDING: {
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  DELETED: {
    color: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500',
  },
};

export function UserCard({
  user,
  onEdit,
  onManageCredits,
  onSuspend,
  onActivate,
  onDelete,
  currentUserRole,
}: UserCardProps) {
  const [showActions, setShowActions] = useState(false);
  const t = useTranslations('admin.users');
  const format = useFormatter();

  const roleKey: keyof typeof roleConfig =
    user.role && user.role in roleConfig ? (user.role as keyof typeof roleConfig) : 'USER';

  const statusKey: keyof typeof statusConfig =
    user.status && user.status in statusConfig
      ? (user.status as keyof typeof statusConfig)
      : 'ACTIVE';

  const role = roleConfig[roleKey]!;
  const status = statusConfig[statusKey]!;
  const RoleIcon = role.icon;

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const canDelete = currentUserRole === 'SUPER_ADMIN' && !isSuperAdmin;
  const isActive = user.status === 'ACTIVE';

  // Generate initials for avatar
  const safeEmail = user.email || '';
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : safeEmail.slice(0, 1).toUpperCase() || '?';

  // Avatar background based on role
  const avatarColors: Record<string, string> = {
    USER: 'bg-gradient-to-br from-neutral-400 to-neutral-600',
    COACH: 'bg-gradient-to-br from-blue-400 to-blue-600',
    ADMIN: 'bg-gradient-to-br from-purple-400 to-purple-600',
    SUPER_ADMIN: 'bg-gradient-to-br from-amber-400 to-amber-600',
  };

  return (
    <Card
      variant="glass"
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg',
        user.status === 'SUSPENDED' && 'opacity-75'
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn('absolute top-0 left-0 h-1 w-full', isActive ? 'bg-green-500' : 'bg-red-500')}
      />
      <div className="p-4 sm:p-5">
        {/* Header: Avatar + Name + Actions */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar */}
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-md sm:h-14 sm:w-14 sm:text-xl',
              avatarColors[user.role] || avatarColors.USER
            )}
          >
            {initials}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                  {user.name || t('list.userFallback')}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                  <Mail className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Actions Menu Toggle */}
              <div className="relative flex-shrink-0">
                <Button
                  variant="ghost"
                  iconOnly
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="h-8 w-8 opacity-70 hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {/* Dropdown Menu */}
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
                    <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                      <button
                        onClick={() => {
                          onEdit(user);
                          setShowActions(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        <Edit className="h-4 w-4" />
                        {t('list.edit')}
                      </button>
                      <button
                        onClick={() => {
                          onManageCredits(user);
                          setShowActions(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      >
                        <Coins className="h-4 w-4" />
                        {t('actions.manageCredits')}
                      </button>

                      <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />

                      {isActive ? (
                        <button
                          onClick={() => {
                            onSuspend(user);
                            setShowActions(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                        >
                          <Ban className="h-4 w-4" />
                          {t('actions.suspend')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onActivate(user);
                            setShowActions(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t('actions.activate')}
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => {
                            onDelete(user);
                            setShowActions(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('actions.delete')}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  role.color
                )}
              >
                <RoleIcon className="h-3 w-3" />
                {t(`filters.roles.${roleKey}`)}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  status.color
                )}
              >
                {t(`filters.status.${statusKey}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-neutral-50 p-2.5 sm:gap-3 sm:p-3 dark:bg-neutral-800/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Coins className="h-3.5 w-3.5" />
            </div>
            <p className="mt-0.5 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
              {user.credits}
            </p>
            <p className="text-[10px] text-neutral-500 sm:text-xs">{t('list.credits')}</p>
          </div>
          <div className="border-x border-neutral-200 text-center dark:border-neutral-700">
            <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Dumbbell className="h-3.5 w-3.5" />
            </div>
            <p className="mt-0.5 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
              {user._count.workout_programs}
            </p>
            <p className="text-[10px] text-neutral-500 sm:text-xs">{t('list.workouts')}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Utensils className="h-3.5 w-3.5" />
            </div>
            <p className="mt-0.5 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
              {user._count.nutrition_plans}
            </p>
            <p className="text-[10px] text-neutral-500 sm:text-xs">{t('list.nutrition')}</p>
          </div>
        </div>

        {/* Footer: Date */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          <Calendar className="h-3 w-3" />
          <span>
            {t('list.registered')} {format.relativeTime(new Date(user.createdAt))}
          </span>
        </div>
      </div>

      {/* Quick Actions Bar - Visible on hover (desktop) */}
      <div className="absolute right-0 bottom-0 left-0 flex hidden translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-neutral-100 to-transparent p-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:flex dark:from-neutral-800">
        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          {t('list.edit')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onManageCredits(user)}>
          <Coins className="mr-1.5 h-3.5 w-3.5" />
          {t('list.credits')}
        </Button>
        {isActive ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuspend(user)}
            className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            <Ban className="mr-1.5 h-3.5 w-3.5" />
            {t('actions.suspend')}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActivate(user)}
            className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            {t('actions.activate')}
          </Button>
        )}
      </div>
    </Card>
  );
}
