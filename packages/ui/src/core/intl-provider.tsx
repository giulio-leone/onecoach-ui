'use client';

import { NextIntlClientProvider } from 'next-intl';
import { messages, type Locale, defaultLocale } from '@giulio-leone/translations';
import React from 'react';

interface IntlProviderProps {
  locale: string;
  children: React.ReactNode;
}

export function IntlProvider({ locale, children }: IntlProviderProps) {
  // Use default if provided locale is invalid
  const activeLocale = (['en', 'it'].includes(locale) ? locale : defaultLocale) as Locale;

  return (
    <NextIntlClientProvider locale={activeLocale} messages={messages[activeLocale]} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
