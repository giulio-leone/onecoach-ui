import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '@giulio-leone/translations';

export const routing = defineRouting({
  locales,
  defaultLocale,
});
