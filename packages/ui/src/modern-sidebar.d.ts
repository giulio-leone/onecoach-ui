import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
export declare const SIDEBAR_WIDTH = 280;
export declare const SIDEBAR_COLLAPSED_WIDTH = 80;
export interface SidebarNavigationItem {
    name: string;
    href?: string;
    icon: LucideIcon;
    badge?: string;
    children?: SidebarNavigationItem[];
    defaultOpen?: boolean;
}
interface UserProfile {
    name: string | null;
    email: string;
    image?: string | null;
    role?: string;
    credits?: number;
}
interface ModernSidebarProps {
    navigation: SidebarNavigationItem[];
    user?: UserProfile;
    pathname: string;
    /**
     * Percorso corrente con query string (es. /admin/ai-settings?section=providers)
     * per evidenziare correttamente le sottovoci che usano parametri.
     */
    currentPath?: string;
    onSignOut?: () => void;
    className?: string;
    isMobile?: boolean;
    onCloseMobile?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    extraContent?: ReactNode;
}
export declare function ModernSidebar({ navigation, user, pathname, currentPath, onSignOut, className, isMobile, onCloseMobile, isCollapsed: controlledIsCollapsed, onToggleCollapse, extraContent, }: ModernSidebarProps): import("react/jsx-runtime").JSX.Element;
export {};
