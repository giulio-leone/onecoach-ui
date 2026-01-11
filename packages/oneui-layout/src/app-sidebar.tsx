'use client';

import { AppShellSidebar } from '@onecoach/ui';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import type { AuthenticatedUser } from "@onecoach/types-core";

interface AppSidebarProps {
  user: AuthenticatedUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const navigation = useAppNavigation(user?.role);

  return <AppShellSidebar user={user} navigation={navigation} />;
}
