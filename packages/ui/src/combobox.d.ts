import React from 'react';
export interface ComboboxOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
}
export interface ComboboxProps {
    options: ComboboxOption[];
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    multiple?: boolean;
    className?: string;
    disabled?: boolean;
}
export declare const Combobox: ({ options, value, onChange, placeholder, searchPlaceholder, multiple, className, disabled, }: ComboboxProps) => import("react/jsx-runtime").JSX.Element;
