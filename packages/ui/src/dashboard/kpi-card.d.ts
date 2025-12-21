export interface KpiCardProps {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'flat';
    icon?: React.ComponentType<{
        className?: string;
    }>;
    color?: 'blue' | 'violet' | 'emerald' | 'amber' | 'neutral';
}
export declare function KpiCard({ label, value, change, trend, icon: Icon, color, }: KpiCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=kpi-card.d.ts.map