import type { LucideIcon } from 'lucide-react';
interface SidebarItemProps {
    name: string;
    href: string;
    icon: LucideIcon;
    isActive?: boolean;
    isCollapsed?: boolean;
    badge?: string;
    onClick?: () => void;
    depth?: number;
}
export declare function SidebarItem({ name, href, icon: Icon, isActive, isCollapsed, badge, onClick, depth, }: SidebarItemProps): import("react/jsx-runtime").JSX.Element;
export {};
