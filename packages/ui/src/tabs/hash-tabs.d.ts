import { type AdminTab } from '../admin/admin-tabs';
export type HashTab = AdminTab;
export interface HashTabsProps {
    tabs: HashTab[];
    defaultTab?: string;
    onTabChange?: (tabId: string) => void;
    className?: string;
}
export declare function HashTabs(props: HashTabsProps): import("react/jsx-runtime").JSX.Element;
export interface HashTabPanelProps {
    children: React.ReactNode;
    tabId: string;
    activeTab?: string;
    className?: string;
}
export declare function HashTabPanel(props: HashTabPanelProps): import("react/jsx-runtime").JSX.Element;
