interface SliderProps {
    value: number[];
    min: number;
    max: number;
    step: number;
    onValueChange: (value: number[]) => void;
    disabled?: boolean;
    className?: string;
}
export declare function Slider({ value, min, max, step, onValueChange, disabled, className }: SliderProps): import("react/jsx-runtime").JSX.Element;
export {};
