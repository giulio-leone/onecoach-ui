'use client';

import React from 'react';
import {
  AppShellHeader,
  AppShellMainContent,
  AppShellSidebar,
  type AppShellHeaderLabels,
  type SidebarNavigationItem,
} from '@giulio-leone/ui';
import type { AuthenticatedUser } from "@giulio-leone/types/core";

export interface OneDashboardLabels {
  header: AppShellHeaderLabels;
}

export interface OneDashboardLayoutProps {
  children: React.ReactNode;
  user: AuthenticatedUser;
  navigation: SidebarNavigationItem[];
  labels: OneDashboardLabels;
}

export function OneDashboardLayout({
  children,
  user,
  navigation,
  labels,
}: OneDashboardLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 dark:bg-[#09090b]">
      <AppShellSidebar user={user} navigation={navigation} />
      <AppShellMainContent className="p-0">
        <AppShellHeader labels={labels.header} />
        {children}
      </AppShellMainContent>
    </div>
  );
}
