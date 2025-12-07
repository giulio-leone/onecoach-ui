import type { TextInputProps } from 'react-native';
export interface FormInputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    containerClassName?: string;
    className?: string;
}
export declare function FormInput({ label, error, icon, containerClassName, className, ...props }: FormInputProps): import("react/jsx-runtime").JSX.Element;
