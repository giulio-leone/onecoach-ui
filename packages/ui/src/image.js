import { jsx as _jsx } from "react/jsx-runtime";
import { Image as ExpoImage } from 'expo-image';
export function Image({ src, source, width, height, alt, ...rest }) {
    const resolvedSource = source ?? (src ? { uri: src } : undefined);
    if (!resolvedSource) {
        return null;
    }
    return _jsx(ExpoImage, { ...rest, source: resolvedSource, accessibilityLabel: alt });
}
export default Image;
