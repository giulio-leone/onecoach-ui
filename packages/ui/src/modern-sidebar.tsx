'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@giulio-leone/lib-design-system';
import { SidebarItem } from './sidebar-item';
import { ThemeToggle } from './theme-toggle';
import { Button } from './button';
import { Drawer } from './drawer';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  MoreVertical,
  Shield,
  GraduationCap,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

export interface SidebarNavigationItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  children?: SidebarNavigationItem[];
  defaultOpen?: boolean;
}

interface UserProfile {
  name: string | null;
  email: string;
  image?: string | null;
  role?: string;
  credits?: number;
}

interface ModernSidebarProps {
  navigation: SidebarNavigationItem[];
  user?: UserProfile;
  pathname: string;
  /**
   * Percorso corrente con query string (es. /admin/ai-settings?section=providers)
   * per evidenziare correttamente le sottovoci che usano parametri.
   */
  currentPath?: string;
  onSignOut?: () => void;
  className?: string;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  extraContent?: ReactNode;
}

const isRouteActive = (currentPath: string, href?: string) =>
  href
    ? currentPath === href ||
      (href !== '/dashboard' && href !== '/admin' && currentPath.startsWith(href))
    : false;

const getItemKey = (item: SidebarNavigationItem) => item.href ?? item.name;

const collectOpenState = (
  items: SidebarNavigationItem[],
  currentPath: string,
  prevState: Record<string, boolean>
): Record<string, boolean> => {
  const nextState: Record<string, boolean> = { ...prevState };

  const visit = (item: SidebarNavigationItem): boolean => {
    const hasChildren = Boolean(item.children?.length);
    const key = getItemKey(item);

    const childIsActive = hasChildren ? item.children!.some(visit) : false;
    const selfIsActive = isRouteActive(currentPath, item.href);

    if (hasChildren) {
      const shouldDefaultOpen = item.defaultOpen && nextState[key] === undefined;
      const shouldForceOpen = childIsActive;

      if (shouldDefaultOpen || shouldForceOpen) {
        nextState[key] = true;
      } else if (nextState[key] === undefined) {
        nextState[key] = false;
      }
    }

    return selfIsActive || childIsActive;
  };

  items.forEach(visit);
  return nextState;
};

export function ModernSidebar({
  navigation,
  user,
  pathname,
  currentPath,
  onSignOut,
  className,
  isMobile = false,
  onCloseMobile,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
  extraContent,
}: ModernSidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = controlledIsCollapsed ?? internalIsCollapsed;
  const handleToggleCollapse =
    onToggleCollapse ??
    (() => {
      if (!isCollapsed) setIsProfileOpen(false);
      setInternalIsCollapsed(!isCollapsed);
    });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const effectivePath = currentPath ?? pathname;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    collectOpenState(navigation, effectivePath, {})
  );

  useEffect(() => {
    setOpenGroups((prev) => collectOpenState(navigation, effectivePath, prev));
  }, [navigation, effectivePath]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isItemActive = (item: SidebarNavigationItem): boolean =>
    isRouteActive(effectivePath, item.href) || Boolean(item.children?.some(isItemActive));

  const renderItems = (items: SidebarNavigationItem[], depth = 0) =>
    items.map((item: any) => {
      const hasChildren = Boolean(item.children?.length);
      const key = getItemKey(item);
      const isGroupOpen = openGroups[key];
      const isActive = isRouteActive(effectivePath, item.href);
      const hasActiveChild = hasChildren && item.children!.some(isItemActive);

      if (hasChildren) {
        return (
          <div key={key} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup(key)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl py-2.5 pr-3 text-left transition-all duration-200',
                'hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
                (isActive || hasActiveChild || isGroupOpen) &&
                  'bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
                isCollapsed && 'justify-center px-2'
              )}
              style={isCollapsed ? undefined : { paddingLeft: 12 + depth * 12 }}
            >
              <div className="relative z-10 flex items-center gap-3">
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive || hasActiveChild || isGroupOpen
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
                  )}
                />
                {!isCollapsed && <span className="font-medium tracking-tight">{item.name}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {item.badge}
                </span>
              )}

              <ChevronDown
                className={cn(
                  'ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
                  isGroupOpen && 'rotate-180',
                  isCollapsed && 'hidden'
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && isGroupOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {renderItems(item.children!, depth + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      if (!item.href) return null;

      return (
        <SidebarItem
          key={key}
          name={item.name}
          href={item.href}
          icon={item.icon}
          badge={item.badge}
          depth={depth}
          isActive={isActive}
          isCollapsed={isCollapsed}
          onClick={isMobile ? onCloseMobile : undefined}
        />
      );
    });

  const sidebarVariants = {
    expanded: { width: SIDEBAR_WIDTH },
    collapsed: { width: SIDEBAR_COLLAPSED_WIDTH },
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isCoach = user?.role === 'COACH' || isAdmin;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-24 items-center justify-between px-6">
        <Link href="/dashboard" className="group flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Sparkles className="h-6 w-6" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col justify-center"
            >
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                onecoach
              </span>
              {!isMobile && (
                <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                  Admin Panel
                </span>
              )}
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div
        className={cn(
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 overflow-y-auto px-4 py-2',
          isMobile ? 'flex-1' : extraContent ? 'max-h-[35vh] flex-none' : 'flex-1'
        )}
      >
        <nav className="space-y-1.5">{renderItems(navigation)}</nav>
      </div>

      {/* Extra Content (Injected - e.g., Chat Conversations) */}
      {!isCollapsed &&
        extraContent &&
        (isMobile ? (
          <>
            {/* Mobile Quick Actions - Sits below nav */}
            <div className="border-t border-slate-200/50 px-4 py-3 dark:border-slate-800/50">
              <div className="grid grid-cols-2 gap-2">
                <Link href="/chat" onClick={onCloseMobile}>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={MessageSquare}
                    className="shadow-lg shadow-blue-500/20"
                  >
                    Nuova Chat
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setIsChatModalOpen(true);
                    // Do NOT close mobile sidebar here, otherwise the local state is lost and modal never opens
                    // onCloseMobile?.(); 
                  }}
                  className="border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Storico
                </Button>
              </div>
            </div>

            <Drawer
              isOpen={isChatModalOpen}
              onClose={() => setIsChatModalOpen(false)}
              position="right"
              mobileFullScreen
              size="lg"
            >
              <div className="flex h-full flex-col">{extraContent}</div>
            </Drawer>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-600 flex-1 overflow-y-auto">
              {extraContent}
            </div>
          </div>
        ))}

      {/* Footer / User Profile - Sticky at bottom */}
      <div className="mt-auto border-t border-slate-200 bg-slate-50/50 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
        {!isCollapsed ? (
          <div className="space-y-4">
            {/* Credits Card */}
            {user?.credits !== undefined && (
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl dark:from-blue-600 dark:to-indigo-600',
                  isMobile ? 'p-3' : 'p-5'
                )}
              >
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'font-medium text-slate-300 dark:text-blue-100',
                      isMobile ? 'text-[10px]' : 'text-xs'
                    )}
                  >
                    Credits Balance
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    PRO
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={cn('font-bold', isMobile ? 'text-xl' : 'text-3xl')}>
                    {user.credits}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-blue-200">CR</span>
                </div>
                {!isMobile && (
                  <Link
                    href="/pricing"
                    className="mt-4 block w-full rounded-lg bg-white/10 py-2 text-center text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
                  >
                    Recharge Now
                  </Link>
                )}
              </div>
            )}

            {/* User Info */}
            <div className="relative rounded-xl border border-transparent bg-transparent transition-colors hover:border-slate-200 hover:bg-white hover:shadow-sm dark:hover:border-slate-700 dark:hover:bg-slate-800">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex w-full items-center gap-3 px-2 py-2"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-md">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-1 flex-col items-start overflow-hidden">
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name || 'User'}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </span>
                </div>
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>

              {/* Badges */}
              {(isAdmin || isCoach) && (
                <div className="flex flex-wrap gap-2 px-2 pb-2">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <Shield className="h-3 w-3" /> ADMIN
                    </span>
                  )}
                  {isCoach && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      <GraduationCap className="h-3 w-3" /> COACH
                    </span>
                  )}
                </div>
              )}

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="p-1">
                      <div className="px-3 py-2">
                        <ThemeToggle />
                      </div>
                      <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                      <button
                        onClick={onSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shadow-md">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={onSignOut}
              className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div
        className={cn(
          'h-full w-full border-r border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80',
          className
        )}
      >
        {sidebarContent}
      </div>
    );
  }

  return (
    <>
      <motion.aside
        initial={isCollapsed ? 'collapsed' : 'expanded'}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className={cn(
          'relative hidden h-screen overflow-visible border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-all duration-300 lg:block dark:border-slate-800 dark:bg-slate-950/90',
          className
        )}
        aria-expanded={!isCollapsed}
        style={{ minWidth: SIDEBAR_COLLAPSED_WIDTH }}
      >
        {sidebarContent}

        {/* Collapse Toggle */}
        <button
          onClick={handleToggleCollapse}
          className="absolute top-28 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:scale-110 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-blue-400"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>
    </>
  );
}
