'use client';

import { useAppNavigation } from '@giulio-leone/hooks';
import { useTranslations } from 'next-intl';
import { OneDashboardLayout } from '@giulio-leone/one-dashboard';
import type { AuthenticatedUser } from "@giulio-leone/types/core";

interface AdminShellProps {
  children: React.ReactNode;
  user: AuthenticatedUser;
}

export function AdminShell({ children, user }: AdminShellProps) {
  const navigation = useAppNavigation(user?.role);
  const tHeader = useTranslations('ui.header');

  const headerLabels = {
    openMenu: tHeader('openMenu'),
    copilotEnabled: tHeader('copilotEnabled'),
    copilotDisabled: tHeader('copilotDisabled'),
    enableCopilot: tHeader('enableCopilot'),
    disableCopilot: tHeader('disableCopilot'),
    updateError: tHeader('updateError'),
  };

  return (
    <OneDashboardLayout user={user} navigation={navigation} labels={{ header: headerLabels }}>
      {children}
    </OneDashboardLayout>
  );
}
