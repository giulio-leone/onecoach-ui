'use client';

import { AppShellSidebar } from '../app-shell';
import { useAppNavigation } from '@giulio-leone/hooks';
import type { AuthenticatedUser } from "@giulio-leone/types/core";

interface AppSidebarProps {
  user: AuthenticatedUser;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const navigation = useAppNavigation(user?.role);

  return <AppShellSidebar user={user} navigation={navigation} />;
}
