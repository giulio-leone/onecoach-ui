'use client';

import { useState, useCallback } from 'react';

export interface AdminModeState {
  isAdmin: boolean;
  toggle: () => void;
}

export function useAdminMode(defaultValue = false): AdminModeState {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem('onecoach-admin-mode');
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const toggle = useCallback(() => {
    setIsAdmin((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('onecoach-admin-mode', JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { isAdmin, toggle };
}
