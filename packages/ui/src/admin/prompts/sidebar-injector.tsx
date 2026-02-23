'use client';

import { useEffect, memo } from 'react';
import { useSidebarStore } from '@giulio-leone/lib-stores';
import type { ReactNode } from 'react';

interface SidebarInjectorProps {
  content: ReactNode;
}

export const SidebarInjector = memo(function SidebarInjector({ content }: SidebarInjectorProps) {
  const setExtraContent = useSidebarStore((state) => state.setExtraContent);

  useEffect(() => {
    setExtraContent(content);
    return () => setExtraContent(null);
  }, [content, setExtraContent]);

  return null;
});
