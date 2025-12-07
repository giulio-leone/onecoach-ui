import React from 'react';
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    bordered?: boolean;
}
export declare function Avatar({ src, alt, fallback, size, bordered, className, ...props }: AvatarProps): import("react/jsx-runtime").JSX.Element;
