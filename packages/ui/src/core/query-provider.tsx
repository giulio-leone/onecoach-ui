'use client';

import { QueryProvider as SharedQueryProvider } from '@giulio-leone/lib-api/react-query';
import type { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Next.js Query Provider
 *
 * Wrapper around the shared QueryProvider from lib/api/react-query
 * Uses the standardized configuration for consistency across platforms
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <SharedQueryProvider>{children}</SharedQueryProvider>;
}
