'use client';

/**
 * React Native Web Polyfill Provider
 *
 * This component ensures that Appearance.getColorScheme is available
 * for theme detection.
 */
import { useEffect } from 'react';

import { logger } from '@giulio-leone/lib-shared';
export function ReactNativeWebPolyfill() {
  useEffect(() => {
    // Import and setup the polyfill on client side only
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid SSR issues
        // import('../../lib/polyfills/react-native-web-appearance');
      } catch (error: unknown) {
        logger.warn('Failed to load react-native-web Appearance polyfill:', error);
      }
    }
  }, []);

  return null;
}
