'use client';

import { useMemo } from 'react';
import { createTranslator } from 'next-intl';

import { usePathname as useNextPathname } from 'next/navigation';
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
import { defaultLocale, locales, messages, type Locale } from '@giulio-leone/translations';
import type { SidebarNavigationItem } from '@giulio-leone/ui';
import { isAdminRole } from '@giulio-leone/types/core';
import { isCoachRole } from '@giulio-leone/lib-core/auth/roles';

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

const deriveLocaleFromPathname = (pathname: string): Locale => {
  const firstSegment = pathname.replace(/^\/+/, '').split('/')[0];
  const candidate = locales.find((locale: any) => locale === firstSegment);

  return (candidate ?? defaultLocale) as Locale;
};

export function useAppNavigation(userRole?: string | null) {
  // Fallback pathname from next/navigation (always available)
  const fallbackPathname = useNextPathname();

  // Determine locale from pathname (always safe)
  const pathname = fallbackPathname;
  const locale = deriveLocaleFromPathname(pathname);

  // Always use manual translator creation to avoid conditional hook usage.
  // We use useMemo to optimize re-creation. This ensures we work both with and without IntlProvider context.
  // Note: createTranslator is synchronous for loaded messages.
  const t = useMemo(() => {
    return createTranslator({
      locale,
      namespace: 'navigation.sidebar',
      messages: messages[locale],
    });
  }, [locale]);

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
          { name: t('generationMonitor'), href: '/admin/generation', icon: Activity },
          { name: t('providersKeys'), href: '/admin/ai-settings?section=providers', icon: Shield },
          { name: t('modelsAccess'), href: '/admin/ai-settings?section=models', icon: Bot },
          {
            name: t('featureToggles'),
            href: '/admin/ai-settings?section=features',
            icon: Settings,
          },
          { name: t('systemPrompts'), href: '/admin/ai-settings?section=prompts', icon: FileText },
          { name: t('frameworkAgents'), href: '/admin/ai-settings?section=framework', icon: Wand2 },
          {
            name: t('billingCredits'),
            href: '/admin/ai-settings?section=billing',
            icon: CreditCard,
          },
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

  // Logic to build navigation based on role and path
  if (isAdminRole(userRole) && pathname?.startsWith('/admin')) {
    return dedupeNavigation([
      { ...ADMIN_NAVIGATION, defaultOpen: true },
      { name: t('backToApp'), href: '/dashboard', icon: LayoutDashboard, badge: 'App' },
    ]);
  }

  const items: SidebarNavigationItem[] = [
    PERSONAL_NAVIGATION,
    FITNESS_NAVIGATION,
    INSIGHTS_NAVIGATION,
    BUSINESS_NAVIGATION,
  ];

  if (isAdminRole(userRole)) {
    items.push({ ...ADMIN_NAVIGATION, defaultOpen: false });
  }

  if (isCoachRole(userRole)) {
    items.push(COACH_NAVIGATION);
  }

  return dedupeNavigation(items);
}
