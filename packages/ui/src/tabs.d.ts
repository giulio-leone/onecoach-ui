import React from 'react';
export interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}
export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}
export interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}
export interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}
export declare function Tabs({ defaultValue, children, className, value, onValueChange }: TabsProps): import("react/jsx-runtime").JSX.Element;
export declare function TabsList({ children, className }: TabsListProps): import("react/jsx-runtime").JSX.Element;
export declare function TabsTrigger({ value, children, className }: TabsTriggerProps): import("react/jsx-runtime").JSX.Element;
export declare function TabsContent({ value, children, className }: TabsContentProps): import("react/jsx-runtime").JSX.Element | null;
