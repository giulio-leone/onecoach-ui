'use client';

/**
 * AppShell Sidebar
 *
 * Navigazione responsive per le aree protette/admin.
 * Incapsula la logica di collapsible sidebar, mobile overlay
 * e deduplicazione delle rotte per evitare chiavi duplicate.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Dumbbell,
  Apple,
  User,
  Users,
  Calendar,
  Settings,
  Plane,
} from 'lucide-react';
import { ModernSidebar, type SidebarNavigationItem } from '../modern-sidebar';
import { useSignOut } from '@onecoach/lib-api/hooks';
import { useUIStore } from '@onecoach/lib-stores';

export interface AppShellSidebarProps {
  user: AuthenticatedUser;
  navigation?: SidebarNavigationItem[];
}

// ... imports kept ... (Logic below replaces the function body)

import { useTranslations } from 'next-intl';
import type { AuthenticatedUser } from "@onecoach/types-core";

export function AppShellSidebar({
  user, navigation: propsNavigation }: AppShellSidebarProps) {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const signOut = useSignOut();
  // Using local state for collapse since store doesn't support it
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Use global UI store for mobile menu state to sync with header toggle
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const effectiveUser = user;

  // Internal navigation definition with translations
  const defaultNavigation: SidebarNavigationItem[] = [
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('workouts'), href: '/workouts', icon: Dumbbell },
    { name: t('nutrition'), href: '/nutrition', icon: Apple },
    { name: t('sidebar.agenda'), href: '/calendar', icon: Calendar },
    { name: t('sidebar.aiChat'), href: '/chat', icon: MessageSquare },
    { name: t('sidebar.flights'), href: '/flight', icon: Plane },
  ];

  if (effectiveUser?.role === 'admin' || effectiveUser?.role === 'coach') {
    defaultNavigation.push({ name: t('sidebar.myClients'), href: '/coach/clients', icon: Users });
  }

  defaultNavigation.push({ name: t('profile'), href: '/profile', icon: User });
  defaultNavigation.push({ name: t('settings'), href: '/settings', icon: Settings });

  const navigation = propsNavigation || defaultNavigation;
  const currentPath = pathname || '';

  const handleSignOut = async () => {
    await signOut();
  };

  const extraContent = null;

  return (
    <>
      <ModernSidebar
        navigation={navigation}
        user={effectiveUser}
        pathname={pathname || ''}
        currentPath={currentPath}
        onSignOut={handleSignOut}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        className="fixed inset-y-0 left-0 z-30 hidden lg:block"
        extraContent={extraContent}
      />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] shadow-2xl">
            <ModernSidebar
              navigation={navigation}
              user={effectiveUser}
              pathname={pathname || ''}
              currentPath={currentPath}
              onSignOut={handleSignOut}
              isMobile={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
              extraContent={extraContent}
            />
          </div>
        </div>
      )}
    </>
  );
}
