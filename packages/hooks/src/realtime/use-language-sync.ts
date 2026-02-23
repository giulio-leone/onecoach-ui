'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { type Locale } from '@giulio-leone/translations';

const LOCALE_STORAGE_KEY = 'onecoach-locale';

export function useLanguageSync() {
  const { data: session } = useSession();
  const locale = useLocale();

  // Sync DB → localStorage on login
  useEffect(() => {
    if (!session?.user) return;

    fetch('/api/user/preferences')
      .then((res) => res.json())
      .then((data) => {
        if (data.preferredLocale && data.preferredLocale !== locale) {
          localStorage.setItem(LOCALE_STORAGE_KEY, data.preferredLocale);
          window.location.reload(); // Reload to apply new locale
        }
      })
      .catch(console.error);
  }, [session?.user, locale]);
}

export async function saveLanguagePreference(locale: Locale) {
  // 1. Save to localStorage (immediate)
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);

  // 2. Save to cookie (for SSR/Middleware)
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${oneYear}; SameSite=Lax`;

  // 3. Sync to DB (background, for authenticated users)
  try {
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLocale: locale }),
    });
  } catch {
    // Silently fail - localStorage is already saved
  }
}
