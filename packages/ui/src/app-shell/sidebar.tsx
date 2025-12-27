'use client';

/**
 * AppShell Sidebar
 *
 * Navigazione responsive per le aree protette/admin.
 * Incapsula la logica di collapsible sidebar, mobile overlay
 * e deduplicazione delle rotte per evitare chiavi duplicate.
 */

import { useEffect, startTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  MessageSquare,
  Dumbbell,
  Apple,
  CreditCard,
  Shield,
  ShoppingCart,
  Receipt,
  User,
  BarChart3,
  Users,
  GraduationCap,
  TrendingUp,
  ShoppingBag,
  Calendar,
  FileText,
  Sparkles,
  UserCircle,
  CheckCircle2,
  Bot,
  Settings,
  Wand2,
  Activity,
  Plane,
} from 'lucide-react';
import { ModernSidebar, type SidebarNavigationItem } from '../modern-sidebar';
import { useUIStore, useAuthStore, useSidebarStore } from '@onecoach/lib-stores';
import { isAdminRole, isCoachRole } from '@onecoach/types';
import type { AuthenticatedUser } from '@onecoach/types';
import { useSignOut } from '@onecoach/lib-api/hooks';

export interface AppShellSidebarProps {
  user: AuthenticatedUser;
}

// Deduplica voci di navigazione con lo stesso href per evitare chiavi duplicate
function dedupeNavigation(items: SidebarNavigationItem[]): SidebarNavigationItem[] {
  const seen = new Set<string>();

  const visit = (item: SidebarNavigationItem): SidebarNavigationItem | null => {
    const children = item.children?.map(visit).filter(Boolean) as
      | SidebarNavigationItem[]
      | undefined;

    if (item.href) {
      if (seen.has(item.href)) return null;
      seen.add(item.href);
    }

    return { ...item, children };
  };

  return items.map(visit).filter((item): item is SidebarNavigationItem => Boolean(item));
}

function getNavigationItems(
  userRole: string | undefined | null,
  pathname: string,
  t: (key: string) => string
) {
  // Base navigation sections
  const PERSONAL_NAVIGATION: SidebarNavigationItem = {
    name: t('personalArea'),
    icon: LayoutDashboard,
    defaultOpen: true,
    children: [
      { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
      { name: t('agenda'), href: '/oneagenda', icon: Calendar },
      { name: t('flights'), href: '/flight', icon: Plane, badge: 'AI' },
      { name: t('messages'), href: '/messages', icon: MessageSquare },
      { name: t('aiChat'), href: '/chat', icon: MessageSquare, badge: 'AI' },
      { name: t('profile'), href: '/profile', icon: User },
    ],
  };

  const FITNESS_NAVIGATION: SidebarNavigationItem = {
    name: t('trainingNutrition'),
    icon: Dumbbell,
    children: [
      { name: t('programs'), href: '/workouts', icon: Dumbbell },
      { name: t('nutrition'), href: '/nutrition', icon: Apple },
    ],
  };

  const INSIGHTS_NAVIGATION: SidebarNavigationItem = {
    name: t('insights'),
    icon: BarChart3,
    children: [{ name: t('analytics'), href: '/analytics', icon: BarChart3 }],
  };

  const BUSINESS_NAVIGATION: SidebarNavigationItem = {
    name: t('business'),
    icon: ShoppingBag,
    children: [
      { name: t('pricing'), href: '/pricing', icon: CreditCard },
      { name: t('marketplace'), href: '/marketplace', icon: ShoppingBag },
      { name: t('affiliations'), href: '/affiliations', icon: Users },
    ],
  };

  const BASE_NAVIGATION_SECTIONS: SidebarNavigationItem[] = [
    PERSONAL_NAVIGATION,
    FITNESS_NAVIGATION,
    INSIGHTS_NAVIGATION,
    BUSINESS_NAVIGATION,
  ];

  // Coach-specific navigation
  const COACH_NAVIGATION: SidebarNavigationItem = {
    name: t('coachArea'),
    icon: GraduationCap,
    badge: 'Coach',
    children: [
      { name: t('coachDashboard'), href: '/coach/dashboard', icon: GraduationCap },
      { name: t('myClients'), href: '/coach/clients', icon: Users },
      { name: t('coachAnalytics'), href: '/coach/analytics', icon: TrendingUp },
      { name: t('myProfile'), href: '/coach/profile', icon: UserCircle },
      { name: t('vetting'), href: '/coach/vetting', icon: CheckCircle2 },
    ],
  };

  // Admin-specific navigation
  const ADMIN_NAVIGATION: SidebarNavigationItem = {
    name: t('adminArea'),
    icon: Shield,
    badge: 'Admin',
    children: [
      { name: t('adminDashboard'), href: '/admin', icon: LayoutDashboard },
      { name: t('coachArea'), href: '/coach/dashboard', icon: GraduationCap, badge: 'Coach' },
      { name: t('users'), href: '/admin/users', icon: Users },
      { name: t('subscriptions'), href: '/admin/subscriptions', icon: CreditCard },
      { name: t('exercisesCatalog'), href: '/admin/exercises', icon: Dumbbell },
      { name: t('foodsCatalog'), href: '/admin/foods', icon: Apple },
      { name: t('analytics'), href: '/admin/analytics', icon: BarChart3 },
      { name: t('systemPrompts'), href: '/admin/prompts', icon: FileText },
      {
        name: t('commerce'),
        href: '/admin/carts',
        icon: ShoppingBag,
        children: [
          { name: t('carts'), href: '/admin/carts', icon: ShoppingCart },
          { name: t('orders'), href: '/admin/orders', icon: Receipt },
          { name: t('checkoutSettings'), href: '/admin/checkout', icon: CreditCard },
        ],
      },
      {
        name: t('aiSettings'),
        href: '/admin/ai-settings',
        icon: Sparkles,
        defaultOpen: true,
        children: [
          { name: t('providersKeys'), href: '/admin/ai-settings?section=providers', icon: Shield },
          { name: t('modelsAccess'), href: '/admin/ai-settings?section=models', icon: Bot },
          { name: t('featureToggles'), href: '/admin/ai-settings?section=features', icon: Settings },
          { name: t('systemPrompts'), href: '/admin/ai-settings?section=prompts', icon: FileText },
          { name: t('frameworkAgents'), href: '/admin/ai-settings?section=framework', icon: Wand2 },
          { name: t('billingCredits'), href: '/admin/ai-settings?section=billing', icon: CreditCard },
          { name: t('featureFlags'), href: '/admin/ai-settings?section=flags', icon: Activity },
          { name: t('edgeConfig'), href: '/admin/ai-settings?section=edge', icon: Settings },
          { name: t('analytics'), href: '/admin/ai-settings?section=analytics', icon: BarChart3 },
          {
            name: t('conversations'),
            href: '/admin/ai-settings?section=conversations',
            icon: MessageSquare,
          },
        ],
      },
    ],
  };

  // Se l'utente è admin e si trova in /admin mostra solo nav admin + link back
  if (isAdminRole(userRole) && pathname.startsWith('/admin')) {
    return dedupeNavigation([
      { ...ADMIN_NAVIGATION, defaultOpen: true },
      { name: t('backToApp'), href: '/dashboard', icon: LayoutDashboard, badge: 'App' },
    ]);
  }

  const items: SidebarNavigationItem[] = [...BASE_NAVIGATION_SECTIONS];

  if (isAdminRole(userRole)) {
    items.push({ ...ADMIN_NAVIGATION, defaultOpen: false });
  }

  if (isCoachRole(userRole)) {
    items.push(COACH_NAVIGATION);
  }

  return dedupeNavigation(items);
}

export function AppShellSidebar({ user }: AppShellSidebarProps) {
  const t = useTranslations('navigation.sidebar');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
  const { sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { setUser, user: clientUser } = useAuthStore();
  const { extraContent } = useSidebarStore();
  const signOut = useSignOut();

  // Sync user to client store
  useEffect(() => {
    if (user) {
      setUser({
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role as 'USER' | 'ATHLETE' | 'COACH' | 'ADMIN' | 'SUPER_ADMIN',
        profileImage: user.image || undefined,
        copilotEnabled: user.copilotEnabled,
        credits: user.credits,
      });
    }
  }, [user, setUser]);

  // Map isOpen to isCollapsed (inverted logic: sidebarOpen = !isCollapsed)
  const isCollapsed = !sidebarOpen;
  const setIsCollapsed = (collapsed: boolean) => setSidebarOpen(!collapsed);

  // Close mobile menu on route change
  useEffect(() => {
    startTransition(() => setMobileMenuOpen(false));
  }, [pathname, setMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Usa l'utente proveniente dallo store (aggiornato in realtime) se disponibile,
  // ma SEMPRE prendi il ruolo dal server user per garantire che admin/coach siano visibili
  // Il clientUser potrebbe avere dati stale dalla persistenza localStorage
  const effectiveUser = clientUser
    ? { ...clientUser, role: user.role } // Merge con l'utente dallo store (aggiornato in realtime)
    : user;
  const navigation = getNavigationItems(effectiveUser?.role, pathname, t);

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
