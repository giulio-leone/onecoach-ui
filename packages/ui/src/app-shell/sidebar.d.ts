import type { AuthenticatedUser } from '@OneCoach/lib-core/auth/session';
export interface AppShellSidebarProps {
    user: AuthenticatedUser;
}
export declare function AppShellSidebar({ user }: AppShellSidebarProps): import("react/jsx-runtime").JSX.Element;
