/**
 * Protected Header Component
 *
 * Header per pagine protette con navigazione
 */

'use client';

import { Link, usePathname } from './navigation';

import { useSignOut } from '@giulio-leone/lib-api/hooks';
import { useHeaderActions } from '@giulio-leone/lib-stores';
import {
  LayoutDashboard,
  MessageSquare,
  Dumbbell,
  Apple,
  CreditCard,
  Shield,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../core/theme-toggle';
import { LanguageSwitcher } from './language-switcher';

import { useTranslations } from 'next-intl';
import { isAdminRole } from "@giulio-leone/types/core";
import { normalizeRole } from "@giulio-leone/types";


interface ProtectedHeaderProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    credits: number;
  };
}

export function ProtectedHeader({ user }: ProtectedHeaderProps) {
  const t = useTranslations('layout.header');
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const signOut = useSignOut();
  const actions = useHeaderActions((state) => state.actions);
  const normalizedRole = normalizeRole(user.role);
  const showAdminMenu = isAdminRole(user.role);
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';

  const navigation = [
    {
      name: t('nav.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('nav.profile'),
      href: '/profile',
      icon: User,
    },
    {
      name: t('nav.chat'),
      href: '/chat',
      icon: MessageSquare,
    },
    {
      name: t('nav.workouts'),
      href: '/workouts',
      icon: Dumbbell,
    },
    {
      name: t('nav.nutrition'),
      href: '/nutrition',
      icon: Apple,
    },
    {
      name: t('nav.pricing'),
      href: '/pricing',
      icon: CreditCard,
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo & Injected Actions */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                onecoach
              </span>
            </Link>

            {/* Injected Actions (e.g. Sidebar Toggles, Back Buttons) */}
            {actions && (
              <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 dark:border-neutral-800">
                {actions}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href} // Changed key to href as name is now localized and might change
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher, Theme Toggle & User menu */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-2.5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/60"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {user.name || t('user_menu.user_fallback')}
                  </p>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {user.credits} {t('user_menu.credits')}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Premium Dropdown with Animation */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute top-full right-0 z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-black/70"
                    >
                      {/* User Info Header */}
                      <div className="border-b border-neutral-200/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 dark:border-white/5 dark:from-indigo-900/20 dark:to-purple-900/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                              {user.name || t('user_menu.user_fallback')}
                            </p>
                            <p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {showAdminMenu && (
                          <span
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                              isSuperAdmin
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            }`}
                          >
                            <Shield className="h-3 w-3" />
                            {isSuperAdmin ? t('user_menu.super_admin') : t('user_menu.admin_role')}
                          </span>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-indigo-50 dark:text-neutral-300 dark:hover:bg-white/10"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <User className="h-4 w-4" />
                          </div>
                          {t('user_menu.profile')}
                        </Link>

                        {showAdminMenu && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-purple-50 dark:text-neutral-300 dark:hover:bg-white/10"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                              <Shield className="h-4 w-4" />
                            </div>
                            {t('user_menu.admin')}
                          </Link>
                        )}

                        <div className="my-2 border-t border-neutral-200/50 dark:border-white/5" />

                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <LogOut className="h-4 w-4" />
                          </div>
                          {t('user_menu.logout')}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
