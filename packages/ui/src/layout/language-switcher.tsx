'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from './navigation';
import { locales, type Locale } from '@giulio-leone/translations';
import { saveLanguagePreference } from '@giulio-leone/hooks';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = async (newLocale: Locale) => {
    await saveLanguagePreference(newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      value={locale}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value as Locale)}
      className="rounded border border-gray-300 bg-transparent px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {locales.map((loc: any) => (
        <option key={loc} value={loc}>
          {loc === 'en' ? 'EN' : 'IT'}
        </option>
      ))}
    </select>
  );
}
