export interface ModelOption {
    id: string;
    name: string;
    provider: string;
}
interface ModelSelectorProps {
    value: string | null | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}
export declare function ModelSelector({ value, onChange, placeholder, className, }: ModelSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
