interface ProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    color?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}
export declare function ProgressBar({ value, max, className, color, showLabel, size, }: ProgressBarProps): import("react/jsx-runtime").JSX.Element;
export {};
