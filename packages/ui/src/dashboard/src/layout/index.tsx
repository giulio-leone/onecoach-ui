'use client';

import React from 'react';
import { AppShellHeader, AppShellMainContent, AppShellSidebar, type AppShellHeaderLabels } from '../../../app-shell';
import { type SidebarNavigationItem } from '../../../modern-sidebar';
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
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 dark:bg-neutral-900">
      <AppShellSidebar user={user} navigation={navigation} />
      <AppShellMainContent className="p-0">
        <AppShellHeader labels={labels.header} />
        {children}
      </AppShellMainContent>
    </div>
  );
}
