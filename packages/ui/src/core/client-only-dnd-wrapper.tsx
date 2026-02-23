'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * ClientOnlyDndWrapper
 *
 * Wrapper component that renders DnD Kit components only on the client side
 * to avoid hydration mismatches caused by dynamic ID generation.
 *
 * During SSR, renders a static fallback. After hydration, renders the DnD components.
 */
interface ClientOnlyDndWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnlyDndWrapper({ children, fallback = null }: ClientOnlyDndWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
