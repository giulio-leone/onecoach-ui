import React from 'react';
interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ElementType;
    subtitle?: string;
    color?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | string;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    className?: string;
}
declare function StatCardComponent({ label, value, icon: Icon, subtitle, color, trend, className, }: StatCardProps): import("react/jsx-runtime").JSX.Element;
export { StatCardComponent as StatCard };
