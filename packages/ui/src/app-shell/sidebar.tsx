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

// Base navigation sections
const PERSONAL_NAVIGATION: SidebarNavigationItem = {
  name: 'Area Personale',
  icon: LayoutDashboard,
  defaultOpen: true,
  children: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agenda', href: '/oneagenda', icon: Calendar },
    { name: 'Messaggi', href: '/messages', icon: MessageSquare },
    { name: 'Chat AI', href: '/chat', icon: MessageSquare, badge: 'AI' },
    { name: 'Profilo', href: '/profile', icon: User },
  ],
};

const FITNESS_NAVIGATION: SidebarNavigationItem = {
  name: 'Allenamento & Nutrizione',
  icon: Dumbbell,
  children: [
    { name: 'Programmi', href: '/workouts', icon: Dumbbell },
    { name: 'Nutrizione', href: '/nutrition', icon: Apple },
  ],
};

const INSIGHTS_NAVIGATION: SidebarNavigationItem = {
  name: 'Insights',
  icon: BarChart3,
  children: [{ name: 'Analytics', href: '/analytics', icon: BarChart3 }],
};

const BUSINESS_NAVIGATION: SidebarNavigationItem = {
  name: 'Business',
  icon: ShoppingBag,
  children: [
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Affiliazioni', href: '/affiliations', icon: Users },
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
  name: 'Area Coach',
  icon: GraduationCap,
  badge: 'Coach',
  children: [
    { name: 'Coach Dashboard', href: '/coach/dashboard', icon: GraduationCap },
    { name: 'I Miei Clienti', href: '/coach/clients', icon: Users },
    { name: 'Coach Analytics', href: '/coach/analytics', icon: TrendingUp },
    { name: 'Il Mio Profilo', href: '/coach/profile', icon: UserCircle },
    { name: 'Verifica Account', href: '/coach/vetting', icon: CheckCircle2 },
  ],
};

// Admin-specific navigation
const ADMIN_NAVIGATION: SidebarNavigationItem = {
  name: 'Area Admin',
  icon: Shield,
  badge: 'Admin',
  children: [
    { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Area Coach', href: '/coach/dashboard', icon: GraduationCap, badge: 'Coach' },
    { name: 'Utenti', href: '/admin/users', icon: Users },
    { name: 'Abbonamenti', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Catalogo Esercizi', href: '/admin/exercises', icon: Dumbbell },
    { name: 'Catalogo Alimenti', href: '/admin/foods', icon: Apple },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System Prompts', href: '/admin/prompts', icon: FileText },
    {
      name: 'Commerce',
      href: '/admin/carts',
      icon: ShoppingBag,
      children: [
        { name: 'Carts', href: '/admin/carts', icon: ShoppingCart },
        { name: 'Orders', href: '/admin/orders', icon: Receipt },
        { name: 'Checkout Settings', href: '/admin/checkout', icon: CreditCard },
      ],
    },
    {
      name: 'AI Settings',
      href: '/admin/ai-settings',
      icon: Sparkles,
      defaultOpen: true,
      children: [
        { name: 'Provider & API Keys', href: '/admin/ai-settings?section=providers', icon: Shield },
        { name: 'Modelli & Accessi', href: '/admin/ai-settings?section=models', icon: Bot },
        { name: 'Feature Toggles', href: '/admin/ai-settings?section=features', icon: Settings },
        { name: 'System Prompts', href: '/admin/ai-settings?section=prompts', icon: FileText },
        { name: 'Framework & Agents', href: '/admin/ai-settings?section=framework', icon: Wand2 },
        { name: 'Billing & Crediti', href: '/admin/ai-settings?section=billing', icon: CreditCard },
        { name: 'Feature Flags', href: '/admin/ai-settings?section=flags', icon: Activity },
        { name: 'Edge Config', href: '/admin/ai-settings?section=edge', icon: Settings },
        { name: 'Analytics', href: '/admin/ai-settings?section=analytics', icon: BarChart3 },
        {
          name: 'Conversazioni',
          href: '/admin/ai-settings?section=conversations',
          icon: MessageSquare,
        },
      ],
    },
  ],
};

function getNavigationItems(userRole: string | undefined | null, pathname: string) {
  // Se l'utente è admin e si trova in /admin mostra solo nav admin + link back
  if (isAdminRole(userRole) && pathname.startsWith('/admin')) {
    return dedupeNavigation([
      { ...ADMIN_NAVIGATION, defaultOpen: true },
      { name: 'Torna alla App', href: '/dashboard', icon: LayoutDashboard, badge: 'App' },
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
        role: user.role,
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

  // Usa l'utente proveniente dallo store (aggiornato in realtime) se disponibile
  const effectiveUser = clientUser ?? user;
  const navigation = getNavigationItems(effectiveUser?.role, pathname);

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
