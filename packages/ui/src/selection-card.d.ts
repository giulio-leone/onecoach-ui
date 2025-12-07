/**
 * SelectionCard Component - Web
 *
 * Web version using HTML elements instead of React Native components
 */
import React from 'react';
export interface SelectionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    description?: string;
    selected?: boolean;
    icon?: React.ReactNode;
    image?: string;
    className?: string;
    badge?: string;
    onPress?: () => void;
}
export declare function SelectionCard({ title, description, selected, icon, image, className, badge, onClick, onPress, ...props }: SelectionCardProps): import("react/jsx-runtime").JSX.Element;
