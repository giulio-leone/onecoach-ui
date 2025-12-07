import { type PressableProps } from 'react-native';
type Variant = 'primary' | 'secondary' | 'ghost';
export type XButtonProps = PressableProps & {
    label: string;
    variant?: Variant;
};
/**
 * XButton - cross-platform button.
 * Web delega al DS Button, native usa Pressable.
 */
export declare function XButton({ label, variant, ...props }: XButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
