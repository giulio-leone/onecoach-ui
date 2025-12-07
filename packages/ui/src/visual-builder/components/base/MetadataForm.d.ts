/**
 * MetadataForm Component
 *
 * Generic metadata form component for visual builders
 * Configurable fields for different entity types
 * Fully optimized for dark mode
 */
import React from 'react';
export interface MetadataField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select';
    value: string | number;
    onChange: (value: string | number) => void;
    options?: Array<{
        value: string;
        label: string;
    }>;
    min?: number;
    max?: number;
    placeholder?: string;
    disabled?: boolean;
}
export interface MetadataFormProps {
    fields: MetadataField[];
    className?: string;
    columns?: 1 | 2 | 3 | 4;
    renderCustomField?: (field: MetadataField) => React.ReactNode;
}
export declare function MetadataForm({ fields, className, columns, renderCustomField, }: MetadataFormProps): import("react/jsx-runtime").JSX.Element;
