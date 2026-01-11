'use client';

import { useAppNavigation } from '@/hooks/use-app-navigation';
import { useTranslations } from 'next-intl';
import { OneDashboardLayout } from '@onecoach/one-dashboard';
import type { AuthenticatedUser } from "@onecoach/types-core";

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
