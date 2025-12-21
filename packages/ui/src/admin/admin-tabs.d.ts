export interface AdminTab {
    id: string;
    label: string;
    count?: number;
    badge?: string;
    disabled?: boolean;
}
interface AdminTabsProps {
    tabs: AdminTab[];
    defaultTab?: string;
    onTabChange?: (tabId: string) => void;
    className?: string;
}
export declare function AdminTabs({ tabs, defaultTab, onTabChange, className }: AdminTabsProps): import("react/jsx-runtime").JSX.Element;
/**
 * Tab Panel Component
 * Wrapper per contenuto di ogni tab
 * Se activeTab non è fornito come prop, lo legge dall'URL hash per evitare conflitti di stato
 */
interface AdminTabPanelProps {
    children: React.ReactNode;
    tabId: string;
    activeTab?: string;
    className?: string;
}
export declare function AdminTabPanel({ children, tabId, activeTab: propActiveTab, className, }: AdminTabPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=admin-tabs.d.ts.map