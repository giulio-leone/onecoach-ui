/**
 * Admin Users & Access Page Client Component
 *
 * Client component per gestione tabs e stato - Refactored
 * Uses Catalog Design System with optimized responsive UI
 * Includes full CRUD operations with Realtime sync
 */
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CatalogHeader,
  type FilterOption,
  AdminCard,
  AdminTabs,
  AdminTabPanel,
  type AdminTab,
} from '@giulio-leone/ui';
import { CreateInvitationModal } from './components/invitations/create-invitation-modal';
import { InvitationCard } from './components/invitations/invitation-card';
import {
  EditUserModal,
  ManageCreditsModal,
  UserStatusModal,
  UserCard,
} from './components';
import { Button, Input, Select, Switch } from '@giulio-leone/ui';
import { toast } from 'sonner';
import {
  Loader2,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  Grid3X3,
  List,
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import type { UserWithCounts } from '@giulio-leone/types/prisma-helpers';
import { cn } from '@giulio-leone/lib-design-system';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@giulio-leone/lib-shared';
import { isAdminRole } from "@giulio-leone/types/core";

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
interface UsersPageClientProps {
  initialUsers: UserWithCounts[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  currentUserRole: string;
  useRealtimeSync?: () => void;
}
type RoleFilter = UserWithCounts['role'] | 'ALL' | 'ADMIN_ALL';
export function UsersPageClient({
  initialUsers,
  initialTotal,
  initialPage,
  initialPageSize,
  currentUserRole,
  useRealtimeSync,
}: UsersPageClientProps) {
  // Abilita Realtime sync per utenti admin (optional)
  useRealtimeSync?.();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('users');
  const [users, setUsers] = useState<UserWithCounts[]>(initialUsers);
  const [usersTotal, setUsersTotal] = useState<number>(initialTotal);
  const [userPage, setUserPage] = useState<number>(initialPage);
  const [userPageSize, setUserPageSize] = useState<number>(initialPageSize);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch] = useDebounce(userSearch, 400);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  // Modal states
  const [editingUser, setEditingUser] = useState<UserWithCounts | null>(null);
  const [creditsUser, setCreditsUser] = useState<UserWithCounts | null>(null);
  const [statusUser, setStatusUser] = useState<UserWithCounts | null>(null);
  const [statusAction, setStatusAction] = useState<'suspend' | 'activate' | 'delete'>('suspend');
  // Invitations state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [invStatusFilter, setInvStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(false);
  const t = useTranslations('admin.users');
  const tAdmin = useTranslations('admin');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  // Refresh users from server (paginato)
  const refreshUsers = useCallback(
    async (nextPage?: number, nextPageSize?: number) => {
      setIsLoadingUsers(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage ?? userPage),
          pageSize: String(nextPageSize ?? userPageSize),
        });
        if (roleFilter !== 'ALL') params.set('role', roleFilter);
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (debouncedUserSearch) params.set('search', debouncedUserSearch);
        const response = await fetch(`/api/admin/users?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data.users || []);
        setUsersTotal(data.pagination?.total ?? data.total ?? data.users?.length ?? 0);
        setUserPage(data.pagination?.page ?? nextPage ?? userPage);
        setUserPageSize(data.pagination?.pageSize ?? nextPageSize ?? userPageSize);
        // Also invalidate query cache for realtime sync
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      } catch (error) {
        logger.error('Error refreshing users:', error);
        toast.error(tAdmin('loadError'));
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [debouncedUserSearch, queryClient, roleFilter, statusFilter, userPage, userPageSize, tAdmin]
  );
  // Calculate stats
  const activeUsers = useMemo(() => users.filter((u: any) => u.status === 'ACTIVE').length, [users]);
  const adminUsers = useMemo(() => users.filter((u: any) => isAdminRole(u.role)).length, [users]);
  const suspendedUsers = useMemo(
    () => users.filter((u: any) => u.status === 'SUSPENDED').length,
    [users]
  );
  const stats = [
    { label: t('stats.total'), value: usersTotal },
    { label: t('stats.active'), value: activeUsers },
    { label: t('stats.admin'), value: adminUsers },
    { label: t('stats.suspended'), value: suspendedUsers },
  ];
  // Filter users
  const filteredUsers = useMemo(() => {
    let result = users;
    if (debouncedUserSearch) {
      const lower = debouncedUserSearch.toLowerCase();
      result = result.filter((u: any) => u.name?.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
      );
    }
    if (roleFilter !== 'ALL') {
      result =
        roleFilter === 'ADMIN_ALL'
          ? result.filter((u: any) => isAdminRole(u.role))
          : result.filter((u: any) => u.role === roleFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((u: any) => u.status === statusFilter);
    }
    return result;
  }, [users, debouncedUserSearch, roleFilter, statusFilter]);
  // Invitations handlers
  const fetchInvitations = useCallback(async () => {
    setIsLoadingInvitations(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: debouncedSearch,
      });
      if (invStatusFilter !== 'ALL') params.append('status', invStatusFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      const response = await fetch(`/api/admin/invitations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const data = await response.json();
      setInvitations(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (error: unknown) {
      toast.error(tAdmin('invitations.loadError'));
      logger.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [page, debouncedSearch, invStatusFilter, typeFilter, tAdmin]);
  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const response = await fetch('/api/admin/invitations/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setIsRegistrationEnabled(data.enabled ?? false);
    } catch (error: unknown) {
      toast.error(tAdmin('settingsError'));
      logger.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingSettings(false);
    }
  }, [tAdmin]);
  const handleToggleRegistration = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      const response = await fetch('/api/admin/invitations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const data = await response.json();
      setIsRegistrationEnabled(data.enabled);
      toast.success(
        enabled ? tAdmin('invitations.settings.successEnable') : tAdmin('invitations.settings.successDisable')
      );
    } catch (error: unknown) {
      toast.error(tAdmin('settingsUpdateError'));
      logger.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsToggling(false);
    }
  };
  const handleRevoke = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/invitations/${id}/revoke`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to revoke invitation');
      toast.success(tAdmin('invitations.revokeSuccess'));
      fetchInvitations();
    } catch (error: unknown) {
      toast.error(tAdmin('invitationRevokeError'));
      logger.error(error instanceof Error ? error.message : String(error));
    }
  };
  // Aggiorna utenti quando cambiano filtri/search/paginazione
  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);
  useEffect(() => {
    if (activeTab === 'invitations') {
      fetchInvitations();
      fetchSettings();
    }
  }, [
    activeTab,
    page,
    debouncedSearch,
    invStatusFilter,
    typeFilter,
    fetchInvitations,
    fetchSettings,
  ]);
  // Modal handlers
  const handleEdit = (user: UserWithCounts) => setEditingUser(user);
  const handleManageCredits = (user: UserWithCounts) => setCreditsUser(user);
  const handleSuspend = (user: UserWithCounts) => {
    setStatusUser(user);
    setStatusAction('suspend');
  };
  const handleActivate = (user: UserWithCounts) => {
    setStatusUser(user);
    setStatusAction('activate');
  };
  const handleDelete = (user: UserWithCounts) => {
    setStatusUser(user);
    setStatusAction('delete');
  };
  const tabs: AdminTab[] = [
    {
      id: 'users',
      label: t('tabs.users'),
      count: users.length,
    },
    {
      id: 'invitations',
      label: t('tabs.invitations'),
      count: totalItems,
    },
  ];
  const roleFilterOptions: FilterOption[] = [
    { label: t('filters.roles.ALL'), value: 'ALL' },
    { label: t('filters.roles.USER'), value: 'USER' },
    { label: t('filters.roles.COACH'), value: 'COACH' },
    { label: t('filters.roles.ADMIN_ALL'), value: 'ADMIN_ALL' },
    { label: t('filters.roles.ADMIN'), value: 'ADMIN' },
    { label: t('filters.roles.SUPER_ADMIN'), value: 'SUPER_ADMIN' },
  ];
  const statusFilterOptions: FilterOption[] = [
    { label: t('filters.status.ALL'), value: 'ALL' },
    { label: t('filters.status.ACTIVE'), value: 'ACTIVE' },
    { label: t('filters.status.SUSPENDED'), value: 'SUSPENDED' },
    { label: t('filters.status.PENDING'), value: 'PENDING' },
  ];
  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-6 sm:py-8">
      {/* Header */}
      <CatalogHeader title={t('title')} description={t('subtitle')} stats={stats} />
      {/* Tabs */}
      <AdminTabs tabs={tabs} defaultTab="users" onTabChange={setActiveTab} />
      {/* Users Tab */}
      <AdminTabPanel activeTab={activeTab} tabId="users">
        <div className="space-y-4 sm:space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-white/[0.08] dark:bg-neutral-900/50">
            {/* Search + View Toggle (Mobile: full width) */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={userSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="h-11 pl-10"
                />
              </div>
              {/* View Toggle - Hidden on mobile */}
              <div className="hidden items-center gap-1 rounded-lg border border-neutral-200 p-1 sm:flex dark:border-neutral-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                      : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Filter Dropdowns */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                <Select
                  value={roleFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setRoleFilter(e.target.value as RoleFilter)
                  }
                  className="h-10 text-sm"
                >
                  {roleFilterOptions.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-10 text-sm"
                >
                  {statusFilterOptions.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              {/* Results count */}
              <div className="ml-auto hidden text-sm text-neutral-500 sm:block">
                {t('filters.resultsCount', { count: usersTotal })}
              </div>
              {/* Refresh button */}
              <Button
                variant="outline"
                iconOnly
                onClick={() => void refreshUsers()}
                title={t('actions.refresh')}
                className="hidden h-10 w-10 sm:flex"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {/* Mobile: Results count */}
            <div className="text-center text-sm text-neutral-500 sm:hidden">
              {t('filters.resultsFoundCount', { count: usersTotal })}
            </div>
          </div>
          {/* Users Grid/List */}
          {isLoadingUsers ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 text-center dark:border-neutral-800">
              <Users className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                {t('list.empty')}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {t('list.emptyDescription')}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsers.map((user: any) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onManageCredits={handleManageCredits}
                  onSuspend={handleSuspend}
                  onActivate={handleActivate}
                  onDelete={handleDelete}
                  currentUserRole={currentUserRole}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-white/[0.08] dark:bg-neutral-900/50"
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600 text-sm font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">
                      {user.name || t('list.userFallback')}
                    </p>
                    <p className="truncate text-sm text-neutral-500">{user.email}</p>
                  </div>
                  {/* Role Badge */}
                  <span className="hidden rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 sm:inline-flex dark:bg-neutral-800 dark:text-neutral-300">
                    {user.role}
                  </span>
                  {/* Credits */}
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {user.credits}
                    </p>
                    <p className="text-xs text-neutral-500">{t('list.credits')}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                      {t('list.edit')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-neutral-900/50">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('pagination.total')}: {usersTotal} •{' '}
              {t('pagination.page', {
                current: userPage,
                total: Math.max(1, Math.ceil(usersTotal / userPageSize)),
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(userPageSize)}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const nextSize = parseInt(e.target.value, 10);
                  setUserPageSize(nextSize);
                  setUserPage(1);
                  void refreshUsers(1, nextSize);
                }}
                className="h-10 text-sm"
              >
                {[10, 20, 50, 100].map((size: any) => (
                  <option key={size} value={size}>
                    {t('pagination.perPage', { size })}
                  </option>
                ))}
              </Select>
              <Button
                variant="outline"
                iconOnly
                onClick={() => {
                  const next = Math.max(1, userPage - 1);
                  setUserPage(next);
                  void refreshUsers(next);
                }}
                disabled={userPage === 1 || isLoadingUsers}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                iconOnly
                onClick={() => {
                  const totalPagesUsers = Math.max(1, Math.ceil(usersTotal / userPageSize));
                  const next = Math.min(totalPagesUsers, userPage + 1);
                  setUserPage(next);
                  void refreshUsers(next);
                }}
                disabled={userPage * userPageSize >= usersTotal || isLoadingUsers}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AdminTabPanel>
      {/* Invitations Tab */}
      <AdminTabPanel activeTab={activeTab} tabId="invitations">
        <div className="space-y-4 sm:space-y-6">
          {/* Registration Settings Toggle */}
          <AdminCard title={t('invitations.settings.title')} variant="glass" padding="md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {t('invitations.settings.inviteOnly')}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {isRegistrationEnabled
                    ? t('invitations.settings.activeDescription')
                    : t('invitations.settings.inactiveDescription')}
                </p>
              </div>
              <div className="flex-shrink-0">
                {isLoadingSettings ? (
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                ) : (
                  <Switch
                    checked={isRegistrationEnabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleToggleRegistration(e.target.checked)
                    }
                    disabled={isToggling}
                    size="lg"
                    variant="primary"
                    labelPosition="left"
                  />
                )}
              </div>
            </div>
          </AdminCard>
          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {t('invitations.totalCount', { count: totalItems })}
            </div>
            <CreateInvitationModal onSuccess={fetchInvitations} />
          </div>
          {/* Filters & Search */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 dark:border-white/[0.08] dark:bg-neutral-900/50">
            <div className="relative flex-1">
              <Search className="absolute top-3 left-3 h-5 w-5 text-neutral-400" />
              <Input
                placeholder={t('invitations.searchPlaceholder')}
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="h-11 pl-10"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                <Select
                  value={invStatusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setInvStatusFilter(e.target.value)
                  }
                  className="h-10 text-sm"
                >
                  <option value="ALL">{t('invitations.filters.status')}</option>
                  <option value="ACTIVE">{t('invitations.filters.active')}</option>
                  <option value="USED">{t('invitations.filters.used')}</option>
                  <option value="REVOKED">{t('invitations.filters.revoked')}</option>
                  <option value="EXPIRED">{t('invitations.filters.expired')}</option>
                </Select>
                <Select
                  value={typeFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTypeFilter(e.target.value)
                  }
                  className="h-10 text-sm"
                >
                  <option value="ALL">{t('invitations.filters.types')}</option>
                  <option value="ONE_TIME">{t('invitations.filters.oneTime')}</option>
                  <option value="MULTI_USE">{t('invitations.filters.multiUse')}</option>
                </Select>
              </div>
              <Button
                variant="outline"
                iconOnly
                onClick={fetchInvitations}
                title={t('actions.refresh')}
                className="ml-auto hidden h-10 w-10 sm:flex"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingInvitations ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          {/* Content */}
          {isLoadingInvitations && invitations.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
              <Loader2 className="text-primary-500 h-8 w-8 animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 text-center dark:border-neutral-800">
              <Filter className="mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                {t('invitations.empty')}
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                {t('invitations.emptyDescription')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {invitations.map((invitation: any) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onRevoke={handleRevoke}
                />
              ))}
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                iconOnly
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoadingInvitations}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {t('pagination.page', { current: page, total: totalPages })}
              </span>
              <Button
                variant="outline"
                iconOnly
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoadingInvitations}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </AdminTabPanel>
      {/* Modals */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={refreshUsers}
        currentUserRole={currentUserRole}
      />
      <ManageCreditsModal
        user={creditsUser}
        isOpen={!!creditsUser}
        onClose={() => setCreditsUser(null)}
        onSuccess={refreshUsers}
      />
      <UserStatusModal
        user={statusUser}
        action={statusAction}
        isOpen={!!statusUser}
        onClose={() => setStatusUser(null)}
        onSuccess={refreshUsers}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
