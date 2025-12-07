import { type PressableProps, type ViewProps } from 'react-native';
type XCardProps = (PressableProps & {
    heading?: string;
    description?: string;
}) | (ViewProps & {
    heading?: string;
    description?: string;
});
/**
 * XCard - cross-platform card. Web usa Card DS, native usa View/Pressable.
 */
export declare function XCard({ heading, description, ...props }: XCardProps): import("react/jsx-runtime").JSX.Element;
export {};
